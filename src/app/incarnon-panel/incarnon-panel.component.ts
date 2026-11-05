import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';

import { GAME_UPDATE } from '../../shared/metadata';
import { Incarnons } from '../../shared/models/incarnons.model';
import { ProgressStore } from '../../shared/store/progress.store';
import { TranslocoModule } from '@jsverse/transloco';
import { IncarnonComponent } from './items/incarnon.component';

@Component({
    selector: 'app-incarnon-panel',
    imports: [TranslocoModule, IncarnonComponent],
    templateUrl: './incarnon-panel.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './incarnon-panel.component.scss'
})
export class IncarnonPanelComponent {
  private store = inject(ProgressStore);

  gameUpdate = GAME_UPDATE;

  //Incarnons grouped by acquisition, in the JSON order
  groups = computed(() => {
    const groups = new Map<string, Incarnons[]>();
    for (const item of this.store.account().incarnons) {
      groups.set(item.acquisition, [...(groups.get(item.acquisition) ?? []), item]);
    }
    return groups;
  });

  incarnons: string[] = [...this.groups().keys()];
}
