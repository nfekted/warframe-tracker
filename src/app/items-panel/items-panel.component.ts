import { Component, ChangeDetectionStrategy, DOCUMENT, computed, inject, signal } from '@angular/core';

import { ItemsComponent } from './items/items.component';
import { filterCategories } from './items-filter';
import { Util } from '../../shared/utils/util';
import { ItemJsons } from '../../shared/models/item-jsons.model';
import { GAME_UPDATE } from '../../shared/metadata';
import { ItemOptions } from '../../shared/store/progress.model';
import { ProgressStore } from '../../shared/store/progress.store';
import acquisitionJson from '../../shared/jsons/acquisition.json';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
    selector: 'app-items-panel',
    imports: [ItemsComponent, TranslocoModule],
    templateUrl: './items-panel.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './items-panel.component.scss'
})
export class ItemsPanelComponent {
  private store = inject(ProgressStore);
  private document = inject(DOCUMENT);

  gameUpdate = GAME_UPDATE;
  mrOptions: number[] = this.buildMrOptions();
  acquisitionList: string[] = acquisitionJson.map(a => a.type).sort((a, b) => a.localeCompare(b));

  options = this.store.options;
  acquisition = signal<string | null>(null);
  nameFilter = signal('');
  mr = signal<number | null>(null);

  categories = computed(() => filterCategories(this.store.account(), {
    ...this.options(),
    acquisition: this.acquisition(),
    name: this.nameFilter(),
    mr: this.mr(),
    rank: this.store.masteryRank().rank,
  }));

  //How many items pass the filters, across all categories
  shown = computed(() => this.categories().reduce((sum, c) => sum + c.visible.length, 0));

  shortcuts = computed(() => this.categories().map(({ type, items }) =>
    ({ type, mastered: items.filter(i => i.mastered).length, total: items.length })));

  //Scrolls to the category card and focuses its header, so keyboard users land there too
  jumpTo(type: string) {
    const card = this.document.getElementById('card-' + type);
    const reduceMotion = this.document.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches;
    card?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    card?.querySelector('button')?.focus({ preventScroll: true });
  }

  //0 up to the highest MR required by any item
  buildMrOptions(): number[] {
    const jsons = new ItemJsons();
    const max = Math.max(...Util.itemTypes.flatMap(type => jsons[type].map(item => item.mastery_requirement)));
    return Array.from({ length: max + 1 }, (_, mr) => mr);
  }

  setOption(option: Partial<ItemOptions>) {
    this.store.setOptions(option);
  }

  //Shows everything, so an empty result always has a way out
  clearFilters() {
    this.acquisition.set(null);
    this.nameFilter.set('');
    this.mr.set(null);
    this.setOption({ hideMastered: false, showOnlyMrAvailable: false, hideFounders: false });
  }

  //Empty value means no filter
  setMr(value: string) {
    this.mr.set(value == '' ? null : Number(value));
  }
}
