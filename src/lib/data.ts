// Data access: openfootball schedule + ESPN live scores, merged into Fixtures.
//
// openfootball is public-domain on GitHub's CDN (CORS-safe, fetched directly).
// ESPN's scoreboard is reached through a same-origin proxy ("/espn/...") so the
// browser never makes a cross-origin request — the Vite dev server proxies it in
// development and a vercel.json rewrite proxies it in production. This sidesteps
// any CORS restriction. If ESPN is unreachable the schedule still renders fully;
// only live scores degrade.

import type {
  Fixture,
  MatchResult,
  MatchStatus,
  MatchStatData,
  GoalEvent,
  CardEvent,
  TeamStatLine,
  OpenFootballFile,
} from './types'
import { parseKickoff, zagrebDayKey, espnDateForInstant } from './time'
import { canonicalTeam, isPlaceholder } from './teams'

const SCHEDULE_URL =
  'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json'

// Same-origin path; rewritten to https://site.api.espn.com/... by the proxy.
const espnUrl = (dateParam: string) =>
  `/espn/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${dateParam}`

/** Stable, source-independent key for a match: its date + unordered team pair. */
function pairKey(dateParam: string, a: string, b: string): string {
  return `${dateParam}|${[canonicalTeam(a), canonicalTeam(b)].sort().join('|')}`
}

/**
 * Normalise the openfootball file into canonical Fixtures. Pure (no network) so
 * it can be unit-tested. The id is derived from the match's position in the file
 * — openfootball omits the `num` field on most 2026 matches, so relying on it
 * produced duplicate ids ("mundefined") that collided across every fixture.
 */
export function parseSchedule(data: OpenFootballFile): Fixture[] {
  const fixtures: Fixture[] = []
  data.matches.forEach((m, i) => {
    const kickoff = parseKickoff(m.date, m.time)
    if (!kickoff) return
    const resolved = !isPlaceholder(m.team1) && !isPlaceholder(m.team2)
    fixtures.push({
      id: `m${m.num ?? i + 1}-${i}`,
      num: m.num ?? i + 1,
      round: m.round,
      group: m.group ?? null,
      ground: m.ground,
      team1: m.team1,
      team2: m.team2,
      kickoff,
      zagrebDay: zagrebDayKey(kickoff),
      resolved,
      result: null,
    })
  })
  fixtures.sort((a, b) => a.kickoff.getTime() - b.kickoff.getTime())
  return fixtures
}

/** Fetch and normalise the openfootball schedule into canonical Fixtures. */
export async function fetchSchedule(): Promise<Fixture[]> {
  const res = await fetch(SCHEDULE_URL)
  if (!res.ok) throw new Error(`Schedule fetch failed: HTTP ${res.status}`)
  const data = (await res.json()) as OpenFootballFile
  return parseSchedule(data)
}

const STATE_MAP: Record<string, MatchStatus> = {
  pre: 'upcoming',
  in: 'live',
  post: 'finished',
}

interface EspnScore {
  status: MatchStatus
  score1: number | null
  score2: number | null
  detail: string
  team1: string
  team2: string
}

/** Fetch the ESPN scoreboard for one US-Eastern date param and parse its events. */
async function fetchEspnDate(dateParam: string): Promise<Map<string, EspnScore>> {
  const out = new Map<string, EspnScore>()
  let json: any
  try {
    const res = await fetch(espnUrl(dateParam))
    if (!res.ok) return out
    json = await res.json()
  } catch {
    return out // network/CORS failure: degrade gracefully, schedule still shows.
  }
  for (const ev of json.events ?? []) {
    const comp = ev.competitions?.[0]
    const competitors = comp?.competitors ?? []
    const home = competitors.find((c: any) => c.homeAway === 'home') ?? competitors[0]
    const away = competitors.find((c: any) => c.homeAway === 'away') ?? competitors[1]
    if (!home || !away) continue
    const state = ev.status?.type?.state as string | undefined
    const status = (state && STATE_MAP[state]) || 'upcoming'
    const toScore = (s: unknown) => (s == null || s === '' ? null : Number(s))
    const entry: EspnScore = {
      status,
      score1: status === 'upcoming' ? null : toScore(home.score),
      score2: status === 'upcoming' ? null : toScore(away.score),
      detail: ev.status?.type?.shortDetail ?? ev.status?.type?.detail ?? '',
      team1: home.team?.displayName ?? home.team?.name ?? '',
      team2: away.team?.displayName ?? away.team?.name ?? '',
    }
    out.set(pairKey(dateParam, entry.team1, entry.team2), entry)
  }
  return out
}

