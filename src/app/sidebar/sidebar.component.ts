import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { Account } from '../../shared/models/account.model';
import mrJson from '../../shared/jsons/mr.json';
import { FormsModule } from '@angular/forms';
import { MasteryRank } from '../../shared/models/mastery-rank.model';
import Swal from 'sweetalert2';
import { Util } from '../../shared/utils/util';
import { ApiService } from '../../services/api.service';
import { HttpClientModule } from '@angular/common/http';

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
    }).then((result) => {
      if (result.isConfirmed) {
        Util.clear();
      }
    });
  }

  teste() {
    this.service.teste().subscribe((res) => {
      console.log(res);
    });
  }

}
