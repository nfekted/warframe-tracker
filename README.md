# Warframe Tracker

A free, browser-only tracker for **Warframe** Mastery progress. Mark what you have mastered, see your Mastery Rank and XP update in real time, find what is left to farm, and check prime/relic prices from warframe.market.

**Live:** https://nfekted.github.io/warframe-tracker/

> Fan-made project. Not affiliated with Digital Extremes. Warframe and all related assets belong to their respective owners.

## Features

- **Mastery checklist** of every masterable item, grouped by category: Warframes, primaries, secondaries, melee, companions (Kubrows, Kavats, Predasites, Vulpaphylas, MOAs, Hounds, Sentinels and their weapons), Plexus, Necramechs, K-Drives, Amps, Archwings and Archwing weapons, Zaws and Kitguns.
  - Filters: acquisition source, item name, required MR, hide mastered, hide items above your current MR, hide Founder exclusives.
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
- **No account needed**: progress is saved in the browser (IndexedDB) as you click. *Delete all* removes only this app's data.
- **Export / import**: download your progress as a JSON file and load it back in another browser or device.

## Tech stack

| | |
|---|---|
| Framework | Angular 22 (standalone components, signals, OnPush, zoneless, `@if`/`@for` control flow, lazy-loaded routes) |
| i18n | [Transloco](https://jsverse.github.io/transloco/) 8 |
| Storage | IndexedDB via [idb](https://github.com/jakearchibald/idb) |
| UI | Bootstrap 5 (dark theme, bundled with Popper), Material Symbols, native `<dialog>` |
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
│   ├── app.component.*        # Root layout: sidebar, router outlet, language switch
│   ├── app.config.ts          # Providers: router (hash URLs), HttpClient, Transloco; loads the saved progress at startup
│   ├── app.routes.ts          # #/items, #/incarnon, #/star-chart, #/market, each loaded on demand
│   ├── transloco-loader.ts    # Loads assets/i18n/{lang}.json
│   ├── sidebar/               # MR, XP, intrinsics, navigation, export/import, delete data
│   ├── dialog/                # Confirmation and message dialog (DialogService + native <dialog>)
│   ├── tracker-card/          # Card shared by the panels: header, counters, show/hide, list
│   ├── items-panel/           # Mastery checklist + filters (items-filter.ts; items/ = one category card)
│   ├── star-chart-panel/      # Star Chart nodes per planet (items/ = one planet card)
│   ├── incarnon-panel/        # Incarnon adapters per source (items/ = one group card)
│   └── market/                # Watchlist, best-items/, best-relics/
├── shared/
│   ├── jsons/                 # Static game data: items, MR table, locations, incarnons, market data
│   ├── models/                # Account, Item, StarChart, Incarnons, MasteryRank, ItemJsons
│   ├── metadata.ts            # Current game update, market data dates, intrinsic limits
│   ├── store/
│   │   ├── progress.model.ts  # Saved data format, validation, export file format
│   │   ├── progress-db.ts     # IndexedDB access
│   │   └── progress.store.ts  # Signals store: user progress, actions, account built from the JSONs
│   └── utils/util.ts          # Item categories, XP calculation
├── styles/_mixins.scss        # Toggle, panel card and checklist row styles included by components (@use 'mixins')
└── assets/
    ├── i18n/                  # en.json, pt.json
    └── img/                   # Icons, flags, MR badges, location images
scripts/
└── market-data.mjs            # Generates the market JSONs from raw exports
```

## Updating game data

The data is static and bundled at build time. Nothing is fetched from game or market APIs at runtime.

- **New items, nodes or Incarnons**: add them to the JSON files in `src/shared/jsons/`. Each item has its own `mastery_xp` (3000, 4000 for Kuva/Tenet/Coda weapons, 6000 or 8000). Items are always built from the JSON and only the mastered flag comes from the saved data, so changes in the JSON reach existing users. The tests check that every item's `mastery_xp` matches its category.
- **New game update**: update `GAME_UPDATE` in `src/shared/metadata.ts`. The max XP and the MR filter options are calculated from the JSONs.
- **New item category**: add the JSON to `ItemJsons` (`shared/models/item-jsons.model.ts`), the property to `Account` and the key to `Util.itemTypes`.
- **Market data**: `src/shared/jsons/tradeable/` holds the tradeable items with English and Portuguese names (`tradeables.json`), prices (`tradePrices.json`) and relic values (`relics.json`). Regenerate them with `node scripts/market-data.mjs <tradeables|prices|relics> <input file>` (input formats are described at the top of the script), then update `MARKET_DATA` in `src/shared/metadata.ts`.
- **Translations**: edit `src/assets/i18n/en.json` and `pt.json`.

## Saved data

Progress is stored in IndexedDB, in the `warframe-tracker` database (object store `state`, key `progress`). Only what the user chose is saved; item, node and Incarnon data always comes from the JSONs:

| Field | Content |
|---|---|
| `mastered` | Names of mastered items, per category |
| `locations` / `steelPath` | Names of completed Star Chart nodes, normal and Steel Path |
| `incarnons` | Names of acquired Incarnon adapters |
| `railjack` / `drifter` | Intrinsic ranks (limited to 50 and 40) |
| `lang` | `en` or `pt` |
| `options` | Mastery checklist filters |
| `market` | Ids in the market watchlist |

Changes are saved 300 ms after the last click and when the page is closed. Names that no longer exist in the JSONs are ignored.

The export file is `{ "app": "warframe-tracker", "version": 1, "exportedAt": "...", "data": { ...fields above } }`. Importing validates it and replaces the current progress; files from a newer version are rejected.
