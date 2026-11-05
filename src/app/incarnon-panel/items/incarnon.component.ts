import { Component, Input, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { Incarnons } from '../../../shared/models/incarnons.model';
import { ProgressStore } from '../../../shared/store/progress.store';
import incarnons from '../../../shared/jsons/incarnon.json';

@Component({
    selector: 'app-incarnon',
    imports: [CommonModule, TranslocoModule],
    templateUrl: './incarnon.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './incarnon.component.scss'
})
export class IncarnonComponent {
  store = inject(ProgressStore);

  @Input() image: string = '';

  //Incarnons of this group only
  @Input() incarnons: Incarnons[] = [];

  show: boolean = true;

  get itemMastered(): number {
    return this.incarnons.filter(i => i.acquired).length;
  }

  goToWiki(item: Incarnons) {
    window.open(incarnons.find(i => i.name == item.name).acquisitionDescription, '_blank')
    window.focus();
  }
}
