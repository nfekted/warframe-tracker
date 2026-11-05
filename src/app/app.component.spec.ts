import { TranslocoService } from '@jsverse/transloco';
import { AppComponent } from './app.component';
import { Util } from '../shared/utils/util';
import { ItemJsons } from '../shared/models/item-jsons.model';
import starChart from '../shared/jsons/locations.json';
import incarnon from '../shared/jsons/incarnon.json';
import warframesJson from '../shared/jsons/warframes.json';

describe('AppComponent initial load', () => {
  let transloco: { getActiveLang: ReturnType<typeof vi.fn>, setActiveLang: ReturnType<typeof vi.fn> };
  const jsons = new ItemJsons();

  function create(): AppComponent {
    const app = new AppComponent(transloco as unknown as TranslocoService);
    app.ngOnInit();
    return app;
  }

  function save(data: object) {
    window.localStorage.setItem(Util.cookieName, JSON.stringify(data));
  }

  beforeEach(() => {
    window.localStorage.clear();
    transloco = { getActiveLang: vi.fn(() => 'en'), setActiveLang: vi.fn() };
  });

  describe('without saved data', () => {
    it('builds every category from the item JSONs', () => {
      const app = create();

      for (const type of Util.itemTypes) {
        expect(app.account[type].length, type).toBe(jsons[type].length);
        expect(app.account[type].every(i => !i.mastered), type).toBe(true);
      }
    });

    it('counts every item', () => {
      const app = create();
      const total = Util.itemTypes.reduce((sum, type) => sum + jsons[type].length, 0);

      expect(app.itemsCount).toBe(total);
    });

    it('builds the Star Chart and Incarnon lists', () => {
      const app = create();

      expect(app.account.locations.length).toBe(starChart.length);
      expect(app.account.incarnons.length).toBe(incarnon.length);
    });

    it('copies item data from the JSON', () => {
      const app = create();
      const source = warframesJson[0];
      const built = app.account.warframes.find(i => i.name == source.name);

      expect(built.type).toBe('warframes');
      expect(built.acquisition).toBe(source.acquisition);
      expect(built.mastery_requirement).toBe(source.mastery_requirement);
    });

    it('starts at Mastery Rank 0', () => {
      const app = create();

      expect(app.account.masteryRank.rank).toBe(0);
      expect(app.nextRank.rank).toBe(1);
    });

    it('keeps the active language and does not set it', () => {
      const app = create();

      expect(app.lang).toBe('en');
      expect(transloco.setActiveLang).not.toHaveBeenCalled();
    });
  });

  describe('with saved data', () => {
    const ash = warframesJson.find(w => w.name == 'Ash');

    beforeEach(() => {
      save({
        warframes: [{ name: ash.name, type: 'warframes', acquisition: ash.acquisition, mastery_requirement: 0, mastered: true }],
        railjack: 2,
        lang: 'pt',
      });
    });

    it('keeps saved items mastered and adds the rest unmastered, without duplicates', () => {
      const app = create();
      const mastered = app.account.warframes.filter(i => i.mastered);

      expect(app.account.warframes.length).toBe(warframesJson.length);
      expect(mastered.map(i => i.name)).toEqual(['Ash']);
      expect(new Set(app.account.warframes.map(i => i.name)).size).toBe(warframesJson.length);
    });

    it('drops saved items that no longer exist in the JSON', () => {
      save({ warframes: [{ name: 'Removed Frame', type: 'warframes', acquisition: '', mastery_requirement: 0, mastered: true }] });

      const app = create();

      expect(app.account.warframes.some(i => i.name == 'Removed Frame')).toBe(false);
      expect(app.account.xp).toBe(0);
    });

    it('takes item data from the JSON instead of the saved copy', () => {
      save({ warframes: [{ name: ash.name, type: 'warframes', acquisition: 'Old', mastery_requirement: 99, mastered: true }] });

      const app = create();
      const built = app.account.warframes.find(i => i.name == ash.name);

      expect(built.mastered).toBe(true);
      expect(built.acquisition).toBe(ash.acquisition);
      expect(built.mastery_requirement).toBe(ash.mastery_requirement);
      expect(built.mastery_xp).toBe(ash.mastery_xp);
    });

    it('calculates XP from the saved progress', () => {
      const app = create();

      expect(app.account.xp).toBe(6000 + 2 * 1500);
      expect(app.account.mastered).toBe(1);
    });

    it('places the account between its rank and the next one', () => {
      const app = create();
      const { masteryRank } = app.account;

      expect(masteryRank.xp).toBeLessThanOrEqual(app.account.xp);
      expect(app.nextRank.xp).toBeGreaterThan(app.account.xp);
      expect(app.nextRank.rank).toBe(masteryRank.rank + 1);
    });

    it('applies the saved language', () => {
      const app = create();

      expect(transloco.setActiveLang).toHaveBeenCalledWith('pt');
      expect(app.lang).toBe('pt');
    });
  });

  describe('calculate', () => {
    it('updates XP and rank and saves the progress', () => {
      const app = create();
      app.account.necramechs[0].mastered = true;

      app.calculate();

      expect(app.account.xp).toBe(8000);
      expect(app.account.masteryRank.xp).toBeLessThanOrEqual(8000);
      expect(app.nextRank.xp).toBeGreaterThan(8000);
      expect(Util.load().necramechs.map(i => i.name)).toEqual([app.account.necramechs[0].name]);
    });
  });
});
