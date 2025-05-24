import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Account } from '../shared/models/account.model';
import { ItemsPanelComponent } from './items-panel/items-panel.component';
import { Item } from '../shared/models/item.model';
import { Util } from '../shared/utils/util';
import { MasteryRank } from '../shared/models/mastery-rank.model';

import mrJson from '../shared/jsons/mr.json';
import warframesJson from '../shared/jsons/warframes.json';
import archwingJson from '../shared/jsons/archwings.json';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,
    SidebarComponent, ItemsPanelComponent,
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

  constructor() { }

  ngOnInit(): void {
    this.account.plexus = [new Item('Plexus', 'Plexus', 'Quest')];
    this.initWarframes();
    this.initArchwings();
    this.nextRank = this.mrList.find(mr => mr.xp > this.account.xp);
    this.account.masteryRank = this.mrList[0];
    this.itemsCount = warframesJson.length + archwingJson.length;
  }

  initWarframes() {
    if (this.account.warframes.length != warframesJson.length) {
      const newWar = warframesJson.filter(warframe => {
        return !this.account.warframes.some(war => war.name == warframe.name);
      });

      for (const warframe of newWar) {
        this.account.warframes.push(new Item(warframe.name, 'Warframe', warframe.acquisition));
      }
    }
  }

  initArchwings() {
    if (this.account.archwings.length != archwingJson.length) {
      const newArch = archwingJson.filter(archwing => {
        return !this.account.archwings.some(arch => arch.name == archwing.name);
      });

      for (const archwing of newArch) {
        this.account.archwings.push(new Item(archwing.name, 'Archwing', archwing.acquisition));
      }
    }
  }

  calculate() {
    this.account = Util.calculate(this.account);
    this.nextRank = this.mrList.find(mr => mr.xp > this.account.xp);
    this.account.masteryRank = this.mrList[this.nextRank.rank - 1];
  }
}
