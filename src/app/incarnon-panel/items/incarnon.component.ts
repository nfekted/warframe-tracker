import { Component, ChangeDetectionStrategy, computed, inject, input } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { Incarnons } from '../../../shared/models/incarnons.model';
import { ProgressStore } from '../../../shared/store/progress.store';
import { TrackerCardComponent } from '../../tracker-card/tracker-card.component';

@Component({
    selector: 'app-incarnon',
    imports: [UpperCasePipe, TranslocoModule, TrackerCardComponent],
    templateUrl: './incarnon.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './incarnon.component.scss'
})
export class IncarnonComponent {
  store = inject(ProgressStore);

  group = input.required<string>();

  //Incarnons of this group only
  incarnons = input.required<Incarnons[]>();

  acquired = computed(() => this.incarnons().filter(i => i.acquired).length);
}
