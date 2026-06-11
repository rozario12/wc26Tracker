// Team-name normalisation and display helpers.
//
// openfootball and ESPN don't always spell country names identically (e.g.
// "South Korea" vs "Korea Republic"). We normalise both sides to a canonical
// key so live scores merge onto the right fixture. We also map countries to
// flag emojis for a friendlier UI; unknown names fall back to a generic badge.

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
}

/** Canonical key for comparing two team names from different sources. */
export function canonicalTeam(name: string): string {
  const trimmed = name.trim()
  const key = trimmed.toLowerCase()
  return (ALIASES[key] ?? trimmed).toLowerCase()
}

const FLAGS: Record<string, string> = {
  argentina: '🇦🇷', australia: '🇦🇺', austria: '🇦🇹', belgium: '🇧🇪', brazil: '🇧🇷',
  'cabo verde': '🇨🇻', cameroon: '🇨🇲', canada: '🇨🇦', colombia: '🇨🇴', croatia: '🇭🇷',
  'curaçao': '🇨🇼', "côte d'ivoire": '🇨🇮', czechia: '🇨🇿', denmark: '🇩🇰', ecuador: '🇪🇨',
  egypt: '🇪🇬', england: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', france: '🇫🇷', germany: '🇩🇪', ghana: '🇬🇭',
  greece: '🇬🇷', haiti: '🇭🇹', iran: '🇮🇷', iraq: '🇮🇶', italy: '🇮🇹', japan: '🇯🇵',
  jordan: '🇯🇴', mexico: '🇲🇽', morocco: '🇲🇦', netherlands: '🇳🇱', 'new zealand': '🇳🇿',
  nigeria: '🇳🇬', norway: '🇳🇴', panama: '🇵🇦', paraguay: '🇵🇾', peru: '🇵🇪',
  poland: '🇵🇱', portugal: '🇵🇹', qatar: '🇶🇦', 'saudi arabia': '🇸🇦', scotland: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  senegal: '🇸🇳', 'south africa': '🇿🇦', 'south korea': '🇰🇷', spain: '🇪🇸', sweden: '🇸🇪',
  switzerland: '🇨🇭', tunisia: '🇹🇳', turkey: '🇹🇷', 'united states': '🇺🇸', uruguay: '🇺🇾',
  uzbekistan: '🇺🇿', wales: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
}

/** Flag emoji for a team, or a neutral globe for unknown/placeholder slots. */
export function teamFlag(name: string): string {
  const canon = canonicalTeam(name)
  return FLAGS[canon] ?? '🏳️'
}

/**
 * Knockout fixtures carry placeholder slots like "W101", "1A", "3C/D/E", "L73".
 * Real country names never contain digits, so a digit (and no known flag) marks
 * an unresolved slot.
 */
export function isPlaceholder(name: string): boolean {
  return /\d/.test(name) && !FLAGS[canonicalTeam(name)]
}
