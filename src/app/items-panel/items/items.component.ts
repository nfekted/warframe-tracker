import { Component, Input, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Item } from '../../../shared/models/item.model';
import { ItemJsons } from '../../../shared/models/item-jsons.model';
import { ItemType } from '../../../shared/utils/util';
import { ProgressStore } from '../../../shared/store/progress.store';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
    selector: 'app-items',
    imports: [CommonModule, TranslocoModule],
    templateUrl: './items.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './items.component.scss'
})
export class ItemsComponent {
  private store = inject(ProgressStore);

  jsons: ItemJsons = new ItemJsons();

  @Input() image: ItemType;
  @Input() items: Item[] = [];

  //Filters
  @Input() acquisitionFilter: string = null;
  @Input() hideMastered: boolean = false;
  @Input() hideFounders: boolean = true;
  @Input() showOnlyMrAvailable: boolean;
  @Input() nameFilter: string = '';
  @Input() mr: number = null;

  show: boolean = true;

  get itemMastered(): number {
    return this.items.filter(i => i.mastered).length;
  }

  toggle(item: Item) {
    this.store.toggleItem(this.image, item.name);
  }

  showItem(item: Item): boolean {
    return (this.acquisitionFilter == null || this.acquisitionFilter == item.acquisition)
      && (!this.hideMastered || (this.hideMastered && !item.mastered))
      && (!this.showOnlyMrAvailable || (this.showOnlyMrAvailable && this.store.masteryRank().rank >= item.mastery_requirement))
      && (this.nameFilter == '' || item.name.toUpperCase().includes(this.nameFilter.toUpperCase()))
      && (this.mr == null || (this.mr == item.mastery_requirement))
      && (!this.hideFounders || (this.hideFounders && item.acquisition != 'Founder Exclusive'))
  }

  getStyles(item: Item): string {
    let style = '';

    if (item.mastered) style += 'mastered ';
    if (item.name.includes('Prime')) style += 'prime ';
    if (item.name.includes('Kuva')) style += 'kuva ';
    if (item.name.includes('Coda')) style += 'coda ';
    if (item.name.includes('Tenet')) style += 'tenet'
    if (item.type == 'hounds') style += 'tenet'
    return style;
  }

  goToWiki(item: Item) {
    const list = this.jsons[this.image];
    window.open(list.find(i => i.name == item.name).acquisitionDescription, '_blank')
    window.focus();
  }
}
