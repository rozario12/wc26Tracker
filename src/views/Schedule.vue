<script setup lang="ts">
import { computed } from 'vue'
import { useWorldCup } from '@/composables/useWorldCup'
import { useSettings } from '@/stores/settings'
import { zagrebDayKey } from '@/lib/time'
import type { MatchDay } from '@/lib/types'
import DaySection from '@/components/DaySection.vue'

const { days, loading, error } = useWorldCup()
const settings = useSettings()

const today = zagrebDayKey(new Date())

const visibleDays = computed<MatchDay[]>(() => {
  if (!settings.favouritesOnly) return days.value
  return days.value
    .map((d) => ({
      ...d,
      fixtures: d.fixtures.filter(
        (f) => settings.isFavourite(f.team1) || settings.isFavourite(f.team2),
      ),
    }))
    .filter((d) => d.fixtures.length)
})
</script>

<template>
  <div>
    <div class="toolbar">
      <label class="fav-filter" :class="{ active: settings.favouritesOnly }">
        <input
          type="checkbox"
          class="sr-only"
          :checked="settings.favouritesOnly"
          @change="settings.favouritesOnly = ($event.target as HTMLInputElement).checked"
        />
        ⭐ Favourites only
      </label>
      <span class="hint">Scores stay hidden until you flip a day's “Show results” switch.</span>
    </div>

    <div v-if="loading" class="center-state">
      <div class="spinner" />
      <p>Loading the World Cup schedule…</p>
    </div>

    <div v-else-if="error" class="center-state">
      <p>⚠️ Couldn't load the schedule.</p>
      <p class="hint">{{ error }}</p>
    </div>

    <div v-else-if="!visibleDays.length" class="center-state">
      <p v-if="settings.favouritesOnly">No matches for your favourite teams yet.</p>
      <p v-else>No matches found.</p>
    </div>

    <template v-else>
      <DaySection v-for="d in visibleDays" :key="d.day" :day="d" :today="today" />
    </template>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}
.fav-filter {
  cursor: pointer;
  background: var(--surface-2);
  border: 1px solid var(--border);
  padding: 0.4rem 0.7rem;
  border-radius: 0.6rem;
  font-size: 0.82rem;
  user-select: none;
}
.fav-filter.active {
  border-color: var(--fav);
  color: var(--fav);
}
.hint {
  font-size: 0.76rem;
  color: var(--text-dim);
}
</style>
