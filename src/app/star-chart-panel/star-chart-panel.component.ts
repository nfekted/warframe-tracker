import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Account } from '../../shared/models/account.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StarChartComponent } from './items/star-chart.component';
import starChart from '../../shared/jsons/locations.json';

@Component({
  selector: 'app-star-chart-panel',
  standalone: true,
  imports: [FormsModule, CommonModule, StarChartComponent],
  templateUrl: './star-chart-panel.component.html',
  styleUrl: './star-chart-panel.component.scss'
})
export class StarChartPanelComponent {

  @Input() account: Account;
  @Output() update = new EventEmitter<void>();

  locations: string[] = [];

  hideComplete: boolean = false;

  constructor() { }

  ngOnInit(): void {
    this.locations = [...new Set(starChart.map(loc => loc.planet))];
  }

  calculate() {
    this.update.emit();
  }

  showCategory(item: string): boolean {
    if (this.hideComplete) {
      return this.account.locations.filter(i => i.planet == item && (!i.mastered || !i.steel_path)).length > 0;
    }

    return true;
  }
}
