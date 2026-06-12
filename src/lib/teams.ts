// Team-name normalisation and display helpers.
//
// openfootball and ESPN don't always spell country names identically (e.g.
// "South Korea" vs "Korea Republic"). We normalise both sides to a canonical
// key so live scores merge onto the right fixture. We also map countries to
// flag-icons codes (ISO 3166-1 alpha-2, or gb-eng/gb-sct/gb-wls for the home
// nations) so the UI can render bundled SVG flags that work on every platform —
// unlike emoji flags, which Windows/desktop browsers can't draw. Unknown names
// fall back to a neutral badge.

/** Aliases mapping various spellings to a single canonical name. */
const ALIASES: Record<string, string> = {
  'korea republic': 'South Korea',
  'south korea': 'South Korea',
  'korea dpr': 'North Korea',
  'north korea': 'North Korea',
  usa: 'United States',
  'united states': 'United States',
  'united states of america': 'United States',
  'usmnt': 'United States',
  'ivory coast': "Côte d'Ivoire",
  "cote d'ivoire": "Côte d'Ivoire",
  "côte d'ivoire": "Côte d'Ivoire",
  'czech republic': 'Czechia',
  czechia: 'Czechia',
  'cape verde': 'Cabo Verde',
  'cabo verde': 'Cabo Verde',
  curacao: 'Curaçao',
  'curaçao': 'Curaçao',
  'iran': 'Iran',
  'ir iran': 'Iran',
  türkiye: 'Turkey',
  turkiye: 'Turkey',
  turkey: 'Turkey',
  // openfootball spells these with "&" / "DR"; map common variants (e.g. ESPN's)
  // to the same canonical key so flags resolve and live scores still merge.
  'bosnia and herzegovina': 'Bosnia & Herzegovina',
  'bosnia & herzegovina': 'Bosnia & Herzegovina',
  'congo dr': 'DR Congo',
  'dr congo': 'DR Congo',
  'democratic republic of the congo': 'DR Congo',
}

/** Canonical key for comparing two team names from different sources. */
export function canonicalTeam(name: string): string {
  const trimmed = name.trim()
  const key = trimmed.toLowerCase()
  return (ALIASES[key] ?? trimmed).toLowerCase()
}

/** Canonical team name → flag-icons code (ISO alpha-2, or gb-eng/gb-sct/gb-wls). */
const FLAG_CODES: Record<string, string> = {
  algeria: 'dz', argentina: 'ar', australia: 'au', austria: 'at', belgium: 'be',
  'bosnia & herzegovina': 'ba', brazil: 'br', 'cabo verde': 'cv', cameroon: 'cm',
  canada: 'ca', colombia: 'co', croatia: 'hr', 'curaçao': 'cw', "côte d'ivoire": 'ci',
  czechia: 'cz', denmark: 'dk', 'dr congo': 'cd', ecuador: 'ec', egypt: 'eg',
  england: 'gb-eng', france: 'fr', germany: 'de', ghana: 'gh', greece: 'gr',
  haiti: 'ht', iran: 'ir', iraq: 'iq', italy: 'it', japan: 'jp', jordan: 'jo',
  mexico: 'mx', morocco: 'ma', netherlands: 'nl', 'new zealand': 'nz', nigeria: 'ng',
  norway: 'no', panama: 'pa', paraguay: 'py', peru: 'pe', poland: 'pl',
  portugal: 'pt', qatar: 'qa', 'saudi arabia': 'sa', scotland: 'gb-sct', senegal: 'sn',
  'south africa': 'za', 'south korea': 'kr', spain: 'es', sweden: 'se',
  switzerland: 'ch', tunisia: 'tn', turkey: 'tr', 'united states': 'us', uruguay: 'uy',
  uzbekistan: 'uz', wales: 'gb-wls',
}

/** flag-icons code for a team, or null for unknown/placeholder slots. */
export function teamFlagCode(name: string): string | null {
  return FLAG_CODES[canonicalTeam(name)] ?? null
}

/**
 * Knockout fixtures carry placeholder slots like "W101", "1A", "3C/D/E", "L73".
 * Real country names never contain digits, so a digit (and no known flag) marks
 * an unresolved slot.
 */
export function isPlaceholder(name: string): boolean {
  return /\d/.test(name) && !FLAG_CODES[canonicalTeam(name)]
}
