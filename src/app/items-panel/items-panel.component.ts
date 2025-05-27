import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Account } from '../../shared/models/account.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ItemsComponent } from './items/items.component';
import { Util } from '../../shared/utils/util';

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

  constructor() { }

  calculate() {
    this.update.emit();
  }
}
