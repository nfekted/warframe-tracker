import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Account } from '../../shared/models/account.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ItemsComponent } from './items/items.component';
import { Util } from '../../shared/utils/util';
import acquisitionJson from '../../shared/jsons/acquisition.json';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-items-panel',
  standalone: true,
  imports: [FormsModule, CommonModule, ItemsComponent, TranslocoModule],
  templateUrl: './items-panel.component.html',
  styleUrl: './items-panel.component.scss'
})
export class ItemsPanelComponent {

  @Input() account: Account;
  @Output() update = new EventEmitter<void>();

  items: string[] = Util.itemTypes;
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

  showCategory(type: string): boolean {
    if (this.acquisitionFilter != null) {
      return this.account[type].filter(i => i.acquisition == this.acquisitionFilter.type).length;
    }
    if (this.hideMastered) {
      return this.account[type].filter(i => !i.mastered).length;
    }

    return true;
  }

  saveOptions() {
    Util.saveOptions({ showOnlyMrAvailable: this.showOnlyMrAvailable, hideMastered: this.hideMastered, hideFounders: this.hideFounders });
  }
}
