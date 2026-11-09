import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';

import tradeables from '../../shared/jsons/tradeable/tradeables.json';
import itemPrices from '../../shared/jsons/tradeable/tradePrices.json';
import { MARKET_DATA } from '../../shared/metadata';
import { TranslocoModule } from '@jsverse/transloco';
import { ProgressStore } from '../../shared/store/progress.store';
import { BestRelicsComponent } from './best-relics/best-relics.component';
import { BestItemsComponent } from './best-items/best-items.component';

type ItemPrice = { id: string, url: string, name: string, lowest: number, higher: number, average: number, most_frequent: number };
type Tradeable = { id: string, url: string, name_en: string, name_pt: string };

const SEARCH_DELAY = 150;
const MAX_RESULTS = 50;

//Lower case and without accents, so "lamina" finds "Lâmina"
export const normalize = (text: string) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

//English and Portuguese names normalized once; items without a price are left out, as they could not be added
const PRICED = new Set(itemPrices.map(p => p.id));
const SEARCH_INDEX = tradeables
  .filter(item => PRICED.has(item.id))
  .map(item => ({ item, text: normalize(item.name_en + '\n' + item.name_pt) }));

@Component({
    selector: 'app-market',
    imports: [BestRelicsComponent, BestItemsComponent, TranslocoModule],
    templateUrl: './market.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './market.component.scss'
})
export class MarketComponent {
  private store = inject(ProgressStore);
  private prices = new Map<string, ItemPrice>(itemPrices.map(p => [p.id, p]));

  tradeableCount = tradeables.length;
  lang = this.store.lang;
  marketData = MARKET_DATA;

  //Clicking the same column again reverses the order
  private sortState = signal<{ field: keyof ItemPrice, desc: boolean } | null>(null);
  lastSort = computed(() => {
    const sort = this.sortState();
    return sort && !sort.desc ? sort.field : '';
  });

  private searchTimer: ReturnType<typeof setTimeout> | undefined;
  private searchTerm = signal('');

  private term = computed(() => normalize(this.searchTerm().trim()));

  //Items already on the list are not suggested again
  filteredItems = computed(() => {
    const term = this.term();
    if (!term) return [];
    const added = new Set(this.store.marketIds());
    const results: Tradeable[] = [];
    for (const entry of SEARCH_INDEX) {
      if (entry.text.includes(term) && !added.has(entry.item.id)) results.push(entry.item);
      if (results.length == MAX_RESULTS) break;
    }
    return results;
  });

  noMatch = computed(() => this.term() != '' && this.filteredItems().length == 0);

  //Saved ids that are no longer in the price list are skipped
  myList = computed(() => {
    const list = this.store.marketIds().map(id => this.prices.get(id)).filter(p => p !== undefined);
    const sort = this.sortState();
    if (!sort) return list;

    const { field, desc } = sort;
    return [...list].sort((a, b) => {
      const result = typeof a[field] == 'number' ? +a[field] - +b[field] : String(a[field]).localeCompare(String(b[field]));
      return desc ? -result : result;
    });
  });

  onSearchChange(value: string) {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.searchTerm.set(value), SEARCH_DELAY);
  }

  selectItem(item: Tradeable, input: HTMLInputElement) {
    clearTimeout(this.searchTimer);
    input.value = '';
    this.searchTerm.set('');
    if (this.prices.has(item.id)) this.store.addMarketItem(item.id);
  }

  removeItem(item: ItemPrice) {
    this.store.removeMarketItem(item.id);
  }

  sort(field: keyof ItemPrice) {
    const current = this.sortState();
    this.sortState.set({ field, desc: current?.field == field && !current.desc });
  }
}
