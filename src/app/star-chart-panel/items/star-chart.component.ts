import { Component, Input, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StarChart } from '../../../shared/models/star-chart.model';
import { ProgressStore } from '../../../shared/store/progress.store';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
    selector: 'app-star-chart',
    imports: [CommonModule, TranslocoModule],
    templateUrl: './star-chart.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './star-chart.component.scss'
})
export class StarChartComponent {
  store = inject(ProgressStore);

  @Input() image: string = '';

  @Input() locations: StarChart[] = [];

  //Filters
  @Input() hideComplete: boolean = false;

  show: boolean = true;

  get planetLocations(): StarChart[] {
    return this.locations.filter(i => i.planet == this.image);
  }

  get itemMastered(): number {
    return this.planetLocations.filter(i => i.mastered).length;
  }

  get itemSteel(): number {
    return this.planetLocations.filter(i => i.steel_path).length;
  }

  showItem(item: StarChart): boolean {
    return item.planet == this.image && (!this.hideComplete || (this.hideComplete && (!item.mastered || !item.steel_path)))
  }

  goToWiki(item: StarChart) {
    window.open(`https://wiki.warframe.com/w/${item.name}`, '_blank')
    window.focus();
  }
}
