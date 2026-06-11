<script setup lang="ts">
import { computed } from 'vue'
import type { Fixture } from '@/lib/types'
import { zagrebTime, zagrebDayLabel } from '@/lib/time'
import { teamFlag, isPlaceholder } from '@/lib/teams'

const props = defineProps<{ fixtures: Fixture[]; revealed: boolean }>()

const ROUND_ORDER = [
  'Round of 32',
  'Round of 16',
  'Quarter-final',
  'Semi-final',
  'Match for third place',
  'Final',
]

const columns = computed(() =>
  ROUND_ORDER.map((round) => ({
    round,
    matches: props.fixtures
      .filter((f) => f.round === round)
      .sort((a, b) => a.kickoff.getTime() - b.kickoff.getTime()),
  })).filter((c) => c.matches.length),
)

// Placeholder slot codes (e.g. "W101") aren't spoilers, so show them freely.
// A *resolved* team name reveals who advanced, so mask it until the user reveals.
function show(team: string) {
  if (props.revealed || isPlaceholder(team)) return team
  return '•••'
}
function flagFor(team: string) {
  if (props.revealed || isPlaceholder(team)) return teamFlag(team)
  return '🏳️'
}
function hasScore(f: Fixture) {
  return f.result && f.result.score1 != null && f.result.score2 != null
}
</script>

<template>
  <div class="bracket">
    <div v-for="col in columns" :key="col.round" class="col">
      <h3 class="col-title">{{ col.round }}</h3>
      <div class="col-matches">
        <div v-for="f in col.matches" :key="f.id" class="bmatch card">
          <div class="bmeta">
            {{ zagrebDayLabel(f.kickoff) }} · {{ zagrebTime(f.kickoff) }}
          </div>
          <div class="side">
            <span class="flag">{{ flagFor(f.team1) }}</span>
            <span class="bteam" :class="{ ph: isPlaceholder(f.team1) || !revealed }">{{ show(f.team1) }}</span>
            <span v-if="revealed && hasScore(f)" class="bscore">{{ f.result!.score1 }}</span>
          </div>
          <div class="side">
            <span class="flag">{{ flagFor(f.team2) }}</span>
            <span class="bteam" :class="{ ph: isPlaceholder(f.team2) || !revealed }">{{ show(f.team2) }}</span>
            <span v-if="revealed && hasScore(f)" class="bscore">{{ f.result!.score2 }}</span>
          </div>
          <div v-if="revealed && f.result && f.result.detail" class="bdetail">
            {{ f.result.detail }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bracket {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 0.75rem;
  scroll-snap-type: x proximity;
}
.col {
  min-width: 200px;
  flex: none;
  scroll-snap-align: start;
}
.col-title {
  font-size: 0.85rem;
  margin: 0 0 0.6rem;
  color: var(--accent);
  position: sticky;
  top: 0;
}
.col-matches {
  display: grid;
  gap: 0.6rem;
}
.bmatch {
  padding: 0.55rem 0.65rem;
  display: grid;
  gap: 0.3rem;
}
.bmeta {
  font-size: 0.66rem;
  color: var(--text-dim);
}
.side {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  font-weight: 600;
}
.flag {
  font-size: 1rem;
}
.bteam.ph {
  color: var(--text-dim);
  font-style: italic;
  font-weight: 500;
}
.bscore {
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}
.bdetail {
  font-size: 0.64rem;
  color: var(--text-dim);
  text-align: right;
}
</style>
