<script setup lang="ts">
import { computed } from 'vue'
import { useWorldCup } from '@/composables/useWorldCup'
import { useSettings } from '@/stores/settings'
import GroupTable from '@/components/GroupTable.vue'

const { groupStageFixtures, standingsFrom, loading } = useWorldCup()
const settings = useSettings()

const tables = computed(() => [...standingsFrom(groupStageFixtures.value).entries()])
</script>

<template>
  <div>
    <div class="reveal-bar">
      <div>
        <h2>Group standings</h2>
        <p class="hint">Tables are spoilers — reveal them only when you're ready.</p>
      </div>
      <label class="reveal-toggle">
        <input
          type="checkbox"
          class="sr-only"
          :checked="settings.revealStandings"
          @change="settings.revealStandings = ($event.target as HTMLInputElement).checked"
        />
        <span class="switch" :class="{ on: settings.revealStandings }" aria-hidden="true"></span>
        {{ settings.revealStandings ? 'Standings shown' : 'Show standings' }}
      </label>
    </div>

    <div v-if="loading" class="center-state">
      <div class="spinner" />
      <p>Loading…</p>
    </div>

    <div v-else-if="!settings.revealStandings" class="center-state masked">
      <p class="big">🙈</p>
      <p>Standings hidden to avoid spoilers.</p>
      <button class="primary" @click="settings.revealStandings = true">Show standings</button>
    </div>

    <div v-else class="grid">
      <GroupTable v-for="[name, rows] in tables" :key="name" :name="name" :rows="rows" />
    </div>
  </div>
</template>

<style scoped>
.reveal-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.reveal-bar h2 {
  margin: 0;
  font-size: 1.15rem;
}
.hint {
  margin: 0.2rem 0 0;
  font-size: 0.78rem;
  color: var(--text-dim);
}
.reveal-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.82rem;
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
.grid {
  display: grid;
  /* min() stops the 360px track from forcing horizontal overflow on phones. */
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 360px), 1fr));
  gap: 0.85rem;
}
.masked .big {
  font-size: 2.5rem;
  margin: 0;
}
.primary {
  background: var(--accent);
  color: #06231a;
  border: none;
  padding: 0.55rem 1rem;
  border-radius: 0.6rem;
  font-weight: 700;
  cursor: pointer;
}
</style>
