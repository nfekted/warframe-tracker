import { Component, ChangeDetectionStrategy, ElementRef, afterRenderEffect, computed, effect, inject, signal, viewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslocoModule } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';
import type { IChartApi } from 'lightweight-charts';
import tradeables from '../../../shared/jsons/tradeable/tradeables.json';
import { HistoryService, variantLabel } from './history.service';
import { ProgressStore } from '../../../shared/store/progress.store';

type Values = (number | null)[];
type Series = { sell?: Values, sellVolume?: Values, closed?: Values, closedVolume?: Values };
type History = { start: string, series: Record<string, Series> };
//Written by scripts/history-summary.mjs: the median share of the launch price on each day after release
type LaunchGroup = 'sets' | 'parts';
type LaunchCurves = Record<LaunchGroup, { items: number, curve: number[] }>;
//The change of each series over the chosen period only shows for the last day, not while the cursor is over another
type Legend = {
  date: string, closed?: number, sell?: number, trades?: number, orders?: number, typical?: number,
  closedChange?: number, sellChange?: number, expected?: number,
};

//Days shown by each period button; 0 shows the whole history
const PERIODS = [7, 30, 90, 365, 0];
//Opened first when the item has them: no variant, then rank 0 and intact relics
const DEFAULT_VARIANTS = ['', 'r0', 'intact'];
const DAY = 86400000;
//Prime items first seen this long after the history starts were released inside it, so they get the launch curve
const HISTORY_START = '2021-09-12';
const LAUNCH_MARGIN_DAYS = 30;
//The legend tells the typical price this many days after the last one
const EXPECTED_DAYS = 90;
const NAMES = new Map(tradeables.map(t => [t.id, t.name_en]));

//Same groups and launch price rules as scripts/history-summary.mjs
const launchGroup = (name: string): LaunchGroup | null => / Prime Set$/.test(name) ? 'sets' : / Prime /.test(name) ? 'parts' : null;
function launchPrice(series: Series) {
  const closed = !!series.closedVolume && series.closedVolume.slice(0, 30).filter(v => v != null && v >= 3).length >= 15;
  const prices = closed ? series.closed : series.sell;
  const volumes = (closed ? series.closedVolume : series.sellVolume) ?? [];
  const values = (prices ?? []).slice(0, 7).filter((v, i): v is number => v != null && (volumes[i] ?? 0) >= (closed ? 3 : 5)).sort((a, b) => a - b);
  if (values.length < 3) return null;
  const middle = values.length >> 1;
  return values.length % 2 ? values[middle] : (values[middle - 1] + values[middle]) / 2;
}

//Price history of one item in a native modal <dialog>; the chart library is only loaded when it opens
@Component({
    selector: 'app-history-dialog',
    imports: [TranslocoModule],
    templateUrl: './history-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './history-dialog.component.scss'
})
export class HistoryDialogComponent {
  service = inject(HistoryService);
  private http = inject(HttpClient);
  private store = inject(ProgressStore);

  periods = PERIODS;
  //undefined while loading, null when the item has no history
  history = signal<History | null | undefined>(undefined);
  variant = signal('');
  period = signal(90);
  legend = signal<Legend | null>(null);
  //How many items the launch curve on the chart comes from, when it is drawn
  //ended: the item is older than the curve, which then only shows on the whole history
  launch = signal<{ group: LaunchGroup, items: number, ended: boolean } | null>(null);
  private curves?: Promise<LaunchCurves | null>;

