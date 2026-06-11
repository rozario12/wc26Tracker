<script setup lang="ts">
import { computed } from 'vue'
import { useWorldCup } from '@/composables/useWorldCup'
import type { MatchDay } from '@/lib/types'
import SpoilerGate from '@/components/SpoilerGate.vue'
import MatchCard from '@/components/MatchCard.vue'

const { days, loading } = useWorldCup()

// Finished matches only, grouped by day, most-recent day first.
const resultDays = computed<MatchDay[]>(() =>
  days.value
    .map((d) => ({
      ...d,
      fixtures: d.fixtures.filter((f) => f.result?.status === 'finished'),
    }))
    .filter((d) => d.fixtures.length)
    .reverse(),
)
</script>

<template>
  <div>
    <h2 class="title">Results</h2>
    <p class="hint">Finished matches, newest first.</p>

    <SpoilerGate title="Results contain scores">
      <div v-if="loading" class="center-state">
        <div class="spinner" />
        <p>Loading…</p>
      </div>

      <div v-else-if="!resultDays.length" class="center-state">
        <p>No matches have finished yet.</p>
      </div>

      <section v-for="d in resultDays" v-else :key="d.day" class="day card">
        <h3>{{ d.label }}</h3>
        <div class="matches">
          <MatchCard v-for="f in d.fixtures" :key="f.id" :fixture="f" reveal-override />
        </div>
      </section>
    </SpoilerGate>
  </div>
</template>

<style scoped>
.title {
  margin: 0 0 0.2rem;
  font-size: 1.15rem;
}
.hint {
  margin: 0 0 1.25rem;
  font-size: 0.8rem;
  color: var(--text-dim);
}
.day {
  padding: 1rem;
  margin-bottom: 1rem;
}
.day h3 {
  margin: 0 0 0.85rem;
  font-size: 1.05rem;
}
.matches {
  display: grid;
  gap: 0.6rem;
}
</style>
