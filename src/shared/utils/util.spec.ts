import { Account } from '../models/account.model';
import { Item } from '../models/item.model';
import { ItemJsons } from '../models/item-jsons.model';
import { StarChart } from '../models/star-chart.model';
import { INTRINSICS } from '../metadata';
import starChart from '../jsons/locations.json';
import { ItemType, Util } from './util';

function item(type: ItemType, name: string, mastery_xp: number, mastered: boolean = true): Item {
  const i = new Item(name, type, '', 0, mastery_xp);
  i.mastered = mastered;
  return i;
}

function location(mastery_exp: number, mastered: boolean, steel_path: boolean): StarChart {
  const l = new StarChart('Node', mastery_exp, 'Earth');
  l.mastered = mastered;
  l.steel_path = steel_path;
  return l;
}

describe('Item JSON mastery XP', () => {
  const jsons = new ItemJsons();
  const xpByType: Record<ItemType, number> = {
    companion_weapon: 3000, amps: 3000, zaws: 3000, kitguns: 3000, archwing_melee: 3000,
    archwing_primary: 3000, melees: 3000, pistols: 3000, rifles: 3000,
    warframes: 6000, archwings: 6000, plexus: 6000, kdrives: 6000, hounds: 6000, moas: 6000,
    sentinels: 6000, kubrows: 6000, kavats: 6000, predasites: 6000, vulpaphylas: 6000,
    necramechs: 8000,
  };

  //Kuva, Tenet and Coda weapons (and Paracesis) give 1000 extra XP
  function hasBonus(type: ItemType, name: string): boolean {
    const special = ['KUVA ', 'CODA ', 'TENET '].some(prefix => name.toUpperCase().includes(prefix));
    if (type == 'rifles' || type == 'pistols') return special;
    if (type == 'melees') return special || name == 'Paracesis';
    if (type == 'archwing_primary') return name.toUpperCase().includes('KUVA ');
    return false;
  }

  it.each(Util.itemTypes)('every %s item has the XP of its category', (type) => {
    for (const data of jsons[type]) {
      const expected = xpByType[type] + (hasBonus(type, data.name) ? 1000 : 0);
      expect(data.mastery_xp, data.name).toBe(expected);
    }
  });

  it.each([
    ['rifles', 'Kuva Bramma'],
    ['rifles', 'Tenet Arca Plasmor'],
    ['pistols', 'Coda Catabolyst'],
    ['melees', 'Kuva Shildeg'],
    ['melees', 'Paracesis'],
    ['archwing_primary', 'Kuva Ayanga'],
  ] as [ItemType, string][])('%s "%s" gives 4000 XP', (type, name) => {
    expect(jsons[type].find(i => i.name == name).mastery_xp).toBe(4000);
  });
});

describe('Util.calculate', () => {
  let account: Account;

  beforeEach(() => {
    account = new Account();
  });

  it('returns zero for an empty account', () => {
    Util.calculate(account);

    expect(account.xp).toBe(0);
    expect(account.mastered).toBe(0);
  });

  it('sums the XP of mastered items from every category', () => {
    account.warframes.push(item('warframes', 'Ash', 6000));
    account.rifles.push(item('rifles', 'Kuva Bramma', 4000));
    account.necramechs.push(item('necramechs', 'Voidrig', 8000));
    account.kitguns.push(item('kitguns', 'Catchmoon', 3000));

    Util.calculate(account);

    expect(account.xp).toBe(6000 + 4000 + 8000 + 3000);
    expect(account.mastered).toBe(4);
  });

  it('ignores items that are not mastered', () => {
    account.warframes.push(item('warframes', 'Ash', 6000, false));
    account.rifles.push(item('rifles', 'Braton', 3000, false));

    Util.calculate(account);

    expect(account.xp).toBe(0);
    expect(account.mastered).toBe(0);
  });

  it('gives 1500 XP per Railjack and Drifter intrinsic rank', () => {
    account.railjack = 10;
    account.drifter = 5;

    Util.calculate(account);

    expect(account.xp).toBe(15 * 1500);
    expect(account.mastered).toBe(0);
  });

  it('counts Star Chart XP for normal and Steel Path completion', () => {
    account.locations.push(location(100, true, false));
    account.locations.push(location(50, true, true));
    account.locations.push(location(200, false, false));

    Util.calculate(account);

    expect(account.xp).toBe(100 + 50 * 2);
    expect(account.mastered).toBe(0);
  });

  it('adds every source together', () => {
    account.warframes.push(item('warframes', 'Ash', 6000));
    account.rifles.push(item('rifles', 'Kuva Bramma', 4000));
    account.railjack = 2;
    account.locations.push(location(100, true, true));

    Util.calculate(account);

    expect(account.xp).toBe(6000 + 4000 + 3000 + 200);
    expect(account.mastered).toBe(2);
  });
});

describe('Util.maxXp', () => {
  it('equals the XP of an account with everything completed', () => {
    const jsons = new ItemJsons();
    const account = new Account();
    for (const type of Util.itemTypes) {
      account[type] = jsons[type].map(data => item(type, data.name, data.mastery_xp));
    }
    account.locations = starChart.map(node => location(node.mastery_exp, true, true));
    account.railjack = INTRINSICS.railjackMax;
    account.drifter = INTRINSICS.drifterMax;

    Util.calculate(account);

    expect(Util.maxXp()).toBe(account.xp);
  });
});

describe('Util.save / Util.load', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('returns null when nothing was saved', () => {
    expect(Util.load()).toBeNull();
  });

  it('stores only mastered items and drops computed fields', () => {
    const account = new Account();
    account.warframes.push(item('warframes', 'Ash', 6000), item('warframes', 'Excalibur', 6000, false));
    account.railjack = 3;
    Util.calculate(account);

    Util.save(account);
    const saved = Util.load();

    expect(saved.warframes.map((i: Item) => i.name)).toEqual(['Ash']);
    expect(saved.railjack).toBe(3);
    expect(saved.xp).toBeUndefined();
    expect(saved.mastered).toBeUndefined();
    expect(saved.masteryRank).toBeUndefined();
  });

  it('does not modify the account being saved', () => {
    const account = new Account();
    account.warframes.push(item('warframes', 'Ash', 6000), item('warframes', 'Excalibur', 6000, false));
    Util.calculate(account);

    Util.save(account);

    expect(account.warframes.length).toBe(2);
    expect(account.xp).toBe(6000);
  });
});
