import { Component, ChangeDetectionStrategy, input, signal } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

//Card shared by the Items, Star Chart and Incarnon panels: header, counters, show/hide toggle and the list
@Component({
    selector: 'app-tracker-card',
    imports: [TranslocoModule],
    templateUrl: './tracker-card.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './tracker-card.component.scss'
})
export class TrackerCardComponent {
  //Unique per page, used by the show/hide radios
  id = input.required<string>();
  title = input.required<string>();
  icon = input<string>();

  show = signal(true);
}
