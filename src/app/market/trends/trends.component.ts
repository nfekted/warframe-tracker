import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslocoModule } from '@jsverse/transloco';
import tradeables from '../../../shared/jsons/tradeable/tradeables.json';
import { ariaSort, nextSort, SortState, sortRows } from '../../../shared/utils/table-sort';
import { ThousandsPipe } from '../../../shared/utils/thousands.pipe';
import { ProgressStore } from '../../../shared/store/progress.store';
import { HistoryService, variantLabel } from '../history/history.service';

type Change = { percent: number, platinum: number } | null;
type Status = 'rising' | 'falling' | 'broke';
//Written by scripts/history-summary.mjs; only the fields used here
type SummaryEntry = {
  id: string, variant: string, relic: boolean, basis: 'closed' | 'sell', status: Status | 'stable' | null,
  price: number, change30: Change, stableValue: number | null, closedVolume7: number | null, sellVolume7: number | null,
};
type Summary = { date: string, items: SummaryEntry[] };

type TrendRow = {
  id: string, variant: string, url: string, name: string,
  //30 days ago, or the usual value for the items that broke their pattern
  before: number, price: number, change: number, size: number, volume: number, basis: 'closed' | 'sell',
};

const TRADEABLES = new Map(tradeables.map(t => [t.id, t]));

//Rising, falling and pattern-breaking series from the history summary, loaded once the tab is first shown
@Component({
    selector: 'app-trends',
    imports: [TranslocoModule, ThousandsPipe],
    templateUrl: './trends.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './trends.component.scss'
})
export class TrendsComponent {
  private history = inject(HistoryService);
  lang = inject(ProgressStore).lang;

  lists: Status[] = ['rising', 'falling', 'broke'];
  //undefined while loading, null when it could not be loaded
  summary = signal<Summary | null | undefined>(undefined);
  relics = signal(false);
  list = signal<Status>('rising');
  private sortState = signal<SortState<TrendRow>>(null);

  columns = computed<{ field: keyof TrendRow, label: string }[]>(() => [
    { field: 'name', label: 'market.item' },
    { field: 'before', label: this.list() == 'broke' ? 'market.trends.usual' : 'market.trends.before' },
    { field: 'price', label: 'market.trends.now' },
    { field: 'change', label: 'market.trends.change' },
    { field: 'volume', label: this.relics() ? 'market.trends.orders' : 'market.trends.trades' },
  ]);

  rows = computed(() => {
    const list = this.list();
    const relics = this.relics();
    const pt = this.lang() == 'pt';
    const rows: TrendRow[] = [];
    for (const e of this.summary()?.items ?? []) {
      const item = TRADEABLES.get(e.id);
      if (e.status != list || e.relic != relics || !item) continue;
      const before = list == 'broke' ? e.stableValue! : +(e.price - e.change30!.platinum).toFixed(1);
      const change = list == 'broke' ? (e.price - before) / before * 100 : e.change30!.percent;
      const name = pt ? item.name_pt : item.name_en;
      rows.push({
        id: e.id, variant: e.variant, url: item.url, basis: e.basis,
        name: e.variant ? `${name} (${variantLabel(e.variant)})` : name,
        before, price: e.price, change: +change.toFixed(1), size: Math.abs(change),
        volume: Math.round((e.basis == 'closed' ? e.closedVolume7 : e.sellVolume7) ?? 0),
      });
    }
    //Biggest moves first until a column is sorted
    return sortRows(rows, this.sortState() ?? { field: 'size', desc: true });
  });

  constructor() {
    inject(HttpClient).get<Summary>('assets/history/summary.json').subscribe({
      next: summary => this.summary.set(summary),
      error: () => this.summary.set(null),
    });
  }

  showRelics(relics: boolean) {
    this.relics.set(relics);
    this.sortState.set(null);
  }

  showList(list: Status) {
    this.list.set(list);
    this.sortState.set(null);
  }

  ariaSort(field: keyof TrendRow) {
    return ariaSort(this.sortState(), field);
  }

  sort(field: keyof TrendRow) {
    this.sortState.set(nextSort(this.sortState(), field));
  }

  formatChange(change: number) {
    return new Intl.NumberFormat(this.lang() == 'pt' ? 'pt-BR' : 'en-US', { maximumFractionDigits: 1, signDisplay: 'exceptZero' }).format(change) + '%';
  }

  formatDate(day: string) {
    return new Intl.DateTimeFormat(this.lang() == 'pt' ? 'pt-BR' : 'en-US', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(day));
  }

  openHistory(row: TrendRow) {
    this.history.open({ id: row.id, name: row.name, variant: row.variant });
  }
}
