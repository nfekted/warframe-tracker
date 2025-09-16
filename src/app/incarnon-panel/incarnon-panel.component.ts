import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Account } from '../../shared/models/account.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import incarnons from '../../shared/jsons/incarnon.json';
import { TranslocoModule } from '@jsverse/transloco';
import { IncarnonComponent } from './items/incarnon.component';

@Component({
  selector: 'app-incarnon-panel',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslocoModule, IncarnonComponent],
  templateUrl: './incarnon-panel.component.html',
  styleUrl: './incarnon-panel.component.scss'
})
export class IncarnonPanelComponent {

  @Input() account: Account;
  @Output() update = new EventEmitter<void>();

  incarnons: string[] = [];

  constructor() { }

  ngOnInit(): void {
    this.incarnons = [...new Set(incarnons.map(loc => loc.acquisition))];
  }

  calculate() {
    this.update.emit();
  }
}
