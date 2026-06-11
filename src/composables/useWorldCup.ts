// Central data composable: loads the schedule once, merges live scores, and
// exposes reactive views (matches, days, groups, standings). A single shared
// instance is created via a module-level singleton so every view reads the same
// state without re-fetching.

import { ref, computed } from 'vue'
import type { Fixture, MatchDay, GroupStandingRow } from '@/lib/types'
import { fetchSchedule, fetchResults } from '@/lib/data'
import { zagrebDayLabel } from '@/lib/time'
import { computeStandings } from '@/lib/standings'

const SCHEDULE_CACHE = 'wc26.schedule.v1'
const SCHEDULE_TTL_MS = 24 * 60 * 60 * 1000 // refresh schedule daily

const fixtures = ref<Fixture[]>([])
const loading = ref(false)
const refreshing = ref(false)
const error = ref<string | null>(null)
const lastUpdated = ref<Date | null>(null)
let started = false

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
  if (fixtures.value.length) await mergeResults()
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
  }
}
