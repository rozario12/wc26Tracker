// Compute group standings client-side from finished match results.
//
// Standings are themselves a spoiler, so callers must only pass fixtures the
// user has chosen to reveal. We tally points (3/1/0), goals and goal difference,
// then sort by the usual FIFA group criteria (points, GD, goals scored).

import type { Fixture, GroupStandingRow } from './types'

function emptyRow(team: string): GroupStandingRow {
  return {
    team,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDiff: 0,
    points: 0,
  }
}

/**
 * Build standings for every group from the given fixtures. Only group-stage
 * fixtures with a finished result and numeric scores are tallied; every group
 * team still appears (with zeros) as soon as its fixtures are known.
 */
export function computeStandings(fixtures: Fixture[]): Map<string, GroupStandingRow[]> {
  const groups = new Map<string, Map<string, GroupStandingRow>>()

  const rowFor = (group: string, team: string): GroupStandingRow => {
    let g = groups.get(group)
    if (!g) {
      g = new Map()
      groups.set(group, g)
    }
    let r = g.get(team)
    if (!r) {
      r = emptyRow(team)
      g.set(team, r)
    }
    return r
  }

  for (const f of fixtures) {
    if (!f.group) continue
    // Register both teams so the table lists all participants even before results.
    rowFor(f.group, f.team1)
    rowFor(f.group, f.team2)

    const res = f.result
    if (!res || res.status !== 'finished' || res.score1 == null || res.score2 == null) continue

    const a = rowFor(f.group, f.team1)
    const b = rowFor(f.group, f.team2)
    a.played++
    b.played++
    a.goalsFor += res.score1
    a.goalsAgainst += res.score2
    b.goalsFor += res.score2
    b.goalsAgainst += res.score1

    if (res.score1 > res.score2) {
      a.won++
      b.lost++
      a.points += 3
    } else if (res.score1 < res.score2) {
      b.won++
      a.lost++
      b.points += 3
    } else {
      a.drawn++
      b.drawn++
      a.points += 1
      b.points += 1
    }
  }

  const out = new Map<string, GroupStandingRow[]>()
  for (const [group, table] of groups) {
    const rows = [...table.values()]
    for (const r of rows) r.goalDiff = r.goalsFor - r.goalsAgainst
    rows.sort(
      (x, y) =>
        y.points - x.points ||
        y.goalDiff - x.goalDiff ||
        y.goalsFor - x.goalsFor ||
        x.team.localeCompare(y.team),
    )
    out.set(group, rows)
  }
  // Sort groups alphabetically (Group A, Group B, ...).
  return new Map([...out.entries()].sort((a, b) => a[0].localeCompare(b[0])))
}
