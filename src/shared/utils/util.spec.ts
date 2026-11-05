import { Account } from '../models/account.model';
import { Item } from '../models/item.model';
import { StarChart } from '../models/star-chart.model';
import { Util } from './util';

function item(type: string, name: string, mastered: boolean = true): Item {
  const i = new Item(name, type, '', 0);
  i.mastered = mastered;
  return i;
}

function location(mastery_exp: number, mastered: boolean, steel_path: boolean): StarChart {
  const l = new StarChart('Node', mastery_exp, 'Earth');
  l.mastered = mastered;
  l.steel_path = steel_path;
  return l;
}

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

  it.each([
    'companion_weapon', 'amps', 'zaws', 'kitguns', 'archwing_melee', 'archwing_primary', 'melees', 'pistols', 'rifles',
  ])('gives 3000 XP for a mastered %s', (type) => {
    account[type].push(item(type, 'Plain'));

    Util.calculate(account);

    expect(account.xp).toBe(3000);
    expect(account.mastered).toBe(1);
  });

  it.each([
    'warframes', 'archwings', 'plexus', 'kdrives', 'hounds', 'moas', 'sentinels', 'kubrows', 'kavats', 'predasites', 'vulpaphylas',
  ])('gives 6000 XP for a mastered %s', (type) => {
    account[type].push(item(type, 'Plain'));

    Util.calculate(account);

    expect(account.xp).toBe(6000);
    expect(account.mastered).toBe(1);
  });

  it('gives 8000 XP for a mastered necramech', () => {
    account.necramechs.push(item('necramechs', 'Voidrig'));

    Util.calculate(account);

    expect(account.xp).toBe(8000);
  });

  it('ignores items that are not mastered', () => {
    account.warframes.push(item('warframes', 'Ash', false));
    account.rifles.push(item('rifles', 'Braton', false));

    Util.calculate(account);

    expect(account.xp).toBe(0);
    expect(account.mastered).toBe(0);
  });

  it.each([
    ['rifles', 'Kuva Bramma'],
    ['rifles', 'Tenet Arca Plasmor'],
    ['pistols', 'Coda Catabolyst'],
    ['melees', 'Kuva Shildeg'],
    ['melees', 'Paracesis'],
    ['archwing_primary', 'Kuva Ayanga'],
  ])('adds 1000 bonus XP for %s "%s"', (type, name) => {
    account[type].push(item(type, name));

    Util.calculate(account);

    expect(account.xp).toBe(4000);
    expect(account.mastered).toBe(1);
  });

  it('does not add the bonus to an unmastered Kuva weapon', () => {
    account.rifles.push(item('rifles', 'Kuva Bramma', false));

    Util.calculate(account);

    expect(account.xp).toBe(0);
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
    account.warframes.push(item('warframes', 'Ash'));
    account.rifles.push(item('rifles', 'Kuva Bramma'));
    account.necramechs.push(item('necramechs', 'Voidrig'));
    account.railjack = 2;
    account.locations.push(location(100, true, true));

    Util.calculate(account);

    expect(account.xp).toBe(6000 + 4000 + 8000 + 3000 + 200);
    expect(account.mastered).toBe(3);
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
    account.warframes.push(item('warframes', 'Ash'), item('warframes', 'Excalibur', false));
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
    account.warframes.push(item('warframes', 'Ash'), item('warframes', 'Excalibur', false));
    Util.calculate(account);

    Util.save(account);

    expect(account.warframes.length).toBe(2);
    expect(account.xp).toBe(6000);
  });
});