/**
 * Fetch ESPN scores for the given fixtures and return results keyed by fixture id.
 * Only matches that have already kicked off are queried (future days have no
 * scores), and only their distinct US-Eastern dates are requested — so early in
 * the tournament this is one or two calls, not one per match-day.
 */
export async function fetchResults(fixtures: Fixture[]): Promise<Map<string, MatchResult>> {
  const now = Date.now()
  const relevant = fixtures.filter((f) => f.resolved && f.kickoff.getTime() <= now)
  const dates = [...new Set(relevant.map((f) => espnDateForInstant(f.kickoff)))]
  const perDate = await Promise.all(
    dates.map(async (d) => [d, await fetchEspnDate(d)] as const),
  )
  const index = new Map<string, EspnScore>()
  for (const [, m] of perDate) for (const [k, v] of m) index.set(k, v)

  const results = new Map<string, MatchResult>()
  for (const f of relevant) {
    const key = pairKey(espnDateForInstant(f.kickoff), f.team1, f.team2)
    const e = index.get(key)
    if (!e) continue
    // ESPN's home/away may be flipped vs openfootball's team1/team2; align by name.
    const sameOrder = canonicalTeam(e.team1) === canonicalTeam(f.team1)
    results.set(f.id, {
      status: e.status,
      score1: sameOrder ? e.score1 : e.score2,
      score2: sameOrder ? e.score2 : e.score1,
      detail: e.detail,
    })
  }
  return results
}

// --- Statistics data --------------------------------------------------------

function num(stats: any[], name: string): number {
  const s = stats?.find?.((x) => x.name === name)
  const v = s ? Number(s.displayValue) : NaN
  return Number.isFinite(v) ? v : 0
}

/** Parse one finished ESPN competition into MatchStatData (goals, cards, team stats). */
function parseStatMatch(ev: any): MatchStatData | null {
  const comp = ev.competitions?.[0]
  const competitors = comp?.competitors ?? []
  const home = competitors.find((c: any) => c.homeAway === 'home') ?? competitors[0]
  const away = competitors.find((c: any) => c.homeAway === 'away') ?? competitors[1]
  if (!home || !away) return null

  const nameById = new Map<string, string>()
  for (const c of competitors) {
    nameById.set(String(c.team?.id), c.team?.displayName ?? c.team?.name ?? '')
  }
  const teamName = (id: unknown) => nameById.get(String(id)) ?? ''

  const goals: GoalEvent[] = []
  const cards: CardEvent[] = []
  for (const d of comp.details ?? []) {
    const player = d.athletesInvolved?.[0]?.displayName ?? 'Unknown'
    const team = teamName(d.team?.id)
    if (d.scoringPlay) {
      goals.push({
        player,
        team,
        penalty: !!d.penaltyKick || /penalty/i.test(d.type?.text ?? ''),
        ownGoal: !!d.ownGoal,
      })
    }
    if (d.yellowCard || d.redCard) {
      cards.push({ player, team, color: d.redCard ? 'red' : 'yellow' })
    }
  }

  const lineFor = (c: any): TeamStatLine => {
    const poss = num(c.statistics, 'possessionPct')
    return {
      team: c.team?.displayName ?? c.team?.name ?? '',
      possession: c.statistics?.some?.((s: any) => s.name === 'possessionPct') ? poss : null,
      shots: num(c.statistics, 'totalShots'),
      shotsOnTarget: num(c.statistics, 'shotsOnTarget'),
      corners: num(c.statistics, 'wonCorners'),
      fouls: num(c.statistics, 'foulsCommitted'),
    }
  }

  return {
    team1: home.team?.displayName ?? '',
    team2: away.team?.displayName ?? '',
    score1: Number(home.score) || 0,
    score2: Number(away.score) || 0,
    goals,
    cards,
    teamStats: [lineFor(home), lineFor(away)],
  }
}

/**
 * Fetch per-match statistics for every finished match. Reuses the same scoreboard
 * dates as the results path; called lazily by the Statistics page.
 */
export async function fetchStatData(fixtures: Fixture[]): Promise<MatchStatData[]> {
  const now = Date.now()
  const dates = [
    ...new Set(
      fixtures
        .filter((f) => f.resolved && f.kickoff.getTime() <= now)
        .map((f) => espnDateForInstant(f.kickoff)),
    ),
  ]
  const out: MatchStatData[] = []
  await Promise.all(
    dates.map(async (d) => {
      try {
        const res = await fetch(espnUrl(d))
        if (!res.ok) return
        const json = await res.json()
        for (const ev of json.events ?? []) {
          if (ev.status?.type?.state !== 'post') continue // finished matches only
          const parsed = parseStatMatch(ev)
          if (parsed) out.push(parsed)
        }
      } catch {
        /* degrade gracefully */
      }
    }),
  )
  return out
}

export { SCHEDULE_URL }
