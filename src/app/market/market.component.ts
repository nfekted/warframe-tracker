import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Account } from '../../shared/models/account.model';
import itemEnJson from '../../shared/jsons/tradeable/tradeEn.json';
import itemPtJson from '../../shared/jsons/tradeable/tradePt.json'
import itemPrices from '../../shared/jsons/tradeable/tradePrices.json';
import { Util } from '../../shared/utils/util';
import { BestRelicsComponent } from './best-relics/best-relics.component';
import { BestItemsComponent } from './best-items/best-items.component';
// import priceRaw from '../../shared/jsons/tradeable/trade-raw.json';

@Component({
  selector: 'app-market',
  standalone: true,
  imports: [FormsModule, CommonModule, BestRelicsComponent, BestItemsComponent],
  templateUrl: './market.component.html',
  styleUrl: './market.component.scss'
})
export class MarketComponent {

  @Input() account: Account;
  @Input() itemsCount: number = 0;

  @Output() update = new EventEmitter<void>();

  tradeableList: { id: string, url: string, item_en: string, item_pt: string }[] = [];

  text: string;

  tradeItem: { id: string, url: string, name: string, lowest: number, higher: number, average: number, most_frequent: number }[] = [];
  complete: boolean = false;
  current: number = 0;
  currentItem: string = '';

  lastSort: string = '';

  enableScan: boolean = false;

  searchTerm: string = '';
  filteredItems = [];
  myList: { id: string, url: string, name: string, lowest: number, higher: number, average: number, most_frequent: number }[] = [];

  constructor() { }

  ngOnInit(): void {
    this.makeJson();
    this.loadPrices();
    this.myList = Util.loadMarket();
    if (!this.myList) this.myList = [];
    else this.updateMyList();
  }

  loadPrices() {
    this.tradeItem = itemPrices;
    this.tradeItem.sort((a, b) => { return b.most_frequent - a.most_frequent });
  }

  updateMyList() {
    if (window.sessionStorage.getItem('updated')) return;
    for (let i = 0; i < this.myList.length; i++) {
      this.myList[i] = itemPrices.find(item => item.id == this.myList[i].id);
    }
    window.sessionStorage.setItem('updated', 'true');
  }

  makeJson() {
    this.tradeableList = [];

    const itemEn = new Map<string, { id: string, name: string }>();
    const itemPt = new Map<string, { id: string, name: string }>();
    itemEnJson.payload.items.forEach((item) => itemEn.set(item.url_name, { id: item.id, name: item.item_name.replace(':', '') }));
    itemPtJson.payload.items.forEach((item) => itemPt.set(item.url_name, { id: item.id, name: item.item_name.replace(':', '') }));


    itemEn.forEach((item, url) => {
      const pt = itemPt.get(url);
      this.tradeableList.push({ id: item.id, url: url, item_en: item.name, item_pt: pt.name });
    });
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
      item.item_en.toLowerCase().includes(filterValue) || item.item_pt.toLocaleLowerCase().includes(filterValue)
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

  //Dev only codes
  scan() {
    // this.formatPriceJson();
    // this.formatRelics();
  }

  // formatRelics() {
  //   const lines = this.relicsData.split('\n');
  //   let relics = [];

  //   let relic = { name: '', worst: 0, worst_name: '', best: 0, best_name: '', expected: 0, worst_url: '', best_url: '' };
  //   for (let i = 0; i < lines.length; i++) {
  //     const line = lines[i];
  //     if (line == '') continue;
  //     if (line.includes('Relic (Intact)') || line.includes('Relic (Exceptional)') || line.includes('Relic (Flawless)')) {
  //       i += 6;
  //       continue;
  //     }

  //     if (line.includes('Relic (Radiant)')) {
  //       relic = { name: line.split(',')[0], worst: 0, best: 0, expected: 0, worst_name: '', best_name: '', worst_url: '', best_url: '' };

  //       const drops = [
  //         lines[i + 1].split(','),
  //         lines[i + 2].split(','),
  //         lines[i + 3].split(','),
  //         lines[i + 4].split(','),
  //         lines[i + 5].split(','),
  //         lines[i + 6].split(',')
  //       ];

  //       console.log(i + ` de ` + lines.length)

  //       let items = [];
  //       for (let j = 0; j < 6; j++) {
  //         drops[j][1] = drops[j][0].split('(')[1].split('%')[0];
  //         const name = drops[j][0].split('Common').join('|').split('Uncommon').join('|').split('Rare').join('|').split('|')[0].trim();
  //         items.push(this.tradeItem.find(item => item.name.toLocaleLowerCase() == name.toLocaleLowerCase()));
  //       }

  //       items = items.filter(i => i != undefined);
  //       items.sort((a, b) => a.most_frequent - b.most_frequent);

  //       let expected: number = 0;
  //       for (let j = 0; j < items.length; j++) {
  //         expected += items[j].most_frequent * (+drops[j][1] / 100);
  //       }
  //       relic.worst = items[0].most_frequent;
  //       relic.worst_name = items[0].name;
  //       relic.worst_url = items[0].url;
  //       relic.best = items[items.length - 1].most_frequent;
  //       relic.best_name = items[items.length - 1].name;
  //       relic.best_url = items[items.length - 1].url;
  //       relic.expected = +expected.toFixed(0);

  //       relics.push(relic);
  //     }
  //   }

  //   const data = JSON.stringify(relics, null, 2);
  //   const blob = new Blob([data], { type: 'text/plain' });
  //   const url = window.URL.createObjectURL(blob);
  //   const a = document.createElement('a');
  //   a.href = url;
  //   a.download = 'relics.txt';
  //   document.body.appendChild(a);
  //   a.click();
  //   window.URL.revokeObjectURL(url);
  //   document.body.removeChild(a);

  // }

  // formatPriceJson() {
  //   this.tradeItem = [];
  //   for (const key of Object.keys(priceRaw)) {
  //     this.current += 1;
  //     const value = priceRaw[key];
  //     let item = value.filter(i => i.order_type == 'sell');

  //     if (item.length > 1) item = item.filter(i => i.mod_rank == 0);

  //     if (item.length == 1) {
  //       item = item[0];
  //       const info = this.tradeableList.find(i => i.id == item.item_id);
  //       this.tradeItem.push({
  //         id: item.item_id,
  //         url: info.url,
  //         name: info.item_en,
  //         lowest: +item.min_price,
  //         higher: +item.max_price,
  //         average: +item.avg_price.toFixed(0),
  //         most_frequent: +item.median
  //       });
  //     }
  //   }

  //   this.downloadText();
  // }

  // downloadText() {
  //   const list = this.tradeItem.filter(i => i.average > 0 && i.higher > 0 && i.lowest > 0);
  //   const data = JSON.stringify(list, null, 2);
  //   const blob = new Blob([data], { type: 'text/plain' });
  //   const url = window.URL.createObjectURL(blob);
  //   const a = document.createElement('a');
  //   a.href = url;
  //   a.download = 'trade_items.txt';
  //   document.body.appendChild(a);
  //   a.click();
  //   window.URL.revokeObjectURL(url);
  //   document.body.removeChild(a);
  // }
}
