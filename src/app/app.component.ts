import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Account } from '../shared/models/account.model';
import { ItemsPanelComponent } from './items-panel/items-panel.component';
import { Item } from '../shared/models/item.model';
import { Util } from '../shared/utils/util';
import { MasteryRank } from '../shared/models/mastery-rank.model';
import mrJson from '../shared/jsons/mr.json';
import starChart from '../shared/jsons/locations.json';
import { ItemJsons } from '../shared/models/item-jsons.model';
import { HttpClientModule } from '@angular/common/http';
import { MarketComponent } from './market/market.component';
import { StarChart } from '../shared/models/star-chart.model';
import { StarChartPanelComponent } from './star-chart-panel/star-chart-panel.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HttpClientModule, RouterModule,
    SidebarComponent, ItemsPanelComponent, MarketComponent, StarChartPanelComponent,
    FormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  account: Account = new Account();

  mrList: MasteryRank[] = mrJson;
  nextRank: MasteryRank = new MasteryRank();

  itemsCount: number = 0;
  maxXp: number = 0;

  jsonList: ItemJsons = new ItemJsons();

  render: string = 'items';
  constructor() { }

  ngOnInit(): void {
    const load = Util.load();
    if (load) {
      this.account = load;
      this.account = Util.calculate(this.account);
    }

    for (const item of Util.itemTypes) {
      this.initItems(item);
    }

    this.initStarChart();

    this.nextRank = this.mrList.find(mr => mr.xp > this.account.xp);
    this.account.masteryRank = this.mrList[this.nextRank.rank - 1];
  }

  initStarChart() {
    this.account.locations[0]
    if (this.account.locations.length != starChart.length) {
      const newStar = starChart.filter(item => {
        return !this.account.locations.some(s => s.name == item.name)
      });

      for (const item of newStar) {
        this.account.locations.push(new StarChart(item.name, item.mastery_exp, item.planet));
      }
    }
  }

  initItems(type: string) {
    if (this.account[type].length != this.jsonList[type].length) {
      const newItem = this.jsonList[type].filter(item => {
        return !this.account[type].some(s => s.name == item.name);
      });

      for (const item of newItem) {
        this.account[type].push(new Item(item.name, type, item.acquisition, item.mastery_requirement));
      }
    }

    this.itemsCount += this.account[type].length;
  }

  calculate() {
    this.account = Util.calculate(this.account);
    this.nextRank = this.mrList.find(mr => mr.xp > this.account.xp);
    this.account.masteryRank = this.mrList[this.nextRank.rank - 1];
    Util.save(this.account);
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
