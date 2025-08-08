import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Account } from '../../shared/models/account.model';
import mrJson from '../../shared/jsons/mr.json';
import { FormsModule } from '@angular/forms';
import { MasteryRank } from '../../shared/models/mastery-rank.model';
import Swal from 'sweetalert2';
import { Util } from '../../shared/utils/util';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslocoModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {

  @Input() account: Account;
  @Input() nextRank: MasteryRank;
  @Input() itemsCount: number = 0;


  @Output() update = new EventEmitter<void>();
  @Output() changeRender = new EventEmitter<string>();

  mrList = mrJson;
  maxXp: number = 3087038;
  render: string = 'items';

  constructor(private service: ApiService) { }

  ngOnInit(): void { }

  calculate() {
    this.update.emit();
  }

  progress(): number {
    return (this.account.xp - this.account.masteryRank.xp) / (this.nextRank.xp - this.account.masteryRank.xp) * 100;
  }

  delete() {
    Swal.fire({
      text: 'Erase all data? Can\'t be undone',
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: '#a7160c'
    }).then((result) => {
      if (result.isConfirmed) {
        Util.clear();
      }
    });
  }

  changeRenderEvent(type: string) {
    this.render = type;
    this.changeRender.emit(type);
  }
}
