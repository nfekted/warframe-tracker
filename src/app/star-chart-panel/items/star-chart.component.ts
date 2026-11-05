import { Component, ChangeDetectionStrategy, computed, inject, input } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { StarChart } from '../../../shared/models/star-chart.model';
import { ProgressStore } from '../../../shared/store/progress.store';
import { TrackerCardComponent } from '../../tracker-card/tracker-card.component';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
    selector: 'app-star-chart',
    imports: [UpperCasePipe, TranslocoModule, TrackerCardComponent],
    templateUrl: './star-chart.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './star-chart.component.scss'
})
export class StarChartComponent {
  store = inject(ProgressStore);

  planet = input.required<string>();
  //Every node of the planet, for the counters
  locations = input.required<StarChart[]>();
  //Nodes that pass the panel filter
  visible = input.required<StarChart[]>();

  mastered = computed(() => this.locations().filter(i => i.mastered).length);
  steelPath = computed(() => this.locations().filter(i => i.steel_path).length);
}
