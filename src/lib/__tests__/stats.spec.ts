import { describe, it, expect } from 'vitest'
import { aggregateStats } from '../stats'
import type { MatchStatData } from '../types'

// Models the opener (Mexico 2-0 South Africa, 3 reds) plus a second match.
const data: MatchStatData[] = [
  {
    team1: 'Mexico',
    team2: 'South Africa',
    score1: 2,
    score2: 0,
    goals: [
      { player: 'J. Quiñones', team: 'Mexico', penalty: false, ownGoal: false },
      { player: 'R. Jiménez', team: 'Mexico', penalty: false, ownGoal: false },
    ],
    cards: [
      { player: 'T. Mokoena', team: 'South Africa', color: 'yellow' },
      { player: 'S. Sithole', team: 'South Africa', color: 'red' },
      { player: 'T. Zwane', team: 'South Africa', color: 'red' },
      { player: 'C. Montes', team: 'Mexico', color: 'red' },
    ],
    teamStats: [
      { team: 'Mexico', possession: 60, shots: 16, shotsOnTarget: 4, corners: 3, fouls: 12 },
      { team: 'South Africa', possession: 40, shots: 3, shotsOnTarget: 2, corners: 1, fouls: 11 },
    ],
  },
  {
    team1: 'Spain',
    team2: 'Croatia',
    score1: 3,
    score2: 1,
    goals: [
      { player: 'R. Jiménez', team: 'Mexico', penalty: true, ownGoal: false }, // contrived dup scorer
      { player: 'Striker', team: 'Spain', penalty: false, ownGoal: false },
      { player: 'Striker', team: 'Spain', penalty: false, ownGoal: false },
      { player: 'Defender', team: 'Spain', penalty: false, ownGoal: true }, // own goal: not counted
    ],
    cards: [],
    teamStats: [
      { team: 'Spain', possession: 55, shots: 10, shotsOnTarget: 5, corners: 6, fouls: 8 },
      { team: 'Croatia', possession: 45, shots: 8, shotsOnTarget: 3, corners: 4, fouls: 9 },
    ],
  },
]

describe('aggregateStats', () => {
  const stats = aggregateStats(data)

  it('ranks scorers and counts penalties, excluding own goals', () => {
    // Striker (2) tops; Quiñones & Jiménez have... Jiménez scored in both (1 + 1 pen) = 2.
    const striker = stats.scorers.find((s) => s.player === 'Striker')!
    const jimenez = stats.scorers.find((s) => s.player === 'R. Jiménez')!
    expect(striker.goals).toBe(2)
    expect(jimenez.goals).toBe(2)
    expect(jimenez.penalties).toBe(1)
    // Own goal did not create a scorer entry.
    expect(stats.scorers.find((s) => s.player === 'Defender')).toBeUndefined()
  })

  it('counts cards per player and total reds', () => {
    expect(stats.cards.find((c) => c.player === 'S. Sithole')!.red).toBe(1)
    expect(stats.totals.redCards).toBe(3)
  })

  it('computes tournament totals', () => {
    expect(stats.totals.matchesPlayed).toBe(2)
    expect(stats.totals.totalGoals).toBe(2 + 0 + 3 + 1) // 6
    expect(stats.totals.avgGoals).toBe(3)
    expect(stats.totals.biggestWin?.team1).toBe('Mexico') // margin 2 == Spain's, first wins tie
  })

  it('aggregates team stats with averaged possession', () => {
    const mex = stats.teamStats.find((t) => t.team === 'Mexico')!
    expect(mex.matches).toBe(1)
    expect(mex.shots).toBe(16)
    expect(mex.possession).toBe(60)
  })
})
