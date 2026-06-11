// Lazy tournament-statistics composable. Fetches per-match stat data for played
// matches (via fetchStatData) and aggregates it once, on demand — only used by
// the Statistics page after the spoiler gate is acknowledged.

import { ref } from 'vue'
import type { TournamentStats } from '@/lib/types'
import { fetchStatData } from '@/lib/data'
import { aggregateStats } from '@/lib/stats'
import { useWorldCup } from './useWorldCup'

export function useStats() {
  const { fixtures } = useWorldCup()
  const stats = ref<TournamentStats | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function load() {
    if (loading.value) return
    loading.value = true
    error.value = null
    try {
      const data = await fetchStatData(fixtures.value)
      stats.value = aggregateStats(data)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load statistics'
    } finally {
      loading.value = false
    }
  }

  return { stats, loading, error, load }
}
