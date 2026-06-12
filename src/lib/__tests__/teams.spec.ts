import { describe, it, expect } from 'vitest'
import { canonicalTeam, teamFlagCode } from '../teams'

describe('canonicalTeam', () => {
  it('collapses the openfootball and ESPN spellings of Bosnia to one key', () => {
    // ESPN's scoreboard reports "Bosnia-Herzegovina"; openfootball uses "and"/"&".
    // All three must canonicalise identically or live scores never merge.
    const espn = canonicalTeam('Bosnia-Herzegovina')
    const ofAnd = canonicalTeam('Bosnia and Herzegovina')
    const ofAmp = canonicalTeam('Bosnia & Herzegovina')
    expect(espn).toBe(ofAnd)
    expect(espn).toBe(ofAmp)
  })

  it('resolves a flag for the hyphenated ESPN spelling', () => {
    expect(teamFlagCode('Bosnia-Herzegovina')).toBe('ba')
  })
})
