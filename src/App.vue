<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, RouterLink } from 'vue-router'
import { useWorldCup } from '@/composables/useWorldCup'
import { useSettings } from '@/stores/settings'

const { refreshing, lastUpdated, refresh, error } = useWorldCup()
const settings = useSettings()

const tabs = [
  { to: '/', label: 'Schedule', icon: '📅' },
  { to: '/standings', label: 'Standings', icon: '📊' },
  { to: '/bracket', label: 'Bracket', icon: '🏆' },
  { to: '/favourites', label: 'Favourites', icon: '⭐' },
]

const updatedLabel = computed(() => {
  if (!lastUpdated.value) return ''
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Zagreb',
    hour: '2-digit',
    minute: '2-digit',
  }).format(lastUpdated.value)
})
</script>

<template>
  <div class="app">
    <header class="app-header">
      <div class="brand">
        <span class="ball">⚽</span>
        <div>
          <h1>WC26 Tracker</h1>
          <p class="sub">World Cup 2026 · Croatian time</p>
        </div>
      </div>
      <div class="header-actions">
        <button
          class="ghost-btn"
          :disabled="refreshing"
          title="Fetch latest scores"
          @click="refresh"
        >
          <span :class="{ spin: refreshing }">↻</span>
          {{ refreshing ? 'Updating…' : 'Refresh' }}
        </button>
        <button
          class="ghost-btn danger"
          title="Hide every revealed score again"
          @click="settings.hideAll()"
        >
          🙈 Hide all
        </button>
      </div>
    </header>

    <nav class="tabs">
      <RouterLink v-for="t in tabs" :key="t.to" :to="t.to" class="tab" active-class="active">
        <span class="tab-icon">{{ t.icon }}</span>
        <span class="tab-label">{{ t.label }}</span>
      </RouterLink>
    </nav>

    <p v-if="error" class="banner error">⚠️ {{ error }}</p>
    <p v-else-if="updatedLabel" class="banner muted">Scores last checked {{ updatedLabel }}</p>

    <main class="content">
      <RouterView />
    </main>

    <footer class="app-footer">
      <p>
        Schedule: openfootball · Scores: ESPN · Spoiler-free by default — reveal what you choose.
      </p>
    </footer>
  </div>
</template>

<style scoped>
.app {
  max-width: 920px;
  margin: 0 auto;
  padding: 0 1rem 3rem;
}
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 0 0.75rem;
  flex-wrap: wrap;
}
.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.ball {
  font-size: 2.25rem;
}
.brand h1 {
  font-size: 1.35rem;
  margin: 0;
  letter-spacing: -0.02em;
}
.sub {
  margin: 0;
  font-size: 0.8rem;
  color: var(--text-dim);
}
.header-actions {
  display: flex;
  gap: 0.5rem;
}
.ghost-btn {
  background: var(--surface-2);
  border: 1px solid var(--border);
  color: var(--text);
  padding: 0.45rem 0.7rem;
  border-radius: 0.6rem;
  cursor: pointer;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  transition: background 0.15s, border-color 0.15s;
}
.ghost-btn:hover {
  background: var(--surface-3);
}
.ghost-btn.danger:hover {
  border-color: var(--danger);
  color: var(--danger);
}
.ghost-btn:disabled {
  opacity: 0.6;
  cursor: default;
}
.spin {
  display: inline-block;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.tabs {
  display: flex;
  gap: 0.4rem;
  background: var(--surface-1);
  border: 1px solid var(--border);
  border-radius: 0.9rem;
  padding: 0.35rem;
  position: sticky;
  top: 0.5rem;
  z-index: 5;
  backdrop-filter: blur(8px);
}
.tab {
  flex: 1;
  text-align: center;
  padding: 0.55rem 0.4rem;
  border-radius: 0.65rem;
  color: var(--text-dim);
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  transition: background 0.15s, color 0.15s;
}
.tab:hover {
  color: var(--text);
}
.tab.active {
  background: var(--accent);
  color: #06231a;
}
.tab-icon {
  font-size: 1.1rem;
}
.banner {
  margin: 0.85rem 0 0;
  font-size: 0.82rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.6rem;
}
.banner.error {
  background: color-mix(in srgb, var(--danger) 18%, transparent);
  color: var(--danger);
}
.banner.muted {
  color: var(--text-dim);
  padding-left: 0.1rem;
}
.content {
  margin-top: 1rem;
}
.app-footer {
  margin-top: 2.5rem;
  text-align: center;
  color: var(--text-dim);
  font-size: 0.75rem;
}
@media (max-width: 520px) {
  .tab-label {
    display: none;
  }
  .tab-icon {
    font-size: 1.3rem;
  }
}
</style>
