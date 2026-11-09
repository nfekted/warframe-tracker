import { Component, ChangeDetectionStrategy, input, signal } from '@angular/core';

//Card shared by the Items, Star Chart and Incarnon panels: header (opens/closes the list), counters, progress and the list
@Component({
    selector: 'app-tracker-card',
    templateUrl: './tracker-card.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './tracker-card.component.scss',
    host: { '[id]': '"card-" + id()' }
})
export class TrackerCardComponent {
  //Unique per page: the card is reachable as #card-{id} and its list as #list-{id}
  id = input.required<string>();
  title = input.required<string>();
  icon = input<string>();
  //One bar per value, from 0 to 1 (Star Chart shows normal and Steel Path)
  progress = input<number[]>([]);

  show = signal(true);
}
