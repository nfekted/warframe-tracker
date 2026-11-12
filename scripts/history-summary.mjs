import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

//A day counts when it has at least this volume; the series is closed when enough recent days have closed volume, otherwise sell
const MIN_CLOSED_VOLUME = 3;
const MIN_SELL_VOLUME = 5;
const CLOSED_COVERAGE = 0.7;
//Items with no data in the last days are left out (no longer traded)
const MAX_STALE_DAYS = 14;
//Stable: in the 90 days before the last week, this share of days sits on the same value (within the tolerance)
const STABLE_DAYS = 90;
const STABLE_SHARE = 0.9;
const tolerance = (value) => Math.max(0.5, value * 0.1);
//Broke the pattern: a stable item now this far from its usual value, in percentage and platinum
const BROKE_PERCENT = 25;
const BROKE_PLATINUM = 5;
//Rising/falling: 30-day change of at least this percentage and platinum, with the price at this minimum before or after
const TREND_PERCENT = 20;
const TREND_PLATINUM = 5;
const TREND_MIN_PRICE = 10;
//Only series measured by closed trades enter the trend lists; relics, which rarely have them, use intact sell orders with this volume
const RELIC_MIN_SELL_VOLUME = 50;

const output = new URL('../src/assets/history/', import.meta.url);
const read = (path) => JSON.parse(readFileSync(path, 'utf8'));
const round = (value, digits = 1) => value == null ? null : +value.toFixed(digits);
const median = (values) => {
  const sorted = values.filter(v => v != null).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const middle = sorted.length >> 1;
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};
const average = (values) => {
  const present = values.filter(v => v != null);
  return present.length ? present.reduce((a, b) => a + b, 0) / present.length : null;
};
const percent = (from, to) => from ? (to - from) / from * 100 : null;
const addDays = (day, n) => new Date(Date.parse(day) + n * 86400000).toISOString().slice(0, 10);

//Least squares slope of the values, in platinum per day
function slope(values) {
  const points = values.map((y, x) => [x, y]).filter(([, y]) => y != null);
  if (points.length < 2) return null;
  const mx = average(points.map(p => p[0]));
  const my = average(points.map(p => p[1]));
  const den = points.reduce((sum, [x]) => sum + (x - mx) ** 2, 0);
  return points.reduce((sum, [x, y]) => sum + (x - mx) * (y - my), 0) / den;
}

//The most common value and the share of days within its tolerance
function stability(values) {
  const present = values.filter(v => v != null);
  if (present.length < values.length * 0.8) return null;
  const counts = new Map();
  for (const v of present) counts.set(v, (counts.get(v) ?? 0) + 1);
  const mode = [...counts].sort((a, b) => b[1] - a[1])[0][0];
  return { value: mode, share: present.filter(v => Math.abs(v - mode) <= tolerance(mode)).length / present.length };
}

