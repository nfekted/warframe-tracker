import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApiService } from '../../services/api.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Account } from '../../shared/models/account.model';
import { timer } from 'rxjs';
import { Util } from '../../shared/utils/util';

@Component({
  selector: 'app-mr-scan',
  standalone: true,
  imports: [RouterOutlet, FormsModule, CommonModule],
  templateUrl: './mr-scan.component.html',
  styleUrl: './mr-scan.component.scss'
})
export class MrScanComponent {

  @Input() account: Account;
  @Input() itemsCount: number = 0;

  @Output() update = new EventEmitter<void>();

  constructor(private service: ApiService) { }

  text: string = null;
  current: number = 0;

  startScan() {
    this.current == 0;
    Swal.fire({
      title: 'Loading',
      text: 'Load and reading the images may take some time, check the tool console for progress information.',
      showCancelButton: false,
      showConfirmButton: false,
      allowOutsideClick: false,
    }
    );
    this.service.getMasteryRank().subscribe({
      next: (res) => {
        Swal.close();
        this.text = res.split('\n').join(' ');
        timer(1).subscribe(() => {
          for (const type of Util.itemTypes) {
            this.account[type].sort((a, b) => b.name.length - a.name.length)

            for (let i = 0; i < this.account[type].length; i++) {
              this.current++;
              const item = this.account[type][i].name.toUpperCase();
              if (this.text.includes(item)) {
                this.text = this.text.replace(item, '');
                this.account[type][i].mastered = true;
              }
            }
          }

          this.update.emit();
        });
      },
      error: (e) => {
        Swal.fire('Error', e.message, 'error');
      }
    });
  }

}
