// Central data composable: loads the schedule once, merges live scores, and
// exposes reactive views (matches, days, groups, standings). A single shared
// instance is created via a module-level singleton so every view reads the same
// state without re-fetching.

import { ref, computed } from 'vue'
import type { Fixture, MatchDay, GroupStandingRow } from '@/lib/types'
import { fetchSchedule, fetchResults } from '@/lib/data'
import { zagrebDayLabel } from '@/lib/time'
import { computeStandings } from '@/lib/standings'

const SCHEDULE_CACHE = 'wc26.schedule.v2' // v2: unique fixture ids (v1 cached colliding ids)
const SCHEDULE_TTL_MS = 24 * 60 * 60 * 1000 // refresh schedule daily

// Live auto-update: poll ESPN while a match is on, idle otherwise.
const POLL_INTERVAL_MS = 45_000
const PRE_KICKOFF_MS = 5 * 60_000
const LIVE_WINDOW_MS = 210 * 60_000 // regulation + half-time + stoppage + ET + penalties

const fixtures = ref<Fixture[]>([])
const loading = ref(false)
const refreshing = ref(false)
const error = ref<string | null>(null)
const lastUpdated = ref<Date | null>(null)
let started = false
let pollTimer: ReturnType<typeof setInterval> | null = null

interface ScheduleCache {
  savedAt: number
  fixtures: Array<Omit<Fixture, 'kickoff'> & { kickoff: string }>
}

function readScheduleCache(): Fixture[] | null {
  try {
    const raw = localStorage.getItem(SCHEDULE_CACHE)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ScheduleCache
    if (Date.now() - parsed.savedAt > SCHEDULE_TTL_MS) return null
    return parsed.fixtures.map((f) => ({ ...f, kickoff: new Date(f.kickoff) }))
  } catch {
    return null
  }
}

function writeScheduleCache(list: Fixture[]) {
  try {
    const payload: ScheduleCache = {
      savedAt: Date.now(),
      fixtures: list.map((f) => ({ ...f, kickoff: f.kickoff.toISOString() })),
    }
    localStorage.setItem(SCHEDULE_CACHE, JSON.stringify(payload))
  } catch {
    /* ignore */
  }
}

/** Merge live results onto the in-memory fixtures (replaces the array reactively). */
async function mergeResults() {
  if (!fixtures.value.length) return
  refreshing.value = true
  try {
    const results = await fetchResults(fixtures.value)
    fixtures.value = fixtures.value.map((f) => ({
      ...f,
      result: results.get(f.id) ?? f.result,
    }))
    lastUpdated.value = new Date()
  } finally {
    refreshing.value = false
  }
}

/**
 * True when at least one match is currently worth polling for: either ESPN
 * already reports it live, or its kickoff falls inside the live window (so we
 * start polling shortly before kickoff and keep going through extra time).
 */
export function hasActiveWindow(list: Fixture[] = fixtures.value, now = Date.now()): boolean {
  return list.some((f) => {
    if (f.result?.status === 'live') return true
    if (!f.resolved) return false
    const k = f.kickoff.getTime()
    return now >= k - PRE_KICKOFF_MS && now <= k + LIVE_WINDOW_MS
  })
}

/** One poll tick: skip when hidden, already fetching, or nothing is on. */
async function pollTick() {
  if (typeof document !== 'undefined' && document.hidden) return
  if (refreshing.value || !hasActiveWindow()) return
  await mergeResults()
}

function onVisibilityChange() {
  if (!document.hidden) void pollTick()
}

/** Start the live-score polling loop (idempotent; lives for the app session). */
function startPolling() {
  if (pollTimer != null) return
  pollTimer = setInterval(() => void pollTick(), POLL_INTERVAL_MS)
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', onVisibilityChange)
  }
}

/** Stop the polling loop and detach listeners (mainly for tests). */
function stopPolling() {
  if (pollTimer != null) {
    clearInterval(pollTimer)
    pollTimer = null
  }
  if (typeof document !== 'undefined') {
    document.removeEventListener('visibilitychange', onVisibilityChange)
  }
}

async function load() {
  loading.value = true
  error.value = null
  try {
    const cached = readScheduleCache()
    if (cached) {
      fixtures.value = cached
    } else {
      const fresh = await fetchSchedule()
      fixtures.value = fresh
      writeScheduleCache(fresh)
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load schedule'
  } finally {
    loading.value = false
  }
  // Always attempt a (background) results refresh once the schedule is present.
  if (fixtures.value.length) {
    await mergeResults()
    startPolling() // keep live scores fresh while matches are on
  }
}

/** Re-pull live scores on demand. */
async function refresh() {
  await mergeResults()
}

// --- Derived views -------------------------------------------------------

const days = computed<MatchDay[]>(() => {
  const byDay = new Map<string, Fixture[]>()
  for (const f of fixtures.value) {
    const list = byDay.get(f.zagrebDay) ?? []
    list.push(f)
    byDay.set(f.zagrebDay, list)
  }
  return [...byDay.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, list]) => ({
      day,
      label: zagrebDayLabel(list[0].kickoff),
      fixtures: list.sort((a, b) => a.kickoff.getTime() - b.kickoff.getTime()),
    }))
})

const groupStageFixtures = computed(() => fixtures.value.filter((f) => f.group))
const knockoutFixtures = computed(() => fixtures.value.filter((f) => !f.group))

/** Standings computed only from the supplied (revealed) fixtures. */
function standingsFrom(list: Fixture[]): Map<string, GroupStandingRow[]> {
  return computeStandings(list)
}

export function useWorldCup() {
  if (!started) {
    started = true
    void load()
  }
  return {
    fixtures,
    days,
    groupStageFixtures,
    knockoutFixtures,
    loading,
    refreshing,
    error,
    lastUpdated,
    refresh,
    reload: load,
    standingsFrom,
    stopPolling,
  }
}
