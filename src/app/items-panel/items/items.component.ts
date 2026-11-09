import { Component, ChangeDetectionStrategy, computed, inject, input } from '@angular/core';
import { Item } from '../../../shared/models/item.model';
import { ItemType } from '../../../shared/utils/util';
import { ProgressStore } from '../../../shared/store/progress.store';
import { TrackerCardComponent } from '../../tracker-card/tracker-card.component';
import { TranslocoModule } from '@jsverse/transloco';

function rarity(item: Item): string | null {
  if (item.name.includes('Prime')) return 'prime';
  if (item.name.includes('Kuva')) return 'kuva';
  if (item.name.includes('Coda')) return 'coda';
  if (item.name.includes('Tenet') || item.type == 'hounds') return 'tenet';
  return null;
}

@Component({
    selector: 'app-items',
    imports: [TranslocoModule, TrackerCardComponent],
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

  //Rarity colors the row accent and name; Hounds count as Tenet
  rows = computed(() => this.visible().map(item => ({ item, rarity: rarity(item) })));

  toggle(item: Item) {
    this.store.toggleItem(this.type(), item.name);
  }
}
