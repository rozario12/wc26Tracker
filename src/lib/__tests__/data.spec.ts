import { describe, it, expect } from 'vitest'
import { parseSchedule } from '../data'
import type { OpenFootballFile } from '../types'

// Mirrors the real openfootball 2026 file, where most matches omit `num`.
const file: OpenFootballFile = {
  name: 'World Cup 2026',
  matches: [
    { round: 'Matchday 1', date: '2026-06-11', time: '13:00 UTC-6', team1: 'Mexico', team2: 'South Africa', group: 'Group A', ground: 'Mexico City' },
    { round: 'Matchday 1', date: '2026-06-12', time: '13:00 UTC-4', team1: 'Canada', team2: 'Curaçao', group: 'Group B', ground: 'Toronto' },
    { round: 'Matchday 1', date: '2026-06-12', time: '16:00 UTC-7', team1: 'United States', team2: 'Bolivia', group: 'Group D', ground: 'Inglewood' },
  ] as OpenFootballFile['matches'],
}

describe('parseSchedule', () => {
  it('assigns a unique id to every fixture even when `num` is missing', () => {
    const fixtures = parseSchedule(file)
    const ids = fixtures.map((f) => f.id)
    expect(ids.length).toBe(3)
    expect(new Set(ids).size).toBe(3) // no collisions
    expect(ids).not.toContain('mundefined')
  })

  it('starts every fixture with no result (spoiler-free)', () => {
    expect(parseSchedule(file).every((f) => f.result === null)).toBe(true)
  })
})
