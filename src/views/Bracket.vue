<script setup lang="ts">
import { useWorldCup } from '@/composables/useWorldCup'
import { useSettings } from '@/stores/settings'
import BracketView from '@/components/BracketView.vue'

const { knockoutFixtures, loading } = useWorldCup()
const settings = useSettings()
</script>

<template>
  <div>
    <div class="reveal-bar">
      <div>
        <h2>Knockout bracket</h2>
        <p class="hint">Round of 32 through the Final. Teams &amp; scores reveal on demand.</p>
      </div>
      <label class="reveal-toggle">
        <input
          type="checkbox"
          class="sr-only"
          :checked="settings.revealBracket"
          @change="settings.revealBracket = ($event.target as HTMLInputElement).checked"
        />
        <span class="switch" :class="{ on: settings.revealBracket }" aria-hidden="true"></span>
        {{ settings.revealBracket ? 'Bracket revealed' : 'Reveal bracket' }}
      </label>
    </div>

    <div v-if="loading" class="center-state">
      <div class="spinner" />
      <p>Loading…</p>
    </div>

    <BracketView v-else :fixtures="knockoutFixtures" :revealed="settings.revealBracket" />
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
</style>
