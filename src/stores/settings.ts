// Persistent user settings: spoiler reveal state and favourite teams.
//
// Everything here is purely about *display*. The app always fetches results in
// the background; this store decides what the user is allowed to see, defaulting
// to spoiler-free. State is mirrored to localStorage so going back to an earlier
// day stays consistent across reloads.

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { canonicalTeam } from '@/lib/teams'

const KEY = 'wc26.settings.v1'

interface PersistShape {
  revealedDays: string[]
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
    revealedDays: [],
    revealedMatches: [],
    revealStandings: false,
    revealBracket: false,
    favourites: [],
    favouritesOnly: false,
  }
}

export const useSettings = defineStore('settings', () => {
  const initial = load()

  const revealedDays = ref(new Set(initial.revealedDays))
  const revealedMatches = ref(new Set(initial.revealedMatches))
  const revealStandings = ref(initial.revealStandings)
  const revealBracket = ref(initial.revealBracket)
  const favourites = ref(new Set(initial.favourites.map(canonicalTeam)))
  const favouritesOnly = ref(initial.favouritesOnly)

  // Persist on any change.
  watch(
    [revealedDays, revealedMatches, revealStandings, revealBracket, favourites, favouritesOnly],
    () => {
      const data: PersistShape = {
        revealedDays: [...revealedDays.value],
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

  // --- Reveal: a match is shown if its day is revealed OR it was revealed singly.
  const isDayRevealed = (day: string) => revealedDays.value.has(day)
  const isMatchRevealed = (id: string, day: string) =>
    revealedDays.value.has(day) || revealedMatches.value.has(id)

  function toggleDay(day: string, on?: boolean) {
    const next = new Set(revealedDays.value)
    const reveal = on ?? !next.has(day)
    if (reveal) next.add(day)
    else next.delete(day)
    revealedDays.value = next
  }

  function toggleMatch(id: string, on?: boolean) {
    const next = new Set(revealedMatches.value)
    const reveal = on ?? !next.has(id)
    if (reveal) next.add(id)
    else next.delete(id)
    revealedMatches.value = next
  }

  function hideAll() {
    revealedDays.value = new Set()
    revealedMatches.value = new Set()
    revealStandings.value = false
    revealBracket.value = false
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
    revealedDays,
    revealedMatches,
    revealStandings,
    revealBracket,
    favourites,
    favouritesOnly,
    isDayRevealed,
    isMatchRevealed,
    toggleDay,
    toggleMatch,
    hideAll,
    isFavourite,
    toggleFavourite,
    favouriteCount,
  }
})
