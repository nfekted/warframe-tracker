import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';

import tradeables from '../../shared/jsons/tradeable/tradeables.json';
import itemPrices from '../../shared/jsons/tradeable/tradePrices.json';
import { Util } from '../../shared/utils/util';
import { MARKET_DATA } from '../../shared/metadata';
import { BestRelicsComponent } from './best-relics/best-relics.component';
import { BestItemsComponent } from './best-items/best-items.component';

@Component({
    selector: 'app-market',
    imports: [FormsModule, BestRelicsComponent, BestItemsComponent],
    templateUrl: './market.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './market.component.scss'
})
export class MarketComponent {

  tradeableList: { id: string, url: string, name_en: string, name_pt: string }[] = tradeables;
  marketData = MARKET_DATA;

  lastSort: string = '';

  searchTerm: string = '';
  filteredItems = [];
  myList: { id: string, url: string, name: string, lowest: number, higher: number, average: number, most_frequent: number }[] = [];

  constructor() { }

  ngOnInit(): void {
    this.myList = Util.loadMarket();
    if (!this.myList) this.myList = [];
    else this.updateMyList();
  }

  updateMyList() {
    if (window.sessionStorage.getItem('updated')) return;
    for (let i = 0; i < this.myList.length; i++) {
      this.myList[i] = itemPrices.find(item => item.id == this.myList[i].id);
    }
    window.sessionStorage.setItem('updated', 'true');
  }

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

  selectItem(item) {
    this.searchTerm = '';
    this.filteredItems = [];
    if (this.myList.find(i => i.id == item.id)) return;

    const result = itemPrices.find(i => i.id == item.id);
    if (result) {
      this.myList.unshift(itemPrices.find(i => i.id == item.id));
      Util.saveMarket(this.myList);
    };
  }

  removeItem(index: number) {
    this.myList.splice(index, 1);
    Util.saveMarket(this.myList);
  }

  sort(field: string) {
    this.myList.sort((a, b) => {
      if (!isNaN(+a[field])) return (this.lastSort == field ? +b[field] - +a[field] : +a[field] - +b[field]);

      return (this.lastSort == field ? b[field].localeCompare(a[field]) : a[field].localeCompare(b[field]));
    });

    this.lastSort == field ? this.lastSort = '' : this.lastSort = field;
  }

}
