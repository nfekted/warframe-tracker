import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ItemsComponent } from './items/items.component';
import { ItemType, Util } from '../../shared/utils/util';
import { ItemJsons } from '../../shared/models/item-jsons.model';
import { GAME_UPDATE } from '../../shared/metadata';
import { ItemOptions } from '../../shared/store/progress.model';
import { ProgressStore } from '../../shared/store/progress.store';
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
  store = inject(ProgressStore);

  items: readonly ItemType[] = Util.itemTypes;
  gameUpdate = GAME_UPDATE;
  mrOptions: number[] = this.buildMrOptions();
  acquisitionList: { type: string, description: string }[] = [...acquisitionJson].sort((a, b) => a.type.localeCompare(b.type));

  acquisitionFilter: { type: string, description: string } = null;
  nameFilter: string = '';
  mr: number = null;

  get options(): ItemOptions {
    return this.store.options();
  }

  //0 up to the highest MR required by any item
  buildMrOptions(): number[] {
    const jsons = new ItemJsons();
    const max = Math.max(...this.items.flatMap(type => jsons[type].map(item => item.mastery_requirement)));
    return Array.from({ length: max + 1 }, (_, mr) => mr);
  }

  showCategory(type: ItemType): boolean {
    const items = this.store.account()[type];
    if (this.acquisitionFilter != null) {
      return items.some(i => i.acquisition == this.acquisitionFilter.type);
    }
    if (this.options.hideMastered) {
      return items.some(i => !i.mastered);
    }

    return true;
  }

  setOption(option: Partial<ItemOptions>) {
    this.store.setOptions(option);
  }
}
