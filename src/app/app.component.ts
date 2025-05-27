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
import kDriveJson from '../shared/jsons/kdrives.json';
import necramechJson from '../shared/jsons/necramech.json';
import houndsJson from '../shared/jsons/hounds.json';
import moasJson from '../shared/jsons/moas.json';
import sentinelsJson from '../shared/jsons/sentinels.json';
import companionWeaponJson from '../shared/jsons/companion-weapon.json';
import kubrowJson from '../shared/jsons/kubrows.json';
import kavatsJson from '../shared/jsons/kavats.json';
import predasiteJson from '../shared/jsons/predasites.json';
import vulpaphylasJson from '../shared/jsons/vulpaphylas.json';
import ampsJson from '../shared/jsons/amps.json';
import zawJson from '../shared/jsons/zaws.json';
import kitgunJson from '../shared/jsons/kitguns.json';
import archMeleeJson from '../shared/jsons/archwing-melee.json';
import archPrimaryJson from '../shared/jsons/archwing-primary.json';
import { ItemJsons } from '../shared/models/item-jsons.model';


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

  jsonList: ItemJsons = new ItemJsons();

  constructor() { }

  ngOnInit(): void {
    for (const item of Util.itemTypes) {
      this.initItems(item);
    }

    this.nextRank = this.mrList.find(mr => mr.xp > this.account.xp);
    this.account.masteryRank = this.mrList[0];

    this.sumItems();
  }

  sumItems() {
    this.itemsCount = 1
      + warframesJson.length
      + archwingJson.length
      + kDriveJson.length
      + necramechJson.length
      + houndsJson.length
      + moasJson.length
      + sentinelsJson.length
      + companionWeaponJson.length
      + kubrowJson.length
      + kavatsJson.length
      + predasiteJson.length
      + vulpaphylasJson.length
      + ampsJson.length
      + zawJson.length
      + kitgunJson.length
      + archMeleeJson.length
      + archPrimaryJson.length
      ;
  }

  initItems(type: string) {
    if (this.account[type].length != this.jsonList[type].length) {
      const newItem = this.jsonList[type].filter(item => {
        return !this.account[type].some(s => s.name == item.name);
      });

      for (const item of newItem) {
        this.account[type].push(new Item(item.name, type, item.acquisition));
      }
    }
  }

  calculate() {
    this.account = Util.calculate(this.account);
    this.nextRank = this.mrList.find(mr => mr.xp > this.account.xp);
    this.account.masteryRank = this.mrList[this.nextRank.rank - 1];
  }
}
