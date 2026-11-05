import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { Account } from '../../shared/models/account.model';
import { FormsModule } from '@angular/forms';

import { ItemsComponent } from './items/items.component';
import { ItemType, Util } from '../../shared/utils/util';
import { ItemJsons } from '../../shared/models/item-jsons.model';
import { GAME_UPDATE } from '../../shared/metadata';
import acquisitionJson from '../../shared/jsons/acquisition.json';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
    selector: 'app-items-panel',
    imports: [FormsModule, ItemsComponent, TranslocoModule],
    templateUrl: './items-panel.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './items-panel.component.scss'
})
export class ItemsPanelComponent {

  @Input() account: Account;
  @Output() update = new EventEmitter<void>();

  items: readonly ItemType[] = Util.itemTypes;
  gameUpdate = GAME_UPDATE;
  mrOptions: number[] = this.buildMrOptions();
  acquisitionList: { type: string, description: string }[] = acquisitionJson.sort((a, b) => a.type.localeCompare(b.type));

  acquisitionFilter: { type: string, description: string } = null;
  hideMastered: boolean = false;
  hideFounders: boolean = true;
  showOnlyMrAvailable: boolean = true;
  nameFilter: string = '';
  mr: number = null;

  constructor() { }

  ngOnInit(): void {
    const options = Util.loadOptions();
    if (options) {
      this.hideMastered = options?.hideMastered;
      this.showOnlyMrAvailable = options?.showOnlyMrAvailable;
      this.hideFounders = options?.hideFounders;
    }
  }

  calculate() {
    this.update.emit();
  }

  //0 up to the highest MR required by any item
  buildMrOptions(): number[] {
    const jsons = new ItemJsons();
    const max = Math.max(...this.items.flatMap(type => jsons[type].map(item => item.mastery_requirement)));
    return Array.from({ length: max + 1 }, (_, mr) => mr);
  }

  showCategory(type: ItemType): boolean {
    if (this.acquisitionFilter != null) {
      return this.account[type].some(i => i.acquisition == this.acquisitionFilter.type);
    }
    if (this.hideMastered) {
      return this.account[type].some(i => !i.mastered);
    }

    return true;
  }

  saveOptions() {
    Util.saveOptions({ showOnlyMrAvailable: this.showOnlyMrAvailable, hideMastered: this.hideMastered, hideFounders: this.hideFounders });
  }
}
