<script setup lang="ts">
import { computed } from 'vue'
import type { Fixture } from '@/lib/types'
import { zagrebTime } from '@/lib/time'
import { useSettings } from '@/stores/settings'
import TeamBadge from './TeamBadge.vue'

const props = defineProps<{ fixture: Fixture }>()
const settings = useSettings()

const revealed = computed(() =>
  settings.isMatchRevealed(props.fixture.id, props.fixture.zagrebDay),
)

const kickoff = computed(() => zagrebTime(props.fixture.kickoff))
const result = computed(() => props.fixture.result)
const hasScore = computed(
  () => result.value != null && result.value.score1 != null && result.value.score2 != null,
)
const isLive = computed(() => result.value?.status === 'live')

const isFavMatch = computed(
  () => settings.isFavourite(props.fixture.team1) || settings.isFavourite(props.fixture.team2),
)
</script>

<template>
  <div class="match" :class="{ live: isLive && revealed, favourite: isFavMatch }">
    <div class="kickoff">
      <span class="time">{{ kickoff }}</span>
      <span v-if="isLive && revealed" class="live-dot">● LIVE</span>
    </div>

    <div class="teams">
      <TeamBadge class="t1" :team="fixture.team1" favouritable />
      <div class="middle">
        <template v-if="revealed && hasScore">
          <span class="score">{{ result!.score1 }}–{{ result!.score2 }}</span>
          <span v-if="result!.detail" class="detail">{{ result!.detail }}</span>
        </template>
        <template v-else-if="revealed">
          <span class="vs">vs</span>
        </template>
        <template v-else>
          <button class="reveal" title="Reveal this score" @click="settings.toggleMatch(fixture.id)">
            👁 {{ hasScore ? 'Reveal' : 'vs' }}
          </button>
        </template>
      </div>
      <TeamBadge class="t2" :team="fixture.team2" favouritable align="right" />
    </div>

    <div class="meta">
      <span v-if="fixture.group" class="chip">{{ fixture.group }}</span>
      <span v-else class="chip knockout">{{ fixture.round }}</span>
      <span class="ground">📍 {{ fixture.ground }}</span>
      <button
        v-if="revealed && hasScore"
        class="hide-one"
        title="Hide this score again"
        @click="settings.toggleMatch(fixture.id, false)"
      >
        hide
      </button>
    </div>
  </div>
</template>

<style scoped>
.match {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 0.7rem 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.match.favourite {
  border-color: color-mix(in srgb, var(--fav) 45%, var(--border));
}
.match.live {
  border-color: color-mix(in srgb, var(--live) 55%, var(--border));
}
.kickoff {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.78rem;
  color: var(--text-dim);
}
.time {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}
.live-dot {
  color: var(--live);
  font-weight: 700;
  animation: pulse 1.4s ease-in-out infinite;
}
@keyframes pulse {
  50% {
    opacity: 0.45;
  }
}
.teams {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 0.6rem;
}
.t1 {
  justify-content: flex-end;
}
.t2 {
  justify-content: flex-start;
}
.middle {
  min-width: 5.2rem;
  text-align: center;
}
.score {
  font-size: 1.3rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}
.detail {
  display: block;
  font-size: 0.68rem;
  color: var(--text-dim);
  margin-top: 0.1rem;
}
.vs {
  color: var(--text-dim);
  font-size: 0.85rem;
}
.reveal {
  background: var(--surface-3);
  border: 1px solid var(--border);
  color: var(--text-dim);
  border-radius: 0.5rem;
  padding: 0.3rem 0.5rem;
  font-size: 0.75rem;
  cursor: pointer;
  white-space: nowrap;
}
.reveal:hover {
  color: var(--text);
  border-color: var(--accent);
}
.meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.72rem;
  color: var(--text-dim);
  flex-wrap: wrap;
}
.chip {
  background: var(--surface-3);
  padding: 0.12rem 0.45rem;
  border-radius: 0.4rem;
  font-weight: 600;
}
.chip.knockout {
  background: color-mix(in srgb, var(--accent) 22%, transparent);
  color: var(--accent);
}
.ground {
  flex: 1;
}
.hide-one {
  background: none;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  text-decoration: underline;
  font-size: 0.72rem;
}
.hide-one:hover {
  color: var(--danger);
}
</style>
