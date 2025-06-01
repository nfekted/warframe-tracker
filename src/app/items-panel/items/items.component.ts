import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
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
  @Input() acquisitionFilter: string = null;

  @Output() update = new EventEmitter<void>();

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
}
