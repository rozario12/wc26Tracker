// Session-scoped spoiler acknowledgement, shared by the Results and Statistics
// pages. The first visit to either page in a browser session shows a confirm
// gate; once acknowledged, both pages reveal openly for the rest of the session.
// Backed by sessionStorage so it resets when the tab/session ends (and a new
// session re-confirms), matching "open behind one confirm per session".

import { ref } from 'vue'

const KEY = 'wc26.spoilersAck'

function initial(): boolean {
  try {
    return sessionStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

// Module-level singleton so every component sees the same state.
const acknowledged = ref(initial())

export function useSpoilerGate() {
  function acknowledge() {
    acknowledged.value = true
    try {
      sessionStorage.setItem(KEY, '1')
    } catch {
      /* storage unavailable */
    }
  }

  function reset() {
    acknowledged.value = false
    try {
      sessionStorage.removeItem(KEY)
    } catch {
      /* storage unavailable */
    }
  }

  return { acknowledged, acknowledge, reset }
}
