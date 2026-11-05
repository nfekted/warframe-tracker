import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { StarChartComponent } from './items/star-chart.component';
import starChart from '../../shared/jsons/locations.json';
import { GAME_UPDATE } from '../../shared/metadata';
import { ProgressStore } from '../../shared/store/progress.store';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
    selector: 'app-star-chart-panel',
    imports: [FormsModule, StarChartComponent, TranslocoModule],
    templateUrl: './star-chart-panel.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './star-chart-panel.component.scss'
})
export class StarChartPanelComponent {
  store = inject(ProgressStore);

  locations: string[] = [...new Set(starChart.map(loc => loc.planet))];
  gameUpdate = GAME_UPDATE;

  hideComplete: boolean = false;

  showCategory(item: string): boolean {
    if (this.hideComplete) {
      return this.store.account().locations.some(i => i.planet == item && (!i.mastered || !i.steel_path));
    }

    return true;
  }
}
