import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import tradeables from '../../shared/jsons/tradeable/tradeables.json';
import itemPrices from '../../shared/jsons/tradeable/tradePrices.json';
import { MARKET_DATA } from '../../shared/metadata';
import { ProgressStore } from '../../shared/store/progress.store';
import { BestRelicsComponent } from './best-relics/best-relics.component';
import { BestItemsComponent } from './best-items/best-items.component';

type ItemPrice = { id: string, url: string, name: string, lowest: number, higher: number, average: number, most_frequent: number };

@Component({
    selector: 'app-market',
    imports: [FormsModule, BestRelicsComponent, BestItemsComponent],
    templateUrl: './market.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './market.component.scss'
})
export class MarketComponent {
  private store = inject(ProgressStore);
  private prices = new Map<string, ItemPrice>(itemPrices.map(p => [p.id, p]));

  tradeableList: { id: string, url: string, name_en: string, name_pt: string }[] = tradeables;
  marketData = MARKET_DATA;

  //Clicking the same column again reverses the order
  private sortState = signal<{ field: keyof ItemPrice, desc: boolean } | null>(null);
  lastSort = computed(() => {
    const sort = this.sortState();
    return sort && !sort.desc ? sort.field : '';
  });

  searchTerm: string = '';
  filteredItems = [];

  //Saved ids that are no longer in the price list are skipped
  myList = computed(() => {
    const list = this.store.marketIds().map(id => this.prices.get(id)).filter(p => p);
    const sort = this.sortState();
    if (!sort) return list;

    const { field, desc } = sort;
    return [...list].sort((a, b) => {
      const result = typeof a[field] == 'number' ? +a[field] - +b[field] : String(a[field]).localeCompare(String(b[field]));
      return desc ? -result : result;
    });
  });

  onSearchChange(event: any) {
    this.searchTerm = event.target.value;
    this.filterItems();
  }

  filterItems() {
    if (!this.searchTerm) {
      this.filteredItems = [];
      return;
    }
    const filterValue = this.searchTerm.toLowerCase();
    this.filteredItems = this.tradeableList.filter(item =>
      item.name_en.toLowerCase().includes(filterValue) || item.name_pt.toLocaleLowerCase().includes(filterValue)
    );
  }

  selectItem(item: { id: string }) {
    this.searchTerm = '';
    this.filteredItems = [];
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
