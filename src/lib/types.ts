// Shared domain types for the WC26 Tracker.

/** Raw match shape as published by openfootball/worldcup.json. */
export interface OpenFootballMatch {
  num: number
  round: string
  date: string // e.g. "2026-06-11"
  time: string // e.g. "13:00 UTC-6"
  team1: string
  team2: string
  group?: string // e.g. "Group A" (absent for knockout rounds)
  ground: string
}

export interface OpenFootballFile {
  name: string
  matches: OpenFootballMatch[]
}

export type MatchStatus = 'upcoming' | 'live' | 'finished'

/** A live result merged in from the ESPN scoreboard. */
export interface MatchResult {
  status: MatchStatus
  score1: number | null
  score2: number | null
  /** Display detail, e.g. "FT", "HT", "73'", "Full Time". */
  detail: string
}

/** Canonical fixture used throughout the UI (openfootball + Zagreb time + optional result). */
export interface Fixture {
  /** Stable id derived from match number, e.g. "m1". */
  id: string
  num: number
  round: string
  group: string | null
  ground: string
  team1: string
  team2: string
  /** Absolute kickoff instant. */
  kickoff: Date
  /** Local date in Europe/Zagreb, "YYYY-MM-DD" — used to bucket matches into days. */
  zagrebDay: string
  /** True when both teams are real (not knockout placeholders like "W101"). */
  resolved: boolean
  result: MatchResult | null
}

export interface MatchDay {
  /** "YYYY-MM-DD" in Europe/Zagreb. */
  day: string
  /** Human label, e.g. "Thursday, 11 June". */
  label: string
  fixtures: Fixture[]
}

export interface GroupStandingRow {
  team: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDiff: number
  points: number
}
