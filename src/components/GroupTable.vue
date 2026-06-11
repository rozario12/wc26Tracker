<script setup lang="ts">
import type { GroupStandingRow } from '@/lib/types'
import TeamBadge from './TeamBadge.vue'

defineProps<{ name: string; rows: GroupStandingRow[] }>()
</script>

<template>
  <div class="group card">
    <h3>{{ name }}</h3>
    <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th class="pos">#</th>
          <th class="team">Team</th>
          <th>P</th>
          <th>W</th>
          <th>D</th>
          <th>L</th>
          <th class="hide-sm">GF</th>
          <th class="hide-sm">GA</th>
          <th>GD</th>
          <th class="pts">Pts</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(r, i) in rows" :key="r.team" :class="{ qualify: i < 2 }">
          <td class="pos">{{ i + 1 }}</td>
          <td class="team"><TeamBadge :team="r.team" favouritable compact /></td>
          <td>{{ r.played }}</td>
          <td>{{ r.won }}</td>
          <td>{{ r.drawn }}</td>
          <td>{{ r.lost }}</td>
          <td class="hide-sm">{{ r.goalsFor }}</td>
          <td class="hide-sm">{{ r.goalsAgainst }}</td>
          <td>{{ r.goalDiff > 0 ? '+' + r.goalDiff : r.goalDiff }}</td>
          <td class="pts">{{ r.points }}</td>
        </tr>
      </tbody>
    </table>
    </div>
  </div>
</template>

<style scoped>
.group {
  padding: 0.85rem 0.9rem;
  overflow: hidden; /* keep the card from leaking on narrow screens */
}
h3 {
  margin: 0 0 0.6rem;
  font-size: 1rem;
}
.table-wrap {
  /* If the table is still too wide, scroll inside the card instead of overflowing the page. */
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
  font-variant-numeric: tabular-nums;
}
th {
  color: var(--text-dim);
  font-weight: 600;
  text-align: center;
  padding: 0.3rem 0.18rem;
  font-size: 0.72rem;
}
td {
  text-align: center;
  padding: 0.4rem 0.18rem;
  border-top: 1px solid var(--border);
}
th.team,
td.team {
  text-align: left;
}
.pos {
  color: var(--text-dim);
  width: 1.4rem;
}
.pts {
  font-weight: 800;
}
tr.qualify td.pos {
  color: var(--accent);
  font-weight: 800;
}
tr.qualify td.team {
  border-left: 2px solid var(--accent);
}
@media (max-width: 480px) {
  .hide-sm {
    display: none;
  }
}
</style>
