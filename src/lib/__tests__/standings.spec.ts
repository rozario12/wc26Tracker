import { describe, it, expect } from 'vitest'
import { computeStandings } from '../standings'
import type { Fixture, MatchResult } from '../types'

let counter = 0
function fixture(
  group: string,
  team1: string,
  team2: string,
  result: MatchResult | null,
): Fixture {
  counter += 1
  return {
    id: `m${counter}`,
    num: counter,
    round: 'Matchday 1',
    group,
    ground: 'Test',
    team1,
    team2,
    kickoff: new Date('2026-06-11T19:00:00Z'),
    zagrebDay: '2026-06-11',
    resolved: true,
    result,
  }
}

const finished = (s1: number, s2: number): MatchResult => ({
  status: 'finished',
  score1: s1,
  score2: s2,
  detail: 'FT',
})

describe('computeStandings', () => {
  it('awards 3 points for a win and 1 each for a draw, with correct GD', () => {
    const fixtures = [
      fixture('Group A', 'Mexico', 'South Africa', finished(2, 1)),
      fixture('Group A', 'Mexico', 'South Africa', finished(1, 1)), // synthetic 2nd meeting
    ]
    const table = computeStandings(fixtures).get('Group A')!
    const mexico = table.find((r) => r.team === 'Mexico')!
    const rsa = table.find((r) => r.team === 'South Africa')!

    expect(mexico.points).toBe(4) // win + draw
    expect(mexico.goalsFor).toBe(3)
    expect(mexico.goalsAgainst).toBe(2)
    expect(mexico.goalDiff).toBe(1)
    expect(rsa.points).toBe(1)
    // Mexico sorts above South Africa.
    expect(table[0].team).toBe('Mexico')
  })

  it('lists every team even before any result is in', () => {
    const fixtures = [fixture('Group B', 'Spain', 'Croatia', null)]
    const table = computeStandings(fixtures).get('Group B')!
    expect(table).toHaveLength(2)
    expect(table.every((r) => r.played === 0 && r.points === 0)).toBe(true)
  })

  it('ignores unfinished/live matches in the tally', () => {
    const live: MatchResult = { status: 'live', score1: 1, score2: 0, detail: "30'" }
    const fixtures = [fixture('Group C', 'Brazil', 'Norway', live)]
    const table = computeStandings(fixtures).get('Group C')!
    expect(table.every((r) => r.played === 0)).toBe(true)
  })
})
