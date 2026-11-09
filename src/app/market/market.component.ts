import { Component, ChangeDetectionStrategy, ElementRef, afterNextRender, computed, inject, signal, viewChild } from '@angular/core';

import tradeables from '../../shared/jsons/tradeable/tradeables.json';
import itemPrices from '../../shared/jsons/tradeable/tradePrices.json';
import { MARKET_DATA } from '../../shared/metadata';
import { TranslocoModule } from '@jsverse/transloco';
import { ProgressStore } from '../../shared/store/progress.store';
import { BestRelicsComponent } from './best-relics/best-relics.component';
import { BestItemsComponent } from './best-items/best-items.component';
import { ThousandsPipe } from '../../shared/utils/thousands.pipe';
import { normalize } from '../../shared/utils/normalize';
import { ariaSort, nextSort, SortState, sortRows } from '../../shared/utils/table-sort';
import { Bootstrap } from '../../shared/utils/bootstrap';

type ItemPrice = { id: string, url: string, name: string, lowest: number, higher: number, average: number, most_frequent: number };
type Tradeable = { id: string, url: string, name_en: string, name_pt: string };

const SEARCH_DELAY = 150;
const MAX_RESULTS = 50;
const TAB_KEY = 'marketTab';

//English and Portuguese names normalized once; items without a price are left out, as they could not be added
const PRICED = new Set(itemPrices.map(p => p.id));
const SEARCH_INDEX = tradeables
  .filter(item => PRICED.has(item.id))
  .map(item => ({ item, text: normalize(item.name_en + '\n' + item.name_pt) }));

@Component({
    selector: 'app-market',
    imports: [BestRelicsComponent, BestItemsComponent, TranslocoModule, ThousandsPipe],
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

  columns: { field: keyof ItemPrice, label: string }[] = [
    { field: 'name', label: 'market.item' },
    { field: 'lowest', label: 'market.lowest' },
    { field: 'higher', label: 'market.highest' },
    { field: 'average', label: 'market.average' },
    { field: 'most_frequent', label: 'market.median' },
  ];

  //Clicking the same column again reverses the order
  private sortState = signal<SortState<ItemPrice>>(null);

  private tabs = viewChild.required<ElementRef<HTMLElement>>('tabs');

  //Reopens the tab used last; Bootstrap still switches the tabs (and handles their arrow keys)
  constructor() {
    afterNextRender(() => {
      const tabs = this.tabs().nativeElement;
      const saved = tabs.querySelector(`[data-bs-target="#${localStorage.getItem(TAB_KEY)}"]`);
      if (saved) Bootstrap().Tab.getOrCreateInstance(saved).show();
      tabs.addEventListener('shown.bs.tab', event =>
        localStorage.setItem(TAB_KEY, (event.target as HTMLElement).getAttribute('data-bs-target')!.slice(1)));
    });
  }

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
    return sortRows(list, this.sortState());
  });

  //Whole list valued by the median price
  total = computed(() => this.myList().reduce((sum, item) => sum + item.most_frequent, 0));

  ariaSort(field: keyof ItemPrice) {
    return ariaSort(this.sortState(), field);
  }

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
    this.sortState.set(nextSort(this.sortState(), field));
  }
}
