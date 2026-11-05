import { Component, ChangeDetectionStrategy, computed, inject, input } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { Item } from '../../../shared/models/item.model';
import { ItemType } from '../../../shared/utils/util';
import { ProgressStore } from '../../../shared/store/progress.store';
import { TrackerCardComponent } from '../../tracker-card/tracker-card.component';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
    selector: 'app-items',
    imports: [UpperCasePipe, TranslocoModule, TrackerCardComponent],
    templateUrl: './items.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './items.component.scss'
})
export class ItemsComponent {
  private store = inject(ProgressStore);

  type = input.required<ItemType>();
  //Every item of the category, for the counter
  items = input.required<Item[]>();
  //Items that pass the panel filters
  visible = input.required<Item[]>();

  mastered = computed(() => this.items().filter(i => i.mastered).length);

  rows = computed(() => this.visible().map(item => ({
    item,
    classes: {
      mastered: item.mastered,
      prime: item.name.includes('Prime'),
      kuva: item.name.includes('Kuva'),
      coda: item.name.includes('Coda'),
      tenet: item.name.includes('Tenet') || item.type == 'hounds',
    },
  })));

  toggle(item: Item) {
    this.store.toggleItem(this.type(), item.name);
  }
}
