<script setup lang="ts">
import { computed, ref, type ComponentPublicInstance } from 'vue'
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

// The day to jump to: today if it has matches, otherwise the next upcoming day.
// Derived from the full schedule so the favourites filter never changes the target.
const targetDay = computed<string | null>(() => {
  const ds = days.value
  if (!ds.length) return null
  const exact = ds.find((d) => d.day === today)
  if (exact) return exact.day
  const upcoming = ds.find((d) => d.day >= today)
  return upcoming?.day ?? null // null => tournament over, nothing to jump to
})

const jumpLabel = computed(() =>
  targetDay.value === today ? 'Jump to today' : 'Jump to next matches',
)

// Keep a handle on each rendered DaySection so we can scroll to it on demand.
const dayRefs = ref<Record<string, ComponentPublicInstance | null>>({})
function setDayRef(day: string, el: unknown) {
  if (el) dayRefs.value[day] = el as ComponentPublicInstance
  else delete dayRefs.value[day]
}

function scrollToToday() {
  const key = targetDay.value
  if (!key) return
  dayRefs.value[key]?.$el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
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

    <button
      v-if="!loading && !error && targetDay"
      type="button"
      class="jump-today"
      @click="scrollToToday"
    >
      📅 {{ jumpLabel }}
    </button>

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
      <DaySection
        v-for="d in visibleDays"
        :key="d.day"
        :ref="(el) => setDayRef(d.day, el)"
        :day="d"
        :today="today"
      />
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
.jump-today {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 1rem;
  cursor: pointer;
  background: var(--surface-2);
  border: 1px solid var(--border);
  color: var(--text);
  padding: 0.4rem 0.7rem;
  border-radius: 0.6rem;
  font-size: 0.82rem;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}
.jump-today:hover {
  background: var(--surface-3);
  border-color: var(--accent);
  color: var(--accent);
}
</style>
