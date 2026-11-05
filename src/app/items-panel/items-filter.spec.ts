import { Account } from '../../shared/models/account.model';
import { Item } from '../../shared/models/item.model';
import { ItemType } from '../../shared/utils/util';
import { filterCategories, ItemFilters } from './items-filter';

function item(type: ItemType, name: string, acquisition: string, mastery_requirement: number, mastered = false): Item {
  const i = new Item(name, type, acquisition, mastery_requirement, 3000);
  i.mastered = mastered;
  return i;
}

describe('filterCategories', () => {
  const noFilters: ItemFilters = {
    acquisition: null, name: '', mr: null, rank: 30,
    hideMastered: false, showOnlyMrAvailable: false, hideFounders: false,
  };
  let account: Account;

  beforeEach(() => {
    account = new Account();
    account.warframes = [
      item('warframes', 'Ash', 'Clan Dojo', 0, true),
      item('warframes', 'Excalibur Prime', 'Founder Exclusive', 0),
      item('warframes', 'Wisp', 'Void Relics', 8),
    ];
    account.rifles = [item('rifles', 'Braton', 'Market', 0, true)];
  });

  function visible(filters: Partial<ItemFilters>, type: ItemType = 'warframes'): string[] {
    const category = filterCategories(account, { ...noFilters, ...filters }).find(c => c.type == type);
    return category?.visible.map(i => i.name);
  }

  it('shows every item without filters and keeps all items for the counter', () => {
    const warframes = filterCategories(account, noFilters).find(c => c.type == 'warframes');

    expect(warframes.visible.length).toBe(3);
    expect(warframes.items.length).toBe(3);
  });

  it.each([
    [{ acquisition: 'Void Relics' }, ['Wisp']],
    [{ name: 'prime' }, ['Excalibur Prime']],
    [{ mr: 8 }, ['Wisp']],
    [{ hideMastered: true }, ['Excalibur Prime', 'Wisp']],
    [{ hideFounders: true }, ['Ash', 'Wisp']],
    [{ showOnlyMrAvailable: true, rank: 5 }, ['Ash', 'Excalibur Prime']],
    [{ showOnlyMrAvailable: true, rank: 8 }, ['Ash', 'Excalibur Prime', 'Wisp']],
    [{ hideMastered: true, hideFounders: true }, ['Wisp']],
  ] as [Partial<ItemFilters>, string[]][])('filters %o', (filters, expected) => {
    expect(visible(filters)).toEqual(expected);
  });

  it('hides categories without the selected acquisition', () => {
    expect(visible({ acquisition: 'Void Relics' }, 'rifles')).toBeUndefined();
  });

  it('hides fully mastered categories when hiding mastered items', () => {
    expect(visible({ hideMastered: true }, 'rifles')).toBeUndefined();
    expect(visible({}, 'rifles')).toEqual(['Braton']);
  });
});
