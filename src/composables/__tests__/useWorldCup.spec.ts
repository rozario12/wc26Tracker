import { describe, it, expect } from 'vitest'
import { hasActiveWindow } from '../useWorldCup'
import type { Fixture, MatchStatus } from '@/lib/types'

const KO = new Date('2026-06-12T19:00:00Z')

function fixture(over: Partial<Fixture> = {}): Fixture {
  return {
    id: 'm1-0',
    num: 1,
    round: 'Group A',
    group: 'Group A',
    ground: 'Toronto',
    team1: 'Canada',
    team2: 'Bosnia and Herzegovina',
    kickoff: KO,
    zagrebDay: '2026-06-12',
    resolved: true,
    result: null,
    ...over,
  }
}

const withStatus = (status: MatchStatus): Fixture =>
  fixture({ result: { status, score1: 0, score2: 1, detail: "67'" } })

describe('hasActiveWindow', () => {
  it('is true when a match is reported live, regardless of clock', () => {
    const now = KO.getTime() + 5 * 60 * 60 * 1000 // long after kickoff
    expect(hasActiveWindow([withStatus('live')], now)).toBe(true)
  })

  it('is true just before kickoff (pre-kickoff window)', () => {
    const now = KO.getTime() - 3 * 60_000
    expect(hasActiveWindow([fixture()], now)).toBe(true)
  })

  it('is true during the match', () => {
    const now = KO.getTime() + 60 * 60_000
    expect(hasActiveWindow([fixture()], now)).toBe(true)
  })

  it('is false well before kickoff', () => {
    const now = KO.getTime() - 60 * 60_000
    expect(hasActiveWindow([fixture()], now)).toBe(false)
  })

  it('is false long after the live window closes', () => {
    const now = KO.getTime() + 5 * 60 * 60 * 1000
    expect(hasActiveWindow([fixture({ result: { status: 'finished', score1: 1, score2: 2, detail: 'FT' } })], now)).toBe(false)
  })

  it('ignores unresolved (placeholder) fixtures', () => {
    const now = KO.getTime() + 30 * 60_000
    expect(hasActiveWindow([fixture({ resolved: false })], now)).toBe(false)
  })
})
