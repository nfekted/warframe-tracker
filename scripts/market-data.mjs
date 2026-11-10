import { readFileSync, unlinkSync, writeFileSync } from 'node:fs';

const dir = new URL('../src/shared/jsons/tradeable/', import.meta.url);
const read = (path) => JSON.parse(readFileSync(path, 'utf8'));
const readData = (file) => read(new URL(file, dir));
const write = (file, data) => {
  writeFileSync(new URL(file, dir), JSON.stringify(data, null, 2).replace(/\n/g, '\r\n'));
  console.log(`${file}: ${data.length} entries`);
};

//Saves the download next to this script and returns its path; it is deleted once the import finishes
const downloads = [];
async function download(url, file, headers = {}) {
  //Without a User-Agent of its own the market API answers 403
  const response = await fetch(url, { headers: { ...headers, 'User-Agent': 'WarframeTracker import script' } });
  if (!response.ok) throw new Error(`${url}: ${response.status}`);
  const path = new URL(file, import.meta.url);
  writeFileSync(path, await response.text());
  downloads.push(path);
  console.log(`${file} saved`);
  return path;
}

//Without a file, downloads the item list in Portuguese (it also carries the English names)
async function tradeables(input) {
  input ??= await download('https://api.warframe.market/v2/items', 'tradeable_pt.json', { Language: 'pt' });
  const cleanName = (name) => name.replace(':', '');
  const list = readData('tradeables.json');
  const known = new Set(list.map(t => t.id));
  const added = read(input).data.filter(item => !known.has(item.id)).map(item => ({
    id: item.id,
    url: item.slug,
    name_en: cleanName(item.i18n.en.name),
    name_pt: item.i18n.pt ? cleanName(item.i18n.pt.name) : 'PLACEHOLDER',
  }));
  write('tradeables.json', [...list, ...added]);
  console.log(`${added.length} new, ${added.filter(t => t.name_pt == 'PLACEHOLDER').length} waiting for a Portuguese name`);
}

//Without a file, downloads the newest daily price history, going back from today until one is published
async function latestPrices() {
  const day = new Date();
  for (let i = 0; i < 7; i++, day.setUTCDate(day.getUTCDate() - 1)) {
    const file = `price_history_${day.toISOString().slice(0, 10)}.json`;
    try {
      return await download(`https://relics.run/history/${file}`, file);
    } catch (error) {
      console.log(error.message);
    }
  }
  throw new Error('No price history in the last 7 days');
}

async function prices(input) {
  input ??= await latestPrices();
  const byId = new Map(readData('tradeables.json').map(t => [t.id, t]));
  const list = [];

  for (const stats of Object.values(read(input))) {
    let sell = stats.filter(s => s.order_type == 'sell');
    if (sell.length > 1) sell = sell.filter(s => s.mod_rank == 0);
    if (sell.length != 1) continue;

    const stat = sell[0];
    const info = byId.get(stat.item_id);
    if (!info) continue;

    list.push({
      id: stat.item_id,
      url: info.url,
      name: info.name_en,
      lowest: +stat.min_price,
      higher: +stat.max_price,
      average: +(+stat.avg_price).toFixed(0),
      most_frequent: +stat.median,
    });
  }

  write('tradePrices.json', list.filter(i => i.average > 0 && i.higher > 0 && i.lowest > 0));
}

//Without a file, downloads the official PC drop tables page; only its Relics section is read
async function relics(input) {
  //The official address redirects to wherever the page is hosted
  input ??= await download('https://www.warframe.com/droptables', 'droptables.html');
  const byName = new Map(readData('tradePrices.json').map(p => [p.name.toLowerCase(), p]));
  const html = readFileSync(input, 'utf8');
  const start = html.indexOf('id="relicRewards"');
  const section = html.slice(start, html.indexOf('<h3', start));
  const text = (cell) => cell.replace(/&amp;/g, '&').replace(/&#39;/g, "'").trim();
  console.log(`Drop tables: ${html.match(/Last Update:<\/b>\s*([^<]+)/)?.[1].trim()}`);
  const list = [];

  //Each relic is a header row followed by its rewards: <tr><td>item</td><td>Rarity (chance%)</td></tr>
  for (const table of section.split('<tr class="blank-row">')) {
    const relicName = text(table.match(/<th[^>]*>([^<]*)<\/th>/)?.[1] ?? '');
    if (!relicName.endsWith('Relic (Radiant)')) continue;

    //Each drop keeps its own chance, so sorting by price does not mix them up
    const drops = [...table.matchAll(/<td>([^<]*)<\/td><td>[^<(]*\(([\d.]+)%\)<\/td>/g)].map(([, name, chance]) =>
      ({ price: byName.get(text(name).toLowerCase()), chance: +chance })).filter(d => d.price);

    if (!drops.length) continue;
    drops.sort((a, b) => a.price.most_frequent - b.price.most_frequent);
    const worst = drops[0].price;
    const best = drops[drops.length - 1].price;

    list.push({
      name: relicName,
      worst: worst.most_frequent,
      best: best.most_frequent,
      expected: Math.round(drops.reduce((sum, d) => sum + d.price.most_frequent * d.chance / 100, 0)),
      worst_name: worst.name,
      best_name: best.name,
      worst_url: worst.url,
      best_url: best.url,
    });
  }

  write('relics.json', list);
}

const [command, input] = process.argv.slice(2);
const commands = { tradeables, prices, relics };

if (command && !commands[command]) {
  console.error('Usage: node scripts/market-data.mjs [tradeables|prices|relics] [input file] (without a file, the source is downloaded; without a command, all three run in order)');
  process.exit(1);
}
if (command) await commands[command](input);
//Each step reads what the one before wrote
else for (const step of Object.values(commands)) await step();
//Only after a successful import, so a failed one leaves its download to look at
downloads.forEach(path => unlinkSync(path));
