<script setup lang="ts">
import { computed } from 'vue'
import { teamFlagCode } from '@/lib/teams'

const props = defineProps<{ team: string }>()

const code = computed(() => teamFlagCode(props.team))
</script>

<template>
  <span
    v-if="code"
    class="flag fi"
    :class="`fi-${code}`"
    :title="team"
    role="img"
    :aria-label="team"
  />
  <span v-else class="flag flag-blank" aria-hidden="true" />
</template>

<style scoped>
/* Sized in em so callers can scale the flag via font-size, like the old emoji.
   flag-icons renders a 4:3 SVG as a background image — crisp on every platform. */
.flag {
  display: inline-block;
  width: 1.4em;
  height: 1.05em;
  border-radius: 2px;
  /* Keeps light flags (e.g. white fields) legible on the dark surface. */
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.15);
  vertical-align: -0.15em;
}
.flag-blank {
  background: var(--surface-2);
  box-shadow: inset 0 0 0 1px var(--border);
}
</style>
