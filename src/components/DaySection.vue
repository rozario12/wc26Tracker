<script setup lang="ts">
import { computed } from 'vue'
import type { MatchDay } from '@/lib/types'
import { useSettings } from '@/stores/settings'
import MatchCard from './MatchCard.vue'

const props = defineProps<{ day: MatchDay; today?: string }>()
const settings = useSettings()

const revealed = computed(() => settings.isDayRevealed(props.day.day))
const isToday = computed(() => props.today === props.day.day)
const anyFinished = computed(() =>
  props.day.fixtures.some((f) => f.result && f.result.status !== 'upcoming'),
)
</script>

<template>
  <section class="day card">
    <header class="day-head">
      <div class="day-title">
        <h2>{{ day.label }}</h2>
        <span v-if="isToday" class="today-badge">Today</span>
        <span class="count">{{ day.fixtures.length }} {{ day.fixtures.length === 1 ? 'match' : 'matches' }}</span>
      </div>

      <label class="reveal-toggle" :title="anyFinished ? 'Reveal all scores for this day' : 'No results yet'">
        <input
          type="checkbox"
          class="sr-only"
          :checked="revealed"
          @change="settings.toggleDay(day.day, ($event.target as HTMLInputElement).checked)"
        />
        <span class="switch" :class="{ on: revealed }" aria-hidden="true"></span>
        <span class="reveal-text">{{ revealed ? 'Results shown' : 'Show results' }}</span>
      </label>
    </header>

    <div class="matches">
      <MatchCard v-for="f in day.fixtures" :key="f.id" :fixture="f" />
    </div>
  </section>
</template>

<style scoped>
.day {
  padding: 1rem;
  margin-bottom: 1rem;
}
.day-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.85rem;
  flex-wrap: wrap;
}
.day-title {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  flex-wrap: wrap;
}
.day-title h2 {
  font-size: 1.05rem;
  margin: 0;
}
.today-badge {
  background: var(--accent);
  color: #06231a;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.1rem 0.45rem;
  border-radius: 0.4rem;
}
.count {
  font-size: 0.75rem;
  color: var(--text-dim);
}
.reveal-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.8rem;
  color: var(--text-dim);
  user-select: none;
}
.switch {
  width: 38px;
  height: 22px;
  border-radius: 999px;
  background: var(--surface-3);
  border: 1px solid var(--border);
  position: relative;
  transition: background 0.18s;
  flex: none;
}
.switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--text-dim);
  transition: transform 0.18s, background 0.18s;
}
.switch.on {
  background: color-mix(in srgb, var(--accent) 35%, transparent);
}
.switch.on::after {
  transform: translateX(16px);
  background: var(--accent);
}
.reveal-text {
  min-width: 6.5rem;
}
.matches {
  display: grid;
  gap: 0.6rem;
}
</style>
