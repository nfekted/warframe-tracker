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
    this.initKDrive();
    this.initNecramech();
    this.initHounds();
    this.nextRank = this.mrList.find(mr => mr.xp > this.account.xp);
    this.account.masteryRank = this.mrList[0];
    this.itemsCount = 1 + warframesJson.length + archwingJson.length + kDriveJson.length
      + necramechJson.length + houndsJson.length;
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

  initKDrive() {
    if (this.account.kdrives.length != kDriveJson.length) {
      const newKD = kDriveJson.filter(kdrive => {
        return !this.account.kdrives.some(kd => kd.name == kdrive.name);
      });

      for (const kd of newKD) {
        this.account.kdrives.push(new Item(kd.name, 'kdrives', kd.acquisition));
      }
    }
  }

  initNecramech() {
    if (this.account.necramechs.length != necramechJson.length) {
      const newNecra = necramechJson.filter(necra => {
        return !this.account.necramechs.some(n => n.name == necra.name);
      });

      for (const necra of newNecra) {
        this.account.necramechs.push(new Item(necra.name, 'Necramech', necra.acquisition));
      }
    }
  }

  initHounds() {
    if (this.account.hounds.length != houndsJson.length) {
      const newHounds = houndsJson.filter(hound => {
        return !this.account.hounds.some(h => h.name == hound.name);
      });

      for (const hound of newHounds) {
        this.account.hounds.push(new Item(hound.name, 'Hound', hound.acquisition));
      }
    }
  }

  calculate() {
    this.account = Util.calculate(this.account);
    this.nextRank = this.mrList.find(mr => mr.xp > this.account.xp);
    this.account.masteryRank = this.mrList[this.nextRank.rank - 1];
  }
}
