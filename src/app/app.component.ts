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
    this.initMoas();
    this.initSentinels();
    this.initCompanionWeapons();
    this.initKubrows();
    this.initKavats();
    this.initPredasite();
    this.initVulpaphylas();
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
      + companionWeaponJson.length;
    ;
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

  initMoas() {
    if (this.account.moas.length != moasJson.length) {
      const newMoas = moasJson.filter(moa => {
        return !this.account.moas.some(m => m.name == moa.name);
      });

      for (const moa of newMoas) {
        this.account.moas.push(new Item(moa.name, 'Moa', moa.acquisition));
      }
    }
  }

  initSentinels() {
    if (this.account.sentinels.length != sentinelsJson.length) {
      const newSentinels = sentinelsJson.filter(sentinel => {
        return !this.account.sentinels.some(s => s.name == sentinel.name);
      });

      for (const sentinel of newSentinels) {
        this.account.sentinels.push(new Item(sentinel.name, 'Sentinel', sentinel.acquisition));
      }
    }
  }

  initCompanionWeapons() {
    if (this.account.companion_weapon.length != companionWeaponJson.length) {
      const newCompWeapons = companionWeaponJson.filter(weapon => {
        return !this.account.companion_weapon.some(cw => cw.name == weapon.name);
      });

      for (const cw of newCompWeapons) {
        this.account.companion_weapon.push(new Item(cw.name, 'Companion Weapon', cw.acquisition));
      }
    }
  }

  initKubrows() {
    if (this.account.kubrows.length != kubrowJson.length) {
      const newKubrows = kubrowJson.filter(kubrow => {
        return !this.account.kubrows.some(k => k.name == kubrow.name);
      });

      for (const kubrow of newKubrows) {
        this.account.kubrows.push(new Item(kubrow.name, 'Kubrow', kubrow.acquisition));
      }
    }
  }

  initPredasite() {
    if (this.account.predasites.length != predasiteJson.length) {
      const newPredasite = predasiteJson.filter(predasite => {
        return !this.account.predasites.some(p => p.name == predasite.name);
      });

      for (const predasite of newPredasite) {
        this.account.predasites.push(new Item(predasite.name, 'Predasite', predasite.acquisition));
      }
    }
  }

  initVulpaphylas() {
    if (this.account.vulpaphylas.length != vulpaphylasJson.length) {
      const newVulpaphylas = vulpaphylasJson.filter(vulpaphylas => {
        return !this.account.vulpaphylas.some(v => v.name == vulpaphylas.name);
      });

      for (const vulpaphylas of newVulpaphylas) {
        this.account.vulpaphylas.push(new Item(vulpaphylas.name, 'Vulpaphylas', vulpaphylas.acquisition));
      }
    }
  }

  initKavats() {
    if (this.account.kavats.length != kavatsJson.length) {
      const newKavats = kavatsJson.filter(kavat => {
        return !this.account.kavats.some(k => k.name == kavat.name);
      });

      for (const kavat of newKavats) {
        this.account.kavats.push(new Item(kavat.name, 'Kavat', kavat.acquisition));
      }
    }
  }

  calculate() {
    this.account = Util.calculate(this.account);
    this.nextRank = this.mrList.find(mr => mr.xp > this.account.xp);
    this.account.masteryRank = this.mrList[this.nextRank.rank - 1];
  }
}
