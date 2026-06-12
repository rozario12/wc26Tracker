<script setup lang="ts">
import { computed } from 'vue'
import { isPlaceholder } from '@/lib/teams'
import { useSettings } from '@/stores/settings'
import Flag from './Flag.vue'

const props = defineProps<{
  team: string
  /** Show a star toggle to favourite the team. */
  favouritable?: boolean
  align?: 'left' | 'right'
  /** Truncate the name (~7 chars) with a hover tooltip — used in dense tables. */
  compact?: boolean
}>()

const settings = useSettings()
const placeholder = computed(() => isPlaceholder(props.team))
const fav = computed(() => !placeholder.value && settings.isFavourite(props.team))
</script>

<template>
  <span class="team" :class="[align ?? 'left', { placeholder, fav, compact }]">
    <button
      v-if="favouritable && !placeholder"
      class="star"
      :class="{ on: fav }"
      :title="fav ? 'Remove favourite' : 'Add favourite'"
      @click.stop="settings.toggleFavourite(team)"
    >
      {{ fav ? '★' : '☆' }}
    </button>
    <Flag :team="team" />
    <span class="name" :title="team">{{ team }}</span>
  </span>
</template>

<style scoped>
.team {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-weight: 600;
}
.team.right {
  flex-direction: row-reverse;
}
.team.placeholder .name {
  color: var(--text-dim);
  font-style: italic;
  font-weight: 500;
}
.team.fav .name {
  color: var(--fav);
}
.flag {
  font-size: 1.15rem;
  line-height: 1;
}
.name {
  white-space: nowrap;
}
/* Dense tables: cap the name (~7 chars) and ellipsise; full name shows via title tooltip. */
.team.compact .name {
  max-width: 7ch;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: help;
}
.star {
  background: none;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  font-size: 1rem;
  padding: 0 0.1rem;
  line-height: 1;
}
.star.on {
  color: var(--fav);
}
</style>
