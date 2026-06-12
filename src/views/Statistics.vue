<script setup lang="ts">
import { watch, onMounted } from 'vue'
import { useStats } from '@/composables/useStats'
import { useSpoilerGate } from '@/composables/useSpoilerGate'
import Flag from '@/components/Flag.vue'
import SpoilerGate from '@/components/SpoilerGate.vue'

const { stats, loading, error, load } = useStats()
const { acknowledged } = useSpoilerGate()

// Fetch lazily, only once the spoiler gate is open.
onMounted(() => {
  if (acknowledged.value) load()
})
watch(acknowledged, (ok) => {
  if (ok && !stats.value) load()
})
</script>

<template>
  <div>
    <h2 class="title">Statistics</h2>
    <p class="hint">Aggregated from completed matches.</p>

    <SpoilerGate title="Statistics reveal scorers & results">
      <div v-if="loading" class="center-state">
        <div class="spinner" />
        <p>Crunching the numbers…</p>
      </div>
      <div v-else-if="error" class="center-state"><p>⚠️ {{ error }}</p></div>
      <div v-else-if="!stats || !stats.totals.matchesPlayed" class="center-state">
        <p>No completed matches yet.</p>
      </div>

      <template v-else>
        <!-- Tournament totals -->
        <section class="totals">
          <div class="stat card"><span class="big">{{ stats.totals.matchesPlayed }}</span><span class="lbl">Matches</span></div>
          <div class="stat card"><span class="big">{{ stats.totals.totalGoals }}</span><span class="lbl">Goals</span></div>
          <div class="stat card"><span class="big">{{ stats.totals.avgGoals }}</span><span class="lbl">Goals / game</span></div>
          <div class="stat card"><span class="big">{{ stats.totals.redCards }}</span><span class="lbl">Red cards</span></div>
        </section>
        <p v-if="stats.totals.biggestWin" class="biggest">
          Biggest win: <Flag :team="stats.totals.biggestWin.team1" /> {{ stats.totals.biggestWin.team1 }}
          {{ stats.totals.biggestWin.score1 }}–{{ stats.totals.biggestWin.score2 }}
          {{ stats.totals.biggestWin.team2 }} <Flag :team="stats.totals.biggestWin.team2" />
        </p>

        <!-- Top scorers -->
        <section class="block card">
          <h3>⚽ Top scorers</h3>
          <table v-if="stats.scorers.length">
            <tbody>
              <tr v-for="(s, i) in stats.scorers.slice(0, 15)" :key="s.player + s.team">
                <td class="rank">{{ i + 1 }}</td>
                <td class="who"><Flag class="flag" :team="s.team" /> {{ s.player }}</td>
                <td class="num">
                  {{ s.goals }}<span v-if="s.penalties" class="pen"> ({{ s.penalties }}P)</span>
                </td>
              </tr>
            </tbody>
          </table>
          <p v-else class="empty">No goals scored yet.</p>
        </section>

        <!-- Disciplinary -->
        <section class="block card">
          <h3>🟨🟥 Disciplinary</h3>
          <table v-if="stats.cards.length">
            <thead><tr><th></th><th class="who">Player</th><th class="num">🟨</th><th class="num">🟥</th></tr></thead>
            <tbody>
              <tr v-for="(c, i) in stats.cards.slice(0, 15)" :key="c.player + c.team">
                <td class="rank">{{ i + 1 }}</td>
                <td class="who"><Flag class="flag" :team="c.team" /> {{ c.player }}</td>
                <td class="num">{{ c.yellow }}</td>
                <td class="num">{{ c.red }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else class="empty">No cards yet.</p>
        </section>

        <!-- Team stats -->
        <section class="block card">
          <h3>📊 Team stats</h3>
          <div class="table-wrap">
            <table>
              <thead>
                <tr><th class="who">Team</th><th class="num">Pld</th><th class="num">Shots</th><th class="num">OT</th><th class="num">Cnr</th><th class="num">Poss</th></tr>
              </thead>
              <tbody>
                <tr v-for="t in stats.teamStats" :key="t.team">
                  <td class="who"><Flag class="flag" :team="t.team" /> {{ t.team }}</td>
                  <td class="num">{{ t.matches }}</td>
                  <td class="num">{{ t.shots }}</td>
                  <td class="num">{{ t.shotsOnTarget }}</td>
                  <td class="num">{{ t.corners }}</td>
                  <td class="num">{{ t.possession != null ? t.possession + '%' : '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </template>
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
.totals {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.6rem;
  margin-bottom: 0.75rem;
}
.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.85rem 0.4rem;
  gap: 0.15rem;
}
.stat .big {
  font-size: 1.5rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: var(--accent);
}
.stat .lbl {
  font-size: 0.68rem;
  color: var(--text-dim);
  text-align: center;
}
.biggest {
  font-size: 0.82rem;
  color: var(--text-dim);
  margin: 0 0 1.25rem;
  text-align: center;
}
.block {
  padding: 0.9rem 1rem;
  margin-bottom: 1rem;
}
.block h3 {
  margin: 0 0 0.7rem;
  font-size: 1rem;
}
.table-wrap {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}
th {
  font-size: 0.7rem;
  color: var(--text-dim);
  font-weight: 600;
  text-align: center;
  padding: 0.25rem 0.3rem;
}
td {
  padding: 0.4rem 0.3rem;
  border-top: 1px solid var(--border);
}
.rank {
  width: 1.6rem;
  color: var(--text-dim);
  text-align: center;
  font-variant-numeric: tabular-nums;
}
.who {
  text-align: left;
}
.flag {
  font-size: 1.05rem;
}
.num {
  text-align: center;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.pen {
  color: var(--text-dim);
  font-size: 0.78rem;
}
.empty {
  color: var(--text-dim);
  font-size: 0.85rem;
  margin: 0;
}
@media (max-width: 520px) {
  .totals {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
