// Generates the market JSONs in src/shared/jsons/tradeable from raw exports.
//
//   node scripts/market-data.mjs tradeables <items.json>
//     items.json: warframe.market v2 items list ({ data: [{ id, slug, i18n: { en: { name }, pt: { name } } }] })
//     writes tradeables.json
//
//   node scripts/market-data.mjs prices <statistics.json>
//     statistics.json: { [key]: [{ item_id, order_type, mod_rank, min_price, max_price, avg_price, median }] }
//     reads tradeables.json, writes tradePrices.json
//
//   node scripts/market-data.mjs relics <drop-table.txt>
//     drop-table.txt: relic drop table as text, one "<Relic> Relic (Radiant)" line followed by its 6 drop lines
//     ("<Item> <Common|Uncommon|Rare> (<chance>%)")
//     reads tradePrices.json, writes relics.json

import { readFileSync, writeFileSync } from 'node:fs';

const dir = new URL('../src/shared/jsons/tradeable/', import.meta.url);
const read = (path) => JSON.parse(readFileSync(path, 'utf8'));
const readData = (file) => read(new URL(file, dir));
const write = (file, data) => {
  writeFileSync(new URL(file, dir), JSON.stringify(data, null, 2).replace(/\n/g, '\r\n'));
  console.log(`${file}: ${data.length} entries`);
};

function tradeables(input) {
  const cleanName = (name) => name.replace(':', '');
  const list = read(input).data.map(item => ({
    id: item.id,
    url: item.slug,
    name_en: cleanName(item.i18n.en.name),
    name_pt: cleanName((item.i18n.pt ?? item.i18n.en).name),
  }));
  write('tradeables.json', list);
}

function prices(input) {
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

function relics(input) {
  const byName = new Map(readData('tradePrices.json').map(p => [p.name.toLowerCase(), p]));
  const lines = readFileSync(input, 'utf8').split(/\r?\n/);
  const list = [];

  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].includes('Relic (Radiant)')) continue;
    const relicName = lines[i].split(',')[0].trim();

    //Each drop keeps its own chance, so sorting by price does not mix them up
    const drops = lines.slice(i + 1, i + 7).map(line => {
      const cell = line.split(',')[0];
      const chance = +cell.split('(')[1].split('%')[0];
      const name = cell.split(/Common|Uncommon|Rare/)[0].trim();
      return { price: byName.get(name.toLowerCase()), chance };
    }).filter(d => d.price);
    i += 6;

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

if (!commands[command] || !input) {
  console.error('Usage: node scripts/market-data.mjs <tradeables|prices|relics> <input file>');
  process.exit(1);
}
commands[command](input);
