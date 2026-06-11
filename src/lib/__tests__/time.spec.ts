import { describe, it, expect } from 'vitest'
import {
  parseKickoff,
  zagrebDayKey,
  zagrebTime,
  espnDateForInstant,
} from '../time'

describe('parseKickoff', () => {
  it('parses an offset-bearing time into the correct UTC instant', () => {
    // 13:00 UTC-6 == 19:00 UTC.
    const d = parseKickoff('2026-06-11', '13:00 UTC-6')
    expect(d).not.toBeNull()
    expect(d!.toISOString()).toBe('2026-06-11T19:00:00.000Z')
  })

  it('handles positive offsets', () => {
    const d = parseKickoff('2026-06-11', '21:00 UTC+2')
    expect(d!.toISOString()).toBe('2026-06-11T19:00:00.000Z')
  })

  it('treats a bare time as UTC', () => {
    const d = parseKickoff('2026-06-11', '18:00')
    expect(d!.toISOString()).toBe('2026-06-11T18:00:00.000Z')
  })

  it('returns null for unparseable input', () => {
    expect(parseKickoff('2026-06-11', 'TBD')).toBeNull()
  })
})

describe('Europe/Zagreb formatting (summer = CEST, UTC+2)', () => {
  it('converts the opening match to 21:00 Zagreb time', () => {
    const d = parseKickoff('2026-06-11', '13:00 UTC-6')! // 19:00 UTC
    expect(zagrebTime(d)).toBe('21:00')
    expect(zagrebDayKey(d)).toBe('2026-06-11')
  })

  it('rolls a late US kickoff into the next Zagreb day', () => {
    // 21:00 UTC-4 == 01:00 UTC next day == 03:00 Zagreb next day.
    const d = parseKickoff('2026-06-20', '21:00 UTC-4')!
    expect(d.toISOString()).toBe('2026-06-21T01:00:00.000Z')
    expect(zagrebDayKey(d)).toBe('2026-06-21')
    expect(zagrebTime(d)).toBe('03:00')
  })
})

describe('espnDateForInstant (US Eastern bucketing)', () => {
  it('keeps a late-night Zagreb match on the prior US-Eastern date', () => {
    // 01:00 UTC == 21:00 previous day in New York (EDT, UTC-4).
    const d = new Date('2026-06-21T01:00:00.000Z')
    expect(espnDateForInstant(d)).toBe('20260620')
  })
})