  variants = computed(() => Object.keys(this.history()?.series ?? {}).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true })));

  private locale = computed(() => this.store.lang() == 'pt' ? 'pt-BR' : 'en-US');
  private number = computed(() => new Intl.NumberFormat(this.locale(), { maximumFractionDigits: 2 }));
  private date = computed(() => new Intl.DateTimeFormat(this.locale(), { dateStyle: 'medium', timeZone: 'UTC' }));
  private percent = computed(() => new Intl.NumberFormat(this.locale(), { style: 'percent', maximumFractionDigits: 1, signDisplay: 'exceptZero' }));

  private dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private container = viewChild<ElementRef<HTMLElement>>('chart');
  private chart?: IChartApi;
  private builds = 0;

  constructor() {
    effect(() => {
      const item = this.service.current();
      this.history.set(undefined);
      this.legend.set(null);
      if (!item) return;
      this.http.get<History>(`assets/history/${item.id.at(-1)}/${item.id}.json`).subscribe({
        next: history => {
          const variants = Object.keys(history.series);
          this.variant.set([item.variant, ...DEFAULT_VARIANTS].find(v => v != null && variants.includes(v)) ?? variants[0]);
          this.history.set(history);
        },
        error: () => this.history.set(null),
      });
    });

    afterRenderEffect(() => {
      const open = !!this.service.current();
      const dialog = this.dialog().nativeElement;
      if (open && !dialog.open) dialog.showModal();
      else if (!open && dialog.open) dialog.close();
    });

    //Rebuilt whenever the item, the series or the period changes
    afterRenderEffect(() => this.build(this.service.current()?.id, this.history(), this.variant(), this.period(), this.container()?.nativeElement));
  }

  private async build(id: string | undefined, history: History | null | undefined, variant: string, period: number, container?: HTMLElement) {
    const build = ++this.builds;
    this.chart?.remove();
    this.chart = undefined;
    this.launch.set(null);
    const series = history?.series[variant];
    if (!id || !history || !series || !container) return;

    //Prime items released inside the history are compared with the typical curve after a launch
    const group = !variant && Date.parse(history.start) - Date.parse(HISTORY_START) >= LAUNCH_MARGIN_DAYS * DAY ? launchGroup(NAMES.get(id) ?? '') : null;
    const base = group && launchPrice(series);
    const [lib, curves] = await Promise.all([
      import('lightweight-charts'),
      base ? this.curves ??= firstValueFrom(this.http.get<LaunchCurves>('assets/history/launch-curves.json')).catch(() => null) : null,
    ]);
    //A newer build started while the library loaded
    if (build != this.builds) return;
    const curve = group && curves?.[group].curve.length ? curves[group].curve : null;
    const length = (series.sell ?? series.closed)!.length;
    if (curve) this.launch.set({ group: group!, items: curves![group!].items, ended: length > curve.length });

    const style = getComputedStyle(container);
    const color = (name: string) => style.getPropertyValue(name).trim();
    const day = (i: number) => new Date(Date.parse(history.start) + i * DAY).toISOString().slice(0, 10);
    const points = (values: Values) => values.map((value, i) => value == null ? { time: day(i) } : { time: day(i), value });
    const grid = 'rgba(255, 255, 255, 0.08)';

    const chart = this.chart = lib.createChart(container, {
      autoSize: true,
      layout: { background: { type: lib.ColorType.Solid, color: color('--wt-bg-dark') }, textColor: color('--wt-text'), fontFamily: style.fontFamily },
      grid: { vertLines: { color: grid }, horzLines: { color: grid } },
      rightPriceScale: { borderColor: grid },
      timeScale: { borderColor: grid },
      localization: { locale: this.locale(), priceFormatter: (price: number) => this.number().format(price) },
    });
    const line = { lineWidth: 2, priceLineVisible: false } as const;
    const closed = series.closed && chart.addSeries(lib.LineSeries, { ...line, color: color('--wt-gold') });
    const sell = series.sell && chart.addSeries(lib.LineSeries, { ...line, color: '#7fb3d5' });
    closed?.setData(points(series.closed!));
    sell?.setData(points(series.sell!));
    //Dashed, from this item's own launch price, running past today up to two years after the release
    const typical = (i: number) => curve && base && curve[i] != null ? +(base * curve[i]).toFixed(1) : undefined;
    if (curve) {
      chart.addSeries(lib.LineSeries, {
        lineWidth: 1, lineStyle: lib.LineStyle.Dashed, color: 'rgba(255, 255, 255, 0.6)', priceLineVisible: false, lastValueVisible: false,
      }).setData(curve.map((_, i) => ({ time: day(i), value: typical(i)! })));
    }
    //Closed trades per day as bars in a smaller pane below; sell orders only go in the legend, their counts are much larger
    if (series.closedVolume) {
      const trades = chart.addSeries(lib.HistogramSeries, {
        color: 'rgba(209, 191, 84, 0.45)', priceLineVisible: false, lastValueVisible: false, priceFormat: { type: 'volume' },
      }, 1);
      trades.setData(points(series.closedVolume));
      chart.panes()[0].setStretchFactor(3);
      chart.panes()[1].setStretchFactor(1);
    }

    //The period always counts on the real history; with the launch curve, the same span ahead (up to 90 days) shows what is expected
    const ahead = curve && curve.length > length ? Math.min(period || EXPECTED_DAYS, EXPECTED_DAYS, curve.length - length) : 0;
    chart.timeScale().setVisibleRange({ from: day(period ? Math.max(0, length - period) : 0), to: day(length - 1 + ahead) });

    //Values of the day under the cursor; the last day when the cursor leaves
    const last = (values?: Values) => values?.filter(v => v != null).at(-1);
    //From the first value inside the period to the last one
    const change = (values?: Values) => {
      const from = values?.slice(period ? Math.max(0, length - period) : 0).find(v => v != null);
      const to = last(values);
      return from && to != null ? (to - from) / from : undefined;
    };
    const at = (i: number) => ({
      date: day(i), closed: series.closed?.[i] ?? undefined, sell: series.sell?.[i] ?? undefined,
      trades: series.closedVolume?.[i] ?? undefined, orders: series.sellVolume?.[i] ?? undefined, typical: typical(i),
    });
    const fallback = { ...at(length - 1), closedChange: change(series.closed), sellChange: change(series.sell), expected: typical(length - 1 + EXPECTED_DAYS) };
    this.legend.set(fallback);
    chart.subscribeCrosshairMove(param => {
      if (!param.time) return this.legend.set(fallback);
      this.legend.set(at(Math.round((Date.parse(param.time as string) - Date.parse(history.start)) / DAY)));
    });
  }

  formatDate(day: string) {
    return this.date().format(new Date(day));
  }

  formatPrice(price?: number) {
    return price == null ? '-' : this.number().format(price);
  }

  formatChange(change: number) {
    return this.percent().format(change);
  }

  variantLabel = variantLabel;

  close() {
    this.dialog().nativeElement.close();
  }
}