function summarize(id, name, variant, series, start) {
  const length = series.sell?.length ?? series.closed?.length;
  const offset = (i) => addDays(start, i);
  //Recent closed coverage decides the series
  const recent = (field) => (series[field] ?? []).slice(-STABLE_DAYS);
  const closedDays = recent('closedVolume').filter(v => v >= MIN_CLOSED_VOLUME).length;
  const basis = closedDays >= Math.min(STABLE_DAYS, length) * CLOSED_COVERAGE ? 'closed' : 'sell';
  const minVolume = basis == 'closed' ? MIN_CLOSED_VOLUME : MIN_SELL_VOLUME;
  const prices = series[basis]?.map((v, i) => series[`${basis}Volume`][i] >= minVolume ? v : null);
  if (!prices) return null;

  //Each day is the median of its last 7, so a single absurd day does not move it
  const smooth = prices.map((_, i) => {
    const week = prices.slice(Math.max(0, i - 6), i + 1).filter(v => v != null);
    return week.length >= 3 ? median(week) : null;
  });
  let lastIndex = smooth.length - 1;
  while (lastIndex >= 0 && smooth[lastIndex] == null) lastIndex--;
  if (lastIndex < 0 || length - 1 - lastIndex > MAX_STALE_DAYS) return null;

  const price = smooth[lastIndex];
  const back = (days) => smooth[lastIndex - days] ?? null;
  const change = (days) => back(days) == null ? null : { percent: round(percent(back(days), price)), platinum: round(price - back(days)) };
  let high = 0, low = 0;
  smooth.forEach((v, i) => {
    if (v == null) return;
    if (smooth[high] == null || v > smooth[high]) high = i;
    if (smooth[low] == null || v < smooth[low]) low = i;
  });

  const ma7 = average(prices.slice(lastIndex - 6, lastIndex + 1));
  const ma30 = average(prices.slice(lastIndex - 29, lastIndex + 1));
  const sellVolume7 = average((series.sellVolume ?? []).slice(-7));
  const sellVolume30 = average((series.sellVolume ?? []).slice(-37, -7));
  const stable = stability(smooth.slice(lastIndex - 6 - STABLE_DAYS, lastIndex - 6));
  const change30 = change(30);
  const relic = !!name?.endsWith('Relic');
  const reliable = relic ? variant == 'intact' && (basis == 'closed' || sellVolume7 >= RELIC_MIN_SELL_VOLUME) : basis == 'closed';

  let status = null;
  const broke = stable && Math.abs(percent(stable.value, price)) >= BROKE_PERCENT && Math.abs(price - stable.value) >= BROKE_PLATINUM;
  if (stable && stable.share >= STABLE_SHARE) status = reliable && broke ? 'broke' : 'stable';
  else if (reliable && change30 && Math.abs(change30.percent) >= TREND_PERCENT && Math.abs(change30.platinum) >= TREND_PLATINUM
    && Math.max(price, back(30)) >= TREND_MIN_PRICE) status = change30.percent > 0 ? 'rising' : 'falling';

  return {
    id, name, relic, basis, status,
    date: offset(lastIndex),
    price: round(price),
    change7: change(7),
    change30,
    change90: change(90),
    ma7: round(ma7),
    ma30: round(ma30),
    slope30: round(slope(smooth.slice(lastIndex - 29, lastIndex + 1)), 2),
    high: { price: round(smooth[high]), date: offset(high) },
    low: { price: round(smooth[low]), date: offset(low) },
    stableValue: stable && stable.share >= STABLE_SHARE ? stable.value : null,
    closedVolume7: round(average((series.closedVolume ?? []).slice(-7))),
    sellVolume7: round(sellVolume7),
    supplyChange: round(percent(sellVolume30, sellVolume7)),
  };
}

export function buildSummary() {
  const index = read(new URL('index.json', output));
  const names = new Map(read(new URL('../src/shared/jsons/tradeable/tradeables.json', import.meta.url)).map(t => [t.id, t.name_en]));
  const entries = [];
  for (const folder of readdirSync(output, { withFileTypes: true }).filter(f => f.isDirectory())) {
    for (const file of readdirSync(new URL(`${folder.name}/`, output))) {
      const id = file.slice(0, -5);
      const item = read(new URL(`${folder.name}/${file}`, output));
      for (const [variant, series] of Object.entries(item.series)) {
        const entry = summarize(id, names.get(id), variant, series, item.start);
        if (entry) entries.push({ variant, ...entry });
      }
    }
  }
  //Names are only for reading the terminal; the screen takes them from tradeables.json
  writeFileSync(new URL('summary.json', output), JSON.stringify({ date: index.last, items: entries.map(({ name, ...e }) => e) }));

  const label = (e) => `${e.name}${e.variant ? ` (${e.variant})` : ''}`;
  const show = (title, list, value) => {
    console.log(`\n${title}`);
    list.slice(0, 10).forEach(e => console.log(`  ${label(e)}: ${value(e)}`));
  };
  const before = (e) => round(e.price - e.change30.platinum);
  for (const relic of [false, true]) {
    const group = entries.filter(e => e.relic == relic);
    const by = (status) => group.filter(e => e.status == status);
    const title = relic ? 'Relics' : 'Items';
    console.log(`\n${title}: ${group.length} series, ${by('rising').length} rising, ${by('falling').length} falling, ${by('stable').length} stable, ${by('broke').length} broke the pattern`);
    show(`${title} rising (30 days)`, by('rising').sort((a, b) => b.change30.percent - a.change30.percent),
      e => `${before(e)} -> ${e.price} (+${e.change30.percent}%), ${e.basis}`);
    show(`${title} falling (30 days)`, by('falling').sort((a, b) => a.change30.percent - b.change30.percent),
      e => `${before(e)} -> ${e.price} (${e.change30.percent}%), ${e.basis}`);
    show(`${title} broke the pattern`, by('broke').sort((a, b) => Math.abs(percent(b.stableValue, b.price)) - Math.abs(percent(a.stableValue, a.price))),
      e => `usually ${e.stableValue}, now ${e.price}, ${e.basis}`);
  }
}

//Run on its own to recalculate only the summary
if (process.argv[1] == fileURLToPath(import.meta.url)) buildSummary();
