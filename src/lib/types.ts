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

// --- Statistics (derived from the ESPN scoreboard `details`/`statistics`) ---

export interface GoalEvent {
  player: string
  team: string
  penalty: boolean
  ownGoal: boolean
}

export interface CardEvent {
  player: string
  team: string
  color: 'yellow' | 'red'
}

export interface TeamStatLine {
  team: string
  possession: number | null
  shots: number
  shotsOnTarget: number
  corners: number
  fouls: number
}

/** Parsed stats for a single finished/played match. */
export interface MatchStatData {
  team1: string
  team2: string
  score1: number
  score2: number
  goals: GoalEvent[]
  cards: CardEvent[]
  teamStats: TeamStatLine[]
}

export interface ScorerRow {
  player: string
  team: string
  goals: number
  penalties: number
}

export interface CardRow {
  player: string
  team: string
  yellow: number
  red: number
}

export interface TeamStatRow {
  team: string
  matches: number
  shots: number
  shotsOnTarget: number
  corners: number
  fouls: number
  /** Average possession % across the team's matches, or null if unknown. */
  possession: number | null
}

export interface TournamentTotals {
  matchesPlayed: number
  totalGoals: number
  avgGoals: number
  redCards: number
  biggestWin: { team1: string; team2: string; score1: number; score2: number } | null
}

export interface TournamentStats {
  scorers: ScorerRow[]
  cards: CardRow[]
  teamStats: TeamStatRow[]
  totals: TournamentTotals
}
