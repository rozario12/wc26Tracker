// Time handling for Croatian (Europe/Zagreb) display.
//
// openfootball stores each kickoff as a date ("2026-06-11") plus a time string
// carrying an explicit UTC offset ("13:00 UTC-6"). That is enough to build an
// absolute instant deterministically; we then format it in Europe/Zagreb, which
// handles CET/CEST daylight saving automatically via the Intl engine.

export const ZAGREB_TZ = 'Europe/Zagreb'

/**
 * Convert an openfootball date + offset-bearing time string into an absolute Date.
 * Returns null if the time string cannot be parsed.
 *
 * Examples of accepted `time`: "13:00 UTC-6", "15:00 UTC-5", "21:00 UTC+2", "18:00".
 * When no offset is present the time is treated as UTC.
 */
export function parseKickoff(date: string, time: string): Date | null {
  const m = /^(\d{1,2}):(\d{2})(?:\s*UTC\s*([+-]\d{1,2})(?::?(\d{2}))?)?/.exec(time.trim())
  if (!m) return null
  const [, hh, mm, offH, offM] = m
  const offsetHours = offH ? Number(offH) : 0
  const offsetMins = offM ? Number(offM) : 0
  // Build an ISO string with the source offset, e.g. 2026-06-11T13:00:00-06:00.
  const sign = offsetHours < 0 || (offH ?? '').startsWith('-') ? '-' : '+'
  const absH = String(Math.abs(offsetHours)).padStart(2, '0')
  const absM = String(offsetMins).padStart(2, '0')
  const iso = `${date}T${hh.padStart(2, '0')}:${mm}:00${sign}${absH}:${absM}`
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d
}

/** Parts of an instant as seen in Europe/Zagreb. */
function zagrebParts(d: Date): Record<string, string> {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: ZAGREB_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'long',
    hour12: false,
  })
  const out: Record<string, string> = {}
  for (const p of fmt.formatToParts(d)) out[p.type] = p.value
  return out
}

/** "YYYY-MM-DD" local date in Europe/Zagreb — used to bucket fixtures into days. */
export function zagrebDayKey(d: Date): string {
  const p = zagrebParts(d)
  return `${p.year}-${p.month}-${p.day}`
}

/** Kickoff clock in Zagreb, e.g. "21:00". */
export function zagrebTime(d: Date): string {
  const p = zagrebParts(d)
  // Intl can emit "24" for midnight in some engines; normalise to "00".
  const hour = p.hour === '24' ? '00' : p.hour
  return `${hour}:${p.minute}`
}

/** Long day label in Zagreb, e.g. "Thursday, 11 June". */
export function zagrebDayLabel(d: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: ZAGREB_TZ,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(d)
}

/**
 * ESPN's scoreboard groups events by the US Eastern calendar date, so we derive
 * the YYYYMMDD query param from the kickoff instant as seen in America/New_York.
 * This keeps late-night Zagreb matches (which fall on the previous US day) matched
 * to the correct ESPN scoreboard.
 */
export function espnDateForInstant(d: Date): string {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const parts: Record<string, string> = {}
  for (const p of fmt.formatToParts(d)) parts[p.type] = p.value
  return `${parts.year}${parts.month}${parts.day}`
}
