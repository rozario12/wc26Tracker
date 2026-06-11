# ⚽ WC26 Tracker

A spoiler-free **FIFA World Cup 2026** schedule & results tracker, with every kickoff shown in **Croatian time (Europe/Zagreb)**.

Results are fetched in the background but **stay hidden until you choose to reveal them** — so you can go back and watch an earlier day's matches without spoiling the score.

## Features

- 📅 **Full schedule** — all 104 matches grouped by day, in Zagreb time (CET/CEST handled automatically).
- 🙈 **Spoiler-free by default** — fixtures, times and venues always show; scores never do until you opt in.
  - **Per-day toggle**: flip a day's *Show results* switch to reveal that whole day.
  - **Per-match reveal**: unhide a single game with the 👁 button.
  - **Hide all** resets everything; reveal state is remembered across reloads.
- 📊 **Group standings** — computed live from revealed results (spoiler-gated).
- 🏆 **Knockout bracket** — Round of 32 → Final; teams & scores reveal on demand.
- ⭐ **Favourite teams** — star teams to highlight their games and filter the schedule.

## Tech stack

- **Vue 3** + `<script setup>` Composition API + **TypeScript**
- **Vite** build, **Pinia** state, **Vue Router**
- **Vitest** unit tests
- Scoped CSS with design tokens — no UI framework, mobile-first dark theme

## Data sources (keyless)

| Data | Source | Notes |
| --- | --- | --- |
| Schedule, groups, venues, kickoff offsets | [openfootball/worldcup.json](https://github.com/openfootball/worldcup.json) | Public domain, served via GitHub CDN |
| Live scores & match status | ESPN public scoreboard (`site.api.espn.com`) | Keyless; proxied same-origin to avoid CORS |

ESPN is reached through a same-origin `/espn/*` path — proxied by the Vite dev server in development and by a `vercel.json` rewrite in production — so the browser never makes a cross-origin request. Scores are only fetched for matches that have already kicked off, and matched to fixtures by US-Eastern date + team name (with an alias map for naming differences). The schedule renders fully even if ESPN is unreachable.

Kickoff times in openfootball carry explicit UTC offsets (e.g. `13:00 UTC-6`), so conversion to Europe/Zagreb is deterministic via the native `Intl` API — no date library needed.

## Develop

```bash
npm install
npm run dev      # local dev server
npm run test     # unit tests (time conversion, standings)
npm run build    # type-check + production build → dist/
```

## Deploy

Static site — deploy `dist/` anywhere. Configured for **Vercel** (`vercel.json`, Vite framework preset) with SPA routing rewrites.
