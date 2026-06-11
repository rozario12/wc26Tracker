// Pure aggregation of tournament statistics from per-match stat data. Kept free
// of network/DOM so it can be unit-tested. Inputs come from data.ts/fetchStatData.

import type {
  MatchStatData,
  ScorerRow,
  CardRow,
  TeamStatRow,
  TournamentStats,
  TournamentTotals,
} from './types'

export function aggregateStats(data: MatchStatData[]): TournamentStats {
  const scorers = new Map<string, ScorerRow>()
  const cards = new Map<string, CardRow>()
  const teams = new Map<string, TeamStatRow & { possessionSum: number; possessionCount: number }>()

  let totalGoals = 0
  let redCards = 0
  let biggestWin: TournamentTotals['biggestWin'] = null
  let biggestMargin = -1

  for (const m of data) {
    totalGoals += m.score1 + m.score2

    const margin = Math.abs(m.score1 - m.score2)
    if (margin > biggestMargin) {
      biggestMargin = margin
      biggestWin = { team1: m.team1, team2: m.team2, score1: m.score1, score2: m.score2 }
    }

    // Goals → top scorers (own goals excluded from a player's tally).
    for (const g of m.goals) {
      if (g.ownGoal) continue
      const key = `${g.player}|${g.team}`
      const row = scorers.get(key) ?? { player: g.player, team: g.team, goals: 0, penalties: 0 }
      row.goals += 1
      if (g.penalty) row.penalties += 1
      scorers.set(key, row)
    }

    // Cards → disciplinary leaders + tournament red count.
    for (const c of m.cards) {
      if (c.color === 'red') redCards += 1
      const key = `${c.player}|${c.team}`
      const row = cards.get(key) ?? { player: c.player, team: c.team, yellow: 0, red: 0 }
      if (c.color === 'red') row.red += 1
      else row.yellow += 1
      cards.set(key, row)
    }

    // Team stats → per-team aggregates.
    for (const t of m.teamStats) {
      const row =
        teams.get(t.team) ??
        {
          team: t.team,
          matches: 0,
          shots: 0,
          shotsOnTarget: 0,
          corners: 0,
          fouls: 0,
          possession: null,
          possessionSum: 0,
          possessionCount: 0,
        }
      row.matches += 1
      row.shots += t.shots
      row.shotsOnTarget += t.shotsOnTarget
      row.corners += t.corners
      row.fouls += t.fouls
      if (t.possession != null) {
        row.possessionSum += t.possession
        row.possessionCount += 1
      }
      teams.set(t.team, row)
    }
  }

  const scorerRows = [...scorers.values()].sort(
    (a, b) => b.goals - a.goals || a.player.localeCompare(b.player),
  )
  const cardRows = [...cards.values()].sort(
    (a, b) => b.red - a.red || b.yellow - a.yellow || a.player.localeCompare(b.player),
  )
  const teamRows: TeamStatRow[] = [...teams.values()]
    .map((t) => ({
      team: t.team,
      matches: t.matches,
      shots: t.shots,
      shotsOnTarget: t.shotsOnTarget,
      corners: t.corners,
      fouls: t.fouls,
      possession: t.possessionCount ? Math.round(t.possessionSum / t.possessionCount) : null,
    }))
    .sort((a, b) => b.shots - a.shots || a.team.localeCompare(b.team))

  const totals: TournamentTotals = {
    matchesPlayed: data.length,
    totalGoals,
    avgGoals: data.length ? Math.round((totalGoals / data.length) * 100) / 100 : 0,
    redCards,
    biggestWin: biggestMargin > 0 ? biggestWin : null,
  }

  return { scorers: scorerRows, cards: cardRows, teamStats: teamRows, totals }
}
