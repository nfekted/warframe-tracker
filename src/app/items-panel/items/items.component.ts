import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Item } from '../../../shared/models/item.model';
import { Account } from '../../../shared/models/account.model';
import { ItemJsons } from '../../../shared/models/item-jsons.model';

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './items.component.html',
  styleUrl: './items.component.scss'
})
export class ItemsComponent {

  jsons: ItemJsons = new ItemJsons();

  @Input() account: Account;
  @Input() image: string = '';
  @Input() items: Item[] = [];

  //Filters
  @Input() acquisitionFilter: string = null;
  @Input() hideMastered: boolean = false;
  @Input() showOnlyMrAvailable: boolean;

  @Output() update = new EventEmitter<void>();

  //Filters
  show: boolean = true;
  itemCount: number = 0;
  itemMastered: number = 0;

  constructor() { }

  calculate() {
    this.update.emit();
  }

  ngOnInit(): void {
    this.itemCount = this.items.length;
    this.mastered();
  }

  mastered() {
    this.itemMastered = this.items.filter(i => i.mastered).length;
  }

  showItem(item: Item): boolean {
    return (this.acquisitionFilter == null || this.acquisitionFilter == item.acquisition)
      && (!this.hideMastered || (this.hideMastered && !item.mastered))
      && (!this.showOnlyMrAvailable || (this.showOnlyMrAvailable && this.account.masteryRank.rank >= item.mastery_requirement))
  }

  getStyles(item: Item): string {
    let style = '';

    if (item.mastered) style += 'mastered ';
    if (item.name.includes('Prime')) style += 'prime ';
    if (item.name.includes('Kuva')) style += 'kuva ';
    if (item.name.includes('Coda')) style += 'coda ';
    if (item.name.includes('Tenet')) style += 'tenet'
    if (item.type == 'hounds') style += 'tenet'
    //   [ngClass]="{'prime': item.name.includes('Prime'), 'mastered': item.mastered, 'kuva': item.name.includes('Kuva')}"
    return style;
  }

  goToWiki(item: Item) {
    const list = this.jsons[this.image];
    window.open(list.find(i => i.name == item.name).acquisitionDescription, '_blank')
    window.focus();
  }
}
