import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { Account } from '../../shared/models/account.model';
import mrJson from '../../shared/jsons/mr.json';
import { FormsModule } from '@angular/forms';
import { MasteryRank } from '../../shared/models/mastery-rank.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {

  @Input() account: Account;
  @Input() nextRank: MasteryRank;
  @Input() itemsCount: number = 0;


  @Output() update = new EventEmitter<void>();

  mrList = mrJson;
  maxXp: number = 3072038;

  constructor() { }

  ngOnInit(): void { }

  calculate() {
    this.update.emit();
  }

  progress(): number {
    return (this.account.xp - this.account.masteryRank.xp) / (this.nextRank.xp - this.account.masteryRank.xp) * 100;
  }

}
