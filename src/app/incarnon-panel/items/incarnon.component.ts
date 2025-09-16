import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Account } from '../../../shared/models/account.model';
import { TranslocoModule } from '@jsverse/transloco';
import { Incarnons } from '../../../shared/models/incarnons.model';
import incarnons from '../../../shared/jsons/incarnon.json';

@Component({
  selector: 'app-incarnon',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslocoModule],
  templateUrl: './incarnon.component.html',
  styleUrl: './incarnon.component.scss'
})
export class IncarnonComponent {

  @Input() account: Account;
  @Input() image: string = '';

  @Input() incarnons: Incarnons[] = [];

  @Output() update = new EventEmitter<void>();

  //Filters
  show: boolean = true;
  itemCount: number = 0;
  itemMastered: number = 0;

  constructor() { }

  calculate() {
    this.update.emit();
  }

  ngOnInit(): void {
    this.itemCount = this.incarnons.filter(i => i.acquisition == this.image).length;
    this.mastered();
  }

  mastered() {
    this.itemMastered = this.incarnons.filter(i => i.acquisition == this.image && i.acquired).length;
    this.incarnons = this.incarnons.filter(i => i.acquisition == this.image);
  }

  goToWiki(item: Incarnons) {
    const list = incarnons.filter(i => i.acquisition == this.image);
    window.open(list.find(i => i.name == item.name).acquisitionDescription, '_blank')
    window.focus();
  }
}
