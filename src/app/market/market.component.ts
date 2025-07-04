import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Account } from '../../shared/models/account.model';
import { PythonToolComponent } from '../python-tool/python-tool.component';
import itemEnJson from '../../shared/jsons/tradeable/tradeEn.json';
import itemPtJson from '../../shared/jsons/tradeable/tradePt.json'
import Swal from 'sweetalert2';
import { firstValueFrom, timer } from 'rxjs';

@Component({
  selector: 'app-market',
  standalone: true,
  imports: [FormsModule, CommonModule, PythonToolComponent],
  templateUrl: './market.component.html',
  styleUrl: './market.component.scss'
})
export class MarketComponent {

  @Input() account: Account;
  @Input() itemsCount: number = 0;

  @Output() update = new EventEmitter<void>();

  tradeableList: { url: string, item_en: string, item_pt: string }[] = [];

  text: string;

  tradeItem: { url: string, name: string, lowest1: number, lowest2: number, lowest3: number, online1: number, online2: number, online3: number }[] = [];
  complete: boolean = false;
  current: number = 0;
  currentItem: string = '';

  lastSort: string = '';

  constructor(private service: ApiService) { }

  ngOnInit(): void {
    this.makeJson();
  }

  makeJson() {
    this.tradeableList = [];
    const itemEn = new Map<string, string>();
    const itemPt = new Map<string, string>();
    itemEnJson.payload.items.forEach((item) => itemEn.set(item.url_name, item.item_name.replace(':', '')));
    itemPtJson.payload.items.forEach((item) => itemPt.set(item.url_name, item.item_name.replace(':', '')));


    itemEn.forEach((item, url) => {
      const pt = itemPt.get(url);
      this.tradeableList.push({ url: url, item_en: item, item_pt: pt });
    });
  }

  scan() {
    this.startScan();
    // Swal.fire({
    //   title: 'Pay attention!',
    //   html: 'Due to security, requests to the Warframe Market API will be limited to 2 or 3 per second, without considering the API response time.<br/>'
    //     + 'For every 100 items, it will take at least 30 seconds, and may extend for more than 3 minutes...<br/>'
    //     + '<b>Misuse of the tool</b> can block your IP from the warframe market.',
    //   icon: `warning`,
    //   confirmButtonText: `Continue`,
    //   cancelButtonText: 'Cancel',
    //   showCancelButton: true
    // }).then((res) => {
    //   if (res.isConfirmed) {
    //     this.startScan();
    //   }
    // })
  }

  startScan() {
    this.complete = false;
    this.current = 1;
    Swal.fire({
      title: 'Loading',
      text: 'Load and reading the images may take some time, check the tool console for progress information.',
      showCancelButton: false,
      showConfirmButton: false,
      allowOutsideClick: false,
    });
    this.service.scanMarket().subscribe({
      next: (res) => {
        Swal.close();
        this.text = this.format(res);

        timer(10).subscribe(async () => {
          for (const item of this.tradeableList) {
            if (this.text.includes(this.format(item.item_en))) {
              this.tradeItem.push({ url: item.url, name: item.item_en, lowest1: 0, lowest2: 0, lowest3: 0, online1: 0, online2: 0, online3: 0 });
              this.text = this.text.replace(item.item_en.toUpperCase(), '');
            } else if (this.text.includes(this.format(item.item_pt))) {
              this.tradeItem.push({ url: item.url, name: item.item_pt, lowest1: 0, lowest2: 0, lowest3: 0, online1: 0, online2: 0, online3: 0 });
              this.text = this.text.replace(item.item_pt.toUpperCase(), '');
            }
          }

          // const aux = this.tradeItem[0];
          // this.tradeItem = [];
          // this.tradeItem.push(aux);
          for (let i = 0; i < this.tradeItem.length; i++) {
            this.currentItem = this.tradeItem[i].name;
            let response = await firstValueFrom(this.service.getMarketPrices(this.tradeItem[i].url));
            if (!response?.payload?.orders) { this.current += 1; continue; }

            const limit: Date = new Date();
            limit.setMonth(new Date().getMonth() - 3);

            response = response?.payload?.orders as Array<any>;
            response = response.filter(i => i.visible && i.order_type == "sell" && new Date(i.user.last_seen) >= limit);

            const onlines = response.filter(i => i.user.status == 'ingame');
            const offlines = response.filter(i => i.user.status == 'offline');

            onlines.sort((a, b) => { return +a.platinum - +b.platinum });
            offlines.sort((a, b) => { return +a.platinum - +b.platinum });

            this.tradeItem[i].lowest1 = offlines[0]?.platinum ? offlines[0].platinum : 0;
            this.tradeItem[i].lowest2 = offlines[1]?.platinum ? offlines[1].platinum : 0;
            this.tradeItem[i].lowest3 = offlines[2]?.platinum ? offlines[2].platinum : 0;

            this.tradeItem[i].online1 = onlines[0]?.platinum ? onlines[0].platinum : 0;
            this.tradeItem[i].online2 = onlines[1]?.platinum ? onlines[1].platinum : 0;
            this.tradeItem[i].online3 = onlines[2]?.platinum ? onlines[2].platinum : 0;

            this.current += 1;
          }

          this.complete = true;
        });
      },
      error: (e) => {
        if (e.status == 0) {
          Swal.fire('API not found', 'Api is not online, see the information on the page to configure it', 'error');
          return;
        }

        Swal.fire('Error', e.message, 'error');
      }
    });
  }

  private format(text: string): string {
    if (text == null) return '';

    text = text.split('\n').join('');
    text = text.split('|').join('');
    text = text.split(':').join('');
    text = text.split('”').join('').split('“').join('');
    text = text.split('‘').join('').split('’').join('');
    text = text.split(' ').join('');
    text = text.toUpperCase();

    return text;
  }

  sort(field: string) {
    this.tradeItem.sort((a, b) => {
      if (!isNaN(+a[field])) return (this.lastSort == field ? +b[field] - +a[field] : +a[field] - +b[field]);

      return (this.lastSort == field ? b[field].localeCompare(a[field]) : a[field].localeCompare(b[field]));
    });

    this.lastSort == field ? this.lastSort = '' : this.lastSort = field;
  }
}
