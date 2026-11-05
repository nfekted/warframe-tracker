# Warframe Tracker

A free, browser-only tracker for **Warframe** Mastery progress. Mark what you have mastered, see your Mastery Rank and XP update in real time, find what is left to farm, and check prime/relic prices from warframe.market.

**Live:** https://nfekted.github.io/warframe-tracker/

> Fan-made project. Not affiliated with Digital Extremes. Warframe and all related assets belong to their respective owners.

## Features

- **Mastery checklist** of every masterable item, grouped by category: Warframes, primaries, secondaries, melee, companions (Kubrows, Kavats, Predasites, Vulpaphylas, MOAs, Hounds, Sentinels and their weapons), Plexus, Necramechs, K-Drives, Amps, Archwings and Archwing weapons, Zaws and Kitguns.
  - Filters: acquisition source, item name, required MR, hide mastered, hide items above your current MR, hide Founder exclusives.
  - Master or unmaster a whole category with one click.
  - Click an item to open its wiki page.
- **Mastery Rank and XP calculation**, with a progress bar to the next rank. Counts:
  - 3,000 XP for weapons, Amps, Zaws, Kitguns and Archwing weapons
  - 6,000 XP for Warframes, Archwings, Plexus, K-Drives and companions
  - 8,000 XP for Necramechs
  - +1,000 XP bonus for Kuva, Tenet and Coda weapons (and Paracesis)
  - 1,500 XP per Railjack and Drifter intrinsic rank
  - Star Chart node XP, normal and Steel Path
- **Star Chart**: track completed nodes per planet, normal and Steel Path.
- **Incarnon**: track which Incarnon Genesis adapters you have, grouped by source.
- **Market** (prices from warframe.market):
  - *My list*: search tradeable items (English or Portuguese names) and keep a personal price watchlist.
  - *Best items*: tradeable items ranked by price, filterable by prime parts, sets, relics, helmets, arcanes and miscellaneous.
  - *Best relics*: Radiant relics ranked by expected platinum value, filterable by era.
- **Languages**: English and Portuguese, switched with the flag button.
- **No account needed**: all progress is saved in the browser's `localStorage`. *Delete all* wipes it.

## Tech stack

| | |
|---|---|
| Framework | Angular 22 (standalone components, `@if`/`@for` control flow) |
| i18n | [Transloco](https://jsverse.github.io/transloco/) 8 |
| UI | Bootstrap 5 (dark theme, bundled with Popper), Material Symbols, SweetAlert2 |
| Language | TypeScript 6 |
| Build | `@angular/build` (application builder) |
| Tests | Vitest + jsdom via `@angular/build:unit-test` |
| Hosting | GitHub Pages, served from `/docs` |

## Getting started

Requirements: a Node.js version supported by Angular 22 (the project is developed with Node 24) and npm.

```bash
npm install
npm start
```

Open http://localhost:4200/.

| Script | What it does |
|---|---|
| `npm start` | Dev server with live reload |
| `npm run build` | Production build into `dist/warframe-tracker` |
| `npm run watch` | Development build in watch mode |
| `npm test` | Runs unit tests with Vitest |
| `npm run buildPages` | Production build for GitHub Pages into `docs/` (see below) |

## Deploying to GitHub Pages

1. Run `npm run buildPages`. It uses the `production` and `pages` configurations and writes the site directly into `docs/`, with `base href="./"`.
2. Commit and push `docs/`. GitHub Pages serves the site from the `docs` folder on `main`.

Assets and translations are loaded with relative paths (`assets/...`), so the same code works locally and on Pages without changes.

## Project structure

```
src/
├── app/
│   ├── app.component.*        # Root: loads saved data, merges new items, computes MR, switches views
│   ├── app.config.ts          # Providers: router, HttpClient, Transloco
│   ├── transloco-loader.ts    # Loads assets/i18n/{lang}.json
│   ├── sidebar/               # MR, XP, intrinsics, navigation, delete data
│   ├── items-panel/           # Mastery checklist + filters (items/ = one category card)
│   ├── star-chart-panel/      # Star Chart nodes per planet (items/ = one planet card)
│   ├── incarnon-panel/        # Incarnon adapters per source (items/ = one group card)
│   └── market/                # Watchlist, best-items/, best-relics/
├── shared/
│   ├── jsons/                 # Static game data: items, MR table, locations, incarnons, market data
│   ├── models/                # Account, Item, StarChart, Incarnons, MasteryRank, ItemJsons
│   └── utils/util.ts          # Item categories, XP calculation, localStorage helpers
└── assets/
    ├── i18n/                  # en.json, pt.json
    └── img/                   # Icons, flags, MR badges, location images
```

## Updating game data

The data is static and bundled at build time. Nothing is fetched from game or market APIs at runtime.

- **New items, nodes or Incarnons**: add them to the JSON files in `src/shared/jsons/`. When the app starts, entries that are missing from the user's saved data are added automatically, so existing progress is kept.
- **New item category**: add the JSON to `ItemJsons` (`shared/models/item-jsons.model.ts`), the property to `Account`, the key to `Util.itemTypes`, and the XP rule to `Util.calculate`.
- **Market prices**: `src/shared/jsons/tradeable/` holds the item lists (`tradeEn.json`, `tradePt.json`), prices (`tradePrices.json`) and relic values (`relics.json`).
- **Translations**: edit `src/assets/i18n/en.json` and `pt.json`.

## Saved data

Everything stays in the browser's `localStorage`:

| Key | Content |
|---|---|
| `warframetracker` | Account progress (only mastered items are stored), intrinsics, nodes, Incarnons, language |
| `NFDTools-WTOptions` | Mastery checklist filter preferences |
| `NKDTools-WTMarket` | Market watchlist |
