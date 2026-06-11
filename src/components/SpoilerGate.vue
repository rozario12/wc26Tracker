<script setup lang="ts">
// Shows a one-time-per-session confirmation before revealing a page that
// contains results/scorers. Once confirmed (here or on the other spoiler page),
// the slot content renders for the rest of the session.
import { useSpoilerGate } from '@/composables/useSpoilerGate'

defineProps<{ title?: string }>()
const { acknowledged, acknowledge } = useSpoilerGate()
</script>

<template>
  <div v-if="!acknowledged" class="gate card">
    <p class="emoji">🙈</p>
    <h2>{{ title ?? 'This page contains results' }}</h2>
    <p class="hint">
      Scores and scorers are spoilers. Reveal them for this session?
    </p>
    <button class="primary" @click="acknowledge">Show spoilers</button>
  </div>
  <slot v-else />
</template>

<style scoped>
.gate {
  text-align: center;
  padding: 2.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
}
.emoji {
  font-size: 2.75rem;
  margin: 0;
}
h2 {
  margin: 0;
  font-size: 1.2rem;
}
.hint {
  margin: 0;
  color: var(--text-dim);
  font-size: 0.85rem;
  max-width: 22rem;
}
.primary {
  margin-top: 0.5rem;
  background: var(--accent);
  color: #06231a;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 0.6rem;
  font-weight: 700;
  cursor: pointer;
}
</style>
