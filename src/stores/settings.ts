// Persistent user settings: spoiler reveal state and favourite teams.
//
// Everything here is purely about *display*. The app always fetches results in
// the background; this store decides what the user is allowed to see, defaulting
// to spoiler-free. State is mirrored to localStorage so going back to an earlier
// day stays consistent across reloads.
//
// Reveal is tracked by a single set of match ids (the source of truth). The
// per-day "Show results" toggle is a thin wrapper that reveals/hides every match
// id in that day, so turning a day off hides the whole day — including matches
// that were revealed individually.

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { canonicalTeam } from '@/lib/teams'
import { useSpoilerGate } from '@/composables/useSpoilerGate'

const KEY = 'wc26.settings.v2' // v2: single revealedMatches set (dropped revealedDays)

interface PersistShape {
  revealedMatches: string[]
  revealStandings: boolean
  revealBracket: boolean
  favourites: string[]
  favouritesOnly: boolean
}

function load(): PersistShape {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as PersistShape
  } catch {
    /* ignore corrupt storage */
  }
  return {
    revealedMatches: [],
    revealStandings: false,
    revealBracket: false,
    favourites: [],
    favouritesOnly: false,
  }
}

export const useSettings = defineStore('settings', () => {
  const initial = load()

  const revealedMatches = ref(new Set(initial.revealedMatches))
  const revealStandings = ref(initial.revealStandings)
  const revealBracket = ref(initial.revealBracket)
  const favourites = ref(new Set(initial.favourites.map(canonicalTeam)))
  const favouritesOnly = ref(initial.favouritesOnly)

  // Persist on any change.
  watch(
    [revealedMatches, revealStandings, revealBracket, favourites, favouritesOnly],
    () => {
      const data: PersistShape = {
        revealedMatches: [...revealedMatches.value],
        revealStandings: revealStandings.value,
        revealBracket: revealBracket.value,
        favourites: [...favourites.value],
        favouritesOnly: favouritesOnly.value,
      }
      try {
        localStorage.setItem(KEY, JSON.stringify(data))
      } catch {
        /* storage full / unavailable */
      }
    },
    { deep: true },
  )

  // --- Reveal (single source of truth: revealedMatches) ---
  const isMatchRevealed = (id: string) => revealedMatches.value.has(id)
  const anyRevealed = (ids: string[]) => ids.some((id) => revealedMatches.value.has(id))

  function toggleMatch(id: string, on?: boolean) {
    const next = new Set(revealedMatches.value)
    const reveal = on ?? !next.has(id)
    if (reveal) next.add(id)
    else next.delete(id)
    revealedMatches.value = next
  }

  function revealMatches(ids: string[]) {
    const next = new Set(revealedMatches.value)
    for (const id of ids) next.add(id)
    revealedMatches.value = next
  }

  function hideMatches(ids: string[]) {
    const next = new Set(revealedMatches.value)
    for (const id of ids) next.delete(id)
    revealedMatches.value = next
  }

  function hideAll() {
    revealedMatches.value = new Set()
    revealStandings.value = false
    revealBracket.value = false
    useSpoilerGate().reset() // re-arm the Results/Statistics spoiler gate
  }

  // --- Favourites
  const isFavourite = (team: string) => favourites.value.has(canonicalTeam(team))
  function toggleFavourite(team: string) {
    const key = canonicalTeam(team)
    const next = new Set(favourites.value)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    favourites.value = next
  }

  const favouriteCount = computed(() => favourites.value.size)

  return {
    revealedMatches,
    revealStandings,
    revealBracket,
    favourites,
    favouritesOnly,
    isMatchRevealed,
    anyRevealed,
    toggleMatch,
    revealMatches,
    hideMatches,
    hideAll,
    isFavourite,
    toggleFavourite,
    favouriteCount,
  }
})
