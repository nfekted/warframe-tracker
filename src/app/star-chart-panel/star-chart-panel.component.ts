import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { Account } from '../../shared/models/account.model';
import { FormsModule } from '@angular/forms';

import { StarChartComponent } from './items/star-chart.component';
import starChart from '../../shared/jsons/locations.json';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
    selector: 'app-star-chart-panel',
    imports: [FormsModule, StarChartComponent, TranslocoModule],
    templateUrl: './star-chart-panel.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
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
