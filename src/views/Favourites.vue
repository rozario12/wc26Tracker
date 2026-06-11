<script setup lang="ts">
import { computed } from 'vue'
import { useWorldCup } from '@/composables/useWorldCup'
import { useSettings } from '@/stores/settings'
import { teamFlag, canonicalTeam } from '@/lib/teams'

const { groupStageFixtures, loading } = useWorldCup()
const settings = useSettings()

// All real participating teams, grouped by their group label.
const groups = computed(() => {
  const map = new Map<string, Set<string>>()
  for (const f of groupStageFixtures.value) {
    if (!f.group) continue
    const set = map.get(f.group) ?? new Set<string>()
    set.add(f.team1)
    set.add(f.team2)
    map.set(f.group, set)
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([group, teams]) => ({
      group,
      teams: [...teams].sort((a, b) => a.localeCompare(b)),
    }))
})

const favTeams = computed(() =>
  [...new Set(groupStageFixtures.value.flatMap((f) => [f.team1, f.team2]))]
    .filter((t) => settings.isFavourite(t))
    .sort((a, b) => a.localeCompare(b)),
)
</script>

<template>
  <div>
    <h2>Favourite teams</h2>
    <p class="hint">
      Star teams to highlight their matches and use the “Favourites only” filter on the Schedule.
    </p>

    <div v-if="loading" class="center-state">
      <div class="spinner" />
      <p>Loading teams…</p>
    </div>

    <template v-else>
      <div v-if="favTeams.length" class="current">
        <span class="lbl">Following:</span>
        <button
          v-for="t in favTeams"
          :key="'fav-' + canonicalTeam(t)"
          class="pill on"
          @click="settings.toggleFavourite(t)"
        >
          {{ teamFlag(t) }} {{ t }} ✕
        </button>
      </div>

      <div v-for="g in groups" :key="g.group" class="group-block">
        <h3>{{ g.group }}</h3>
        <div class="teams">
          <button
            v-for="t in g.teams"
            :key="g.group + t"
            class="pill"
            :class="{ on: settings.isFavourite(t) }"
            @click="settings.toggleFavourite(t)"
          >
            <span class="flag">{{ teamFlag(t) }}</span>
            {{ t }}
            <span class="mark">{{ settings.isFavourite(t) ? '★' : '☆' }}</span>
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
h2 {
  margin: 0 0 0.25rem;
  font-size: 1.15rem;
}
.hint {
  margin: 0 0 1.25rem;
  font-size: 0.8rem;
  color: var(--text-dim);
}
.current {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--border);
}
.lbl {
  font-size: 0.8rem;
  color: var(--text-dim);
  margin-right: 0.25rem;
}
.group-block {
  margin-bottom: 1.25rem;
}
.group-block h3 {
  font-size: 0.9rem;
  color: var(--text-dim);
  margin: 0 0 0.5rem;
}
.teams {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: var(--surface-2);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 999px;
  padding: 0.4rem 0.75rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.pill:hover {
  border-color: var(--fav);
}
.pill.on {
  border-color: var(--fav);
  background: color-mix(in srgb, var(--fav) 16%, transparent);
  color: var(--fav);
}
.flag {
  font-size: 1.05rem;
}
.mark {
  color: var(--fav);
}
</style>
