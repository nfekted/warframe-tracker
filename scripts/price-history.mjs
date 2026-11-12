import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { buildSummary } from './history-summary.mjs';

const FIRST_DAY = '2021-09-12';
const WAIT = 2000;
const FIELDS = ['sell', 'sellVolume', 'closed', 'closedVolume'];
const output = new URL('../src/assets/history/', import.meta.url);
const indexFile = new URL('index.json', output);
const aliasesFile = new URL('history-aliases.json', import.meta.url);
const tradeablesFile = new URL('../src/shared/jsons/tradeable/tradeables.json', import.meta.url);
const read = (path) => JSON.parse(readFileSync(path, 'utf8'));
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const addDays = (day, n) => new Date(Date.parse(day) + n * 86400000).toISOString().slice(0, 10);
const daysBetween = (from, to) => Math.round((Date.parse(to) - Date.parse(from)) / 86400000);

//Returns the parsed day, or null when relics.run has no file for it; busy or failing answers are retried a few times
async function fetchDay(day) {
  const url = `https://relics.run/history/price_history_${day}.json`;
  for (const wait of [10, 30, 60, 0]) {
    const response = await fetch(url, { headers: { 'User-Agent': 'WarframeTracker import script' } });
    if (response.ok) return response.json();
    if (response.status == 404) return null;
    if (!wait) throw new Error(`${url}: ${response.status}`);
    console.log(`  ${response.status}, trying again in ${wait}s`);
    await sleep(wait * 1000);
  }
}

//The series of a stat: rank (r5), subtype (intact) and Ayatan stars (c2a1), joined by -; "" when the item has none
const variant = (s) => [s.mod_rank != null ? `r${s.mod_rank}` : '', s.subtype ?? '', s.cyan_stars != null ? `c${s.cyan_stars}a${s.amber_stars}` : '']
  .filter(Boolean).join('-');

//Old files have no item_id, so their items are found by English name, renamed ones through history-aliases.json
function nameResolver(tradeables) {
  const cleanName = (name) => name.toLowerCase().replace(':', '');
  const byName = new Map(tradeables.map(t => [cleanName(t.name_en), t.id]));
  const aliases = existsSync(aliasesFile) ? read(aliasesFile) : {};
  for (const [old, current] of Object.entries(aliases)) byName.set(cleanName(old), byName.get(cleanName(current)));
  return (name) => byName.get(cleanName(name)) ?? byName.get(cleanName(name + ' Blueprint'));
}

//Keeps only sell and closed median/volume per item and series: { id: { series: [sell, sellVolume, closed, closedVolume] } }
function reduce(day, resolve, unmatched) {
  const result = {};
  for (const [name, stats] of Object.entries(day)) {
    for (const s of stats) {
      //The old files have no order_type; their closed stats are the ones with open/close prices
      const type = s.order_type ?? (s.open_price != null ? 'closed' : null);
      if (type != 'sell' && type != 'closed') continue;
      const id = s.item_id ?? resolve(name);
      if (!id) {
        unmatched.add(name);
        continue;
      }
      const values = ((result[id] ??= {})[variant(s)] ??= [null, null, null, null]);
      const at = type == 'sell' ? 0 : 2;
      //A rare duplicated stat keeps the one with more volume
      if (values[at + 1] != null && values[at + 1] >= s.volume) continue;
      values[at] = +(+s.median).toFixed(2);
      values[at + 1] = s.volume;
    }
  }
  return result;
}

//Item files: { start, series: { variant: { sell, sellVolume, closed, closedVolume } } }, every array running from start to the index's last day
function loadItems() {
  const items = new Map();
  if (!existsSync(output)) return items;
  for (const folder of readdirSync(output, { withFileTypes: true }).filter(f => f.isDirectory())) {
    for (const file of readdirSync(new URL(`${folder.name}/`, output))) items.set(file.slice(0, -5), read(new URL(`${folder.name}/${file}`, output)));
  }
  return items;
}

const tradeables = read(tradeablesFile);
const known = new Set(tradeables.map(t => t.id));
const resolve = nameResolver(tradeables);
const index = existsSync(indexFile) ? read(indexFile) : { first: FIRST_DAY, last: null, missing: [] };
const items = loadItems();
const unmatched = new Set();
const unknownIds = new Set();
const today = new Date().toISOString().slice(0, 10);
const from = index.last ? addDays(index.last, 1) : FIRST_DAY;
const total = daysBetween(from, today) + 1;
//Days without a file are only missing once a later day exists; at the end they are just not published yet
let pending = [];
let added = 0;
const started = Date.now();
console.log(`Last day: ${index.last ?? 'none'}, checking ${total} days`);

for (let i = 0, d = from; d <= today; i++, d = addDays(d, 1)) {
  if (i) await sleep(WAIT);
  const day = await fetchDay(d);
  const left = Math.round((Date.now() - started) / (i + 1) * (total - i - 1) / 60000);
  console.log(`[${i + 1}/${total}] ${d} ${day ? 'ok' : 'not found'} - about ${Math.floor(left / 60)}h${String(left % 60).padStart(2, '0')} left`);
  if (!day) {
    pending.push(d);
    continue;
  }
  index.missing.push(...pending);
  pending = [];
  index.last = d;
  added++;

  for (const [id, series] of Object.entries(reduce(day, resolve, unmatched))) {
    if (!known.has(id)) {
      unknownIds.add(id);
      continue;
    }
    if (!items.has(id)) items.set(id, { start: d, series: {} });
    const item = items.get(id);
    const at = daysBetween(item.start, d);
    for (const [name, values] of Object.entries(series)) {
      const arrays = (item.series[name] ??= {});
      values.forEach((value, f) => { if (value != null) (arrays[FIELDS[f]] ??= [])[at] = value; });
    }
  }
}

if (!added) {
  console.log('No new days, nothing changed');
  process.exit();
}

let size = 0;
let gzipped = 0;
for (const [id, item] of items) {
  const length = daysBetween(item.start, index.last) + 1;
  for (const arrays of Object.values(item.series)) {
    for (const field of FIELDS) if (arrays[field]) arrays[field] = Array.from({ length }, (_, i) => arrays[field][i] ?? null);
  }
  const json = JSON.stringify(item);
  const folder = new URL(`${id.at(-1)}/`, output);
  mkdirSync(folder, { recursive: true });
  writeFileSync(new URL(`${id}.json`, folder), json);
  size += json.length;
  gzipped += gzipSync(json).length;
}
writeFileSync(indexFile, JSON.stringify(index, null, 2).replace(/\n/g, '\r\n'));

const mb = (bytes) => (bytes / 1048576).toFixed(1);
console.log(`${added} days added, ${items.size} items, ${index.first} to ${index.last}, ${index.missing.length} missing days`);
console.log(`${mb(size)} MB, ${mb(gzipped)} MB compressed`);
if (unmatched.size) console.log(`Unmatched names (add them to scripts/history-aliases.json and rebuild from scratch): ${[...unmatched].join(' | ')}`);
if (unknownIds.size) console.log(`${unknownIds.size} ids not in tradeables.json (run market-data.mjs tradeables first)`);
buildSummary();
