import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';

import { StarChartComponent } from './items/star-chart.component';
import { GAME_UPDATE } from '../../shared/metadata';
import { StarChart } from '../../shared/models/star-chart.model';
import { ProgressStore } from '../../shared/store/progress.store';
import { TranslocoModule } from '@jsverse/transloco';

const incomplete = (node: StarChart) => !node.mastered || !node.steel_path;

@Component({
    selector: 'app-star-chart-panel',
    imports: [StarChartComponent, TranslocoModule],
    templateUrl: './star-chart-panel.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './star-chart-panel.component.scss'
})
export class StarChartPanelComponent {
  private store = inject(ProgressStore);

  gameUpdate = GAME_UPDATE;

  hideComplete = signal(false);

  //Nodes grouped by planet, in the JSON order
  private groups = computed(() => {
    const groups = new Map<string, StarChart[]>();
    for (const node of this.store.account().locations) {
      groups.set(node.planet, [...(groups.get(node.planet) ?? []), node]);
    }
    return groups;
  });

  planets = computed(() => {
    const hide = this.hideComplete();
    return [...this.groups()]
      .map(([planet, locations]) => ({ planet, locations, visible: hide ? locations.filter(incomplete) : locations }))
      .filter(group => !hide || group.visible.length > 0);
  });
}
