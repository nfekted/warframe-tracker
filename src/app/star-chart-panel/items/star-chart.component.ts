import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Item } from '../../../shared/models/item.model';
import { Account } from '../../../shared/models/account.model';
import { ItemJsons } from '../../../shared/models/item-jsons.model';
import { StarChart } from '../../../shared/models/star-chart.model';

@Component({
  selector: 'app-star-chart',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './star-chart.component.html',
  styleUrl: './star-chart.component.scss'
})
export class StarChartComponent {

  jsons: ItemJsons = new ItemJsons();

  @Input() account: Account;
  @Input() image: string = '';

  @Input() locations: StarChart[] = [];

  //Filters
  @Input() hideComplete: boolean = false;

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
    this.itemCount = this.locations.filter(i => i.planet == this.image).length;
    this.mastered();
  }

  mastered() {
    this.itemMastered = this.locations.filter(i => i.planet == this.image && i.mastered).length;
  }

  showItem(item: StarChart): boolean {
    return item.planet == this.image && (!this.hideComplete || (this.hideComplete && !item.mastered))
  }

  goToWiki(item: StarChart) {
    window.open(`https://wiki.warframe.com/w/${item.name}`, '_blank')
    window.focus();
  }
}
