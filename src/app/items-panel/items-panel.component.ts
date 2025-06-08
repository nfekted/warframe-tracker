import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Account } from '../../shared/models/account.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ItemsComponent } from './items/items.component';
import { Util } from '../../shared/utils/util';
import acquisitionJson from '../../shared/jsons/acquisition.json';
import { filter } from 'rxjs';

@Component({
  selector: 'app-items-panel',
  standalone: true,
  imports: [FormsModule, CommonModule, ItemsComponent],
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
  showOnlyMrAvailable: boolean = true;
  nameFilter: string = '';

  constructor() { }

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
}
