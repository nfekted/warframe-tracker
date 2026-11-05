import { Account } from '../../shared/models/account.model';
import { Item } from '../../shared/models/item.model';
import { ItemOptions } from '../../shared/store/progress.model';
import { ItemType, Util } from '../../shared/utils/util';

export interface ItemFilters extends ItemOptions {
  acquisition: string | null;
  name: string;
  mr: number | null;
  //Current Mastery Rank, for showOnlyMrAvailable
  rank: number;
}

export interface ItemCategory {
  type: ItemType;
  items: Item[];
  visible: Item[];
}

//Categories to show, each with all its items (for the counter) and the ones that pass the filters
export function filterCategories(account: Account, filters: ItemFilters): ItemCategory[] {
  const name = filters.name.toUpperCase();
  const matches = (item: Item) =>
    (filters.acquisition == null || filters.acquisition == item.acquisition)
    && (!filters.hideMastered || !item.mastered)
    && (!filters.showOnlyMrAvailable || filters.rank >= item.mastery_requirement)
    && (name == '' || item.name.toUpperCase().includes(name))
    && (filters.mr == null || filters.mr == item.mastery_requirement)
    && (!filters.hideFounders || item.acquisition != 'Founder Exclusive');

  return Util.itemTypes
    .filter(type => showCategory(account[type], filters))
    .map(type => ({ type, items: account[type], visible: account[type].filter(matches) }));
}

function showCategory(items: Item[], filters: ItemFilters): boolean {
  if (filters.acquisition != null) return items.some(i => i.acquisition == filters.acquisition);
  if (filters.hideMastered) return items.some(i => !i.mastered);
  return true;
}
