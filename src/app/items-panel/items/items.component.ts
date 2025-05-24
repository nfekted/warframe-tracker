import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Item } from '../../../shared/models/item.model';

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './items.component.html',
  styleUrl: './items.component.scss'
})
export class ItemsComponent {

  @Input() image: string = '';
  @Input() items: Item[] = [];

  @Output() update = new EventEmitter<void>();

  show: boolean = true;

  constructor() { }

  calculate() {
    this.update.emit();
  }
}
