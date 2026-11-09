import 'fake-indexeddb/auto';
import { ItemJsons } from '../models/item-jsons.model';
import { Util } from '../utils/util';
import { ProgressDb } from './progress-db';
import { EXPORT_APP, EXPORT_VERSION } from './progress.model';
import { ProgressStore } from './progress.store';
import starChart from '../jsons/locations.json';
import incarnon from '../jsons/incarnon.json';
import warframesJson from '../jsons/warframes.json';

describe('ProgressStore', () => {
  const jsons = new ItemJsons();
  const ash = warframesJson.find(w => w.name == 'Ash')!;
  const node = starChart[0];
  let store: ProgressStore;

  async function loadedStore(): Promise<ProgressStore> {
    const s = new ProgressStore();
    await s.load();
    return s;
  }

  async function saved(data: unknown) {
    await new ProgressDb().save(data as any);
  }

  function exportFile(data: unknown, overrides: object = {}): string {
    return JSON.stringify({ app: EXPORT_APP, version: EXPORT_VERSION, exportedAt: '', data, ...overrides });
  }

  beforeEach(async () => {
    store = await loadedStore();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await store.reset();
  });

  describe('without saved data', () => {
    it('builds every category from the item JSONs, unmastered and sorted by name', () => {
      for (const type of Util.itemTypes) {
        const items = store.account()[type];
        expect(items.length, type).toBe(jsons[type].length);
        expect(items.every(i => !i.mastered), type).toBe(true);
        expect(items.map(i => i.name), type).toEqual([...items.map(i => i.name)].sort((a, b) => a.localeCompare(b)));
      }
    });

    it('counts every item', () => {
      const total = Util.itemTypes.reduce((sum, type) => sum + jsons[type].length, 0);
      expect(store.itemsCount).toBe(total);
    });

    it('builds the Star Chart and Incarnon lists', () => {
      expect(store.account().locations.length).toBe(starChart.length);
      expect(store.account().incarnons.length).toBe(incarnon.length);
    });

    it('copies item data from the JSON', () => {
      const built = store.account().warframes.find(i => i.name == ash.name)!;

      expect(built.type).toBe('warframes');
      expect(built.acquisition).toBe(ash.acquisition);
      expect(built.mastery_requirement).toBe(ash.mastery_requirement);
      expect(built.mastery_xp).toBe(ash.mastery_xp);
    });

    it('starts at Mastery Rank 0 with the default settings', () => {
      expect(store.account().xp).toBe(0);
      expect(store.masteryRank().rank).toBe(0);
      expect(store.nextRank().rank).toBe(1);
      expect(store.lang()).toBe('en');
      expect(store.options()).toEqual({ hideMastered: false, showOnlyMrAvailable: true, hideFounders: true });
      expect(store.marketIds()).toEqual([]);
    });
  });

  describe('with saved data', () => {
    it('restores the progress and calculates XP and rank', async () => {
      await saved({ mastered: { warframes: [ash.name] }, locations: [node.name], steelPath: [node.name], railjack: 2, lang: 'pt' });

      const s = await loadedStore();
      const { masteryRank, nextRank } = { masteryRank: s.masteryRank(), nextRank: s.nextRank() };

      expect(s.account().warframes.filter(i => i.mastered).map(i => i.name)).toEqual([ash.name]);
      expect(s.account().xp).toBe(ash.mastery_xp + 2 * 1500 + node.mastery_exp * 2);
      expect(s.account().mastered).toBe(1);
      expect(masteryRank.xp).toBeLessThanOrEqual(s.account().xp);
      expect(nextRank.xp).toBeGreaterThan(s.account().xp);
      expect(nextRank.rank).toBe(masteryRank.rank + 1);
      expect(s.lang()).toBe('pt');
    });

    it('ignores saved names that no longer exist in the JSONs', async () => {
      await saved({ mastered: { warframes: ['Removed Frame'] }, locations: ['Removed Node'], incarnons: ['Removed Incarnon'] });

      const s = await loadedStore();

      expect(s.account().xp).toBe(0);
      expect(s.account().mastered).toBe(0);
      expect(s.account().incarnons.every(i => !i.acquired)).toBe(true);
    });

    it('falls back to the defaults when the stored value is invalid', async () => {
      await saved('not an object');

      const s = await loadedStore();

      expect(s.account().xp).toBe(0);
      expect(s.lang()).toBe('en');
    });
  });

  describe('actions', () => {
    it('toggles an item', () => {
      store.toggleItem('warframes', ash.name);
      expect(store.account().warframes.find(i => i.name == ash.name)!.mastered).toBe(true);
      expect(store.account().xp).toBe(ash.mastery_xp);

      store.toggleItem('warframes', ash.name);
      expect(store.account().warframes.find(i => i.name == ash.name)!.mastered).toBe(false);
      expect(store.account().xp).toBe(0);
    });

    it('toggles a Star Chart node and its Steel Path', () => {
      store.toggleLocation(node.name);
      store.toggleSteelPath(node.name);

      const built = store.account().locations.find(l => l.name == node.name)!;
      expect(built.mastered).toBe(true);
      expect(built.steel_path).toBe(true);
      expect(store.account().xp).toBe(node.mastery_exp * 2);
    });

    it('marks Steel Path only after the normal node', () => {
      store.toggleSteelPath(node.name);

      expect(store.account().locations.find(l => l.name == node.name)!.steel_path).toBe(false);
    });

    it('unmarks Steel Path together with the normal node', () => {
      store.toggleLocation(node.name);
      store.toggleSteelPath(node.name);
      store.toggleLocation(node.name);

      const built = store.account().locations.find(l => l.name == node.name)!;
      expect(built.mastered).toBe(false);
      expect(built.steel_path).toBe(false);
      expect(store.account().xp).toBe(0);
    });

    it('still unmarks a saved Steel Path without its normal node', async () => {
      await saved({ steelPath: [node.name] });
      const s = await loadedStore();

      s.toggleSteelPath(node.name);

      expect(s.account().locations.find(l => l.name == node.name)!.steel_path).toBe(false);
    });

    it('toggles an Incarnon', () => {
      store.toggleIncarnon(incarnon[0].name);

      expect(store.account().incarnons.find(i => i.name == incarnon[0].name)!.acquired).toBe(true);
    });

    it.each([
      [-3, 0], [999, 50], [7.9, 7], [NaN, 0], [12, 12],
    ])('limits Railjack intrinsics: %s becomes %s', (value, expected) => {
      store.setRailjack(value);
      expect(store.railjack()).toBe(expected);
    });

    it('limits Drifter intrinsics to 40', () => {
      store.setDrifter(999);
      expect(store.drifter()).toBe(40);
    });

    it('merges option changes', () => {
      store.setOptions({ hideMastered: true });

      expect(store.options()).toEqual({ hideMastered: true, showOnlyMrAvailable: true, hideFounders: true });
    });

    it('keeps the market list newest first and without duplicates', () => {
      store.addMarketItem('a');
      store.addMarketItem('b');
      store.addMarketItem('a');
      expect(store.marketIds()).toEqual(['b', 'a']);

      store.removeMarketItem('b');
      expect(store.marketIds()).toEqual(['a']);
    });
  });

  describe('persistence', () => {
    it('saves only the user progress and restores it', async () => {
      store.toggleItem('warframes', ash.name);
      store.toggleLocation(node.name);
      store.setRailjack(3);
      store.setLang('pt');
      await store.flush();

      expect(await new ProgressDb().load()).toEqual({
        mastered: { warframes: [ash.name] },
        locations: [node.name],
        steelPath: [],
        incarnons: [],
        railjack: 3,
        drifter: 0,
        lang: 'pt',
        options: { hideMastered: false, showOnlyMrAvailable: true, hideFounders: true },
        market: [],
      });

      const reloaded = await loadedStore();
      expect(reloaded.account().xp).toBe(store.account().xp);
      expect(reloaded.lang()).toBe('pt');
    });

    it('groups quick changes into a single save', async () => {
      const save = vi.spyOn(ProgressDb.prototype, 'save');

      store.setRailjack(1);
      store.setRailjack(2);
      store.setRailjack(3);
      await store.flush();

      expect(save).toHaveBeenCalledTimes(1);
    });

    it('reset deletes the saved progress without touching localStorage', async () => {
      window.localStorage.setItem('other-app', 'keep');
      store.toggleItem('warframes', ash.name);
      await store.flush();

      await store.reset();

      expect(store.account().xp).toBe(0);
      expect(await new ProgressDb().load()).toBeUndefined();
      expect(window.localStorage.getItem('other-app')).toBe('keep');
      window.localStorage.clear();
    });
  });

  describe('export / import', () => {
    it('restores an exported progress in another store', async () => {
      store.toggleItem('warframes', ash.name);
      store.toggleIncarnon(incarnon[0].name);
      store.setDrifter(5);
      const file = store.exportData();
      await store.reset();

      await store.importData(file);

      expect(store.account().warframes.find(i => i.name == ash.name)!.mastered).toBe(true);
      expect(store.account().incarnons.find(i => i.name == incarnon[0].name)!.acquired).toBe(true);
      expect(store.drifter()).toBe(5);
    });

    it('saves the imported progress right away', async () => {
      await store.importData(exportFile({ railjack: 4 }));

      expect((await new ProgressDb().load() as any).railjack).toBe(4);
    });

    it('cleans invalid values from the imported file', async () => {
      await store.importData(exportFile({ railjack: 999, mastered: { warframes: [ash.name, 42, null] }, lang: 'xx' }));

      expect(store.railjack()).toBe(50);
      expect(store.account().mastered).toBe(1);
      expect(store.lang()).toBe('en');
    });

    it.each([
      ['not json', 'invalid_file'],
      [JSON.stringify({ app: 'other', version: 1, data: {} }), 'invalid_file'],
      [JSON.stringify({ app: EXPORT_APP, version: 1 }), 'invalid_file'],
      [JSON.stringify({ app: EXPORT_APP, version: EXPORT_VERSION + 1, data: {} }), 'newer_version'],
    ])('rejects %s and keeps the current progress', async (file, reason) => {
      store.toggleItem('warframes', ash.name);

      await expect(store.importData(file)).rejects.toThrow(reason);

      expect(store.account().xp).toBe(ash.mastery_xp);
    });
  });
});
