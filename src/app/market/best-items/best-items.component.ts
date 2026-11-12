
import { Component, ChangeDetectionStrategy, computed, inject, signal } from "@angular/core";
import { TranslocoModule } from '@jsverse/transloco';
import itemPrices from '../../../shared/jsons/tradeable/tradePrices.json';
import tradeables from '../../../shared/jsons/tradeable/tradeables.json';
import { normalize } from '../../../shared/utils/normalize';
import { ariaSort, nextSort, SortState, sortRows } from '../../../shared/utils/table-sort';
import { ThousandsPipe } from '../../../shared/utils/thousands.pipe';
import { ProgressStore } from '../../../shared/store/progress.store';
import { HistoryService } from '../history/history.service';

export type TradeCategory = 'primeItems' | 'primeSets' | 'relics' | 'helmets' | 'arcanes' | 'miscellaneous';

//Each item belongs to a single category, worked out from its name
export function tradeCategory(name: string): TradeCategory {
    if (name.includes(' Prime Set')) return 'primeSets';
    if (name.includes(' Prime ')) return 'primeItems';
    if (/^(Lith|Meso|Neo|Axi|Requiem) /.test(name)) return 'relics';
    if (name.includes(' Helmet')) return 'helmets';
    if (name.includes('Arcane ')) return 'arcanes';
    return 'miscellaneous';
}

const PAGE = 100;

//Classified, with the English and Portuguese names normalized for the search, once
const PT_NAMES = new Map(tradeables.map(t => [t.id, t.name_pt]));
const ITEMS = itemPrices.map(item => ({
    ...item,
    category: tradeCategory(item.name),
    search: normalize(item.name + '\n' + (PT_NAMES.get(item.id) ?? '')),
}));
type TradeItem = typeof ITEMS[number];

@Component({
    selector: 'app-best-items',
    imports: [TranslocoModule, ThousandsPipe],
    templateUrl: './best-items.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './best-items.component.scss'
})
export class BestItemsComponent {
    lang = inject(ProgressStore).lang;
    private history = inject(HistoryService);

    categories: TradeCategory[] = ['primeItems', 'primeSets', 'relics', 'helmets', 'miscellaneous', 'arcanes'];
    columns: { field: keyof TradeItem, label: string }[] = [
        { field: 'name', label: 'market.item' },
        { field: 'lowest', label: 'market.lowest' },
        { field: 'higher', label: 'market.highest' },
        { field: 'average', label: 'market.average' },
        { field: 'most_frequent', label: 'market.median' },
    ];

    maxRender = signal(PAGE);
    hidden = signal(new Set<TradeCategory>());
    name = signal('');
    //Most valuable first
    private sortState = signal<SortState<TradeItem>>({ field: 'most_frequent', desc: true });

    tradeItem = computed(() => {
        const hidden = this.hidden();
        const name = normalize(this.name().trim());
        const items = ITEMS.filter(item => !hidden.has(item.category) && item.search.includes(name));
        return sortRows(items, this.sortState());
    });

    rendered = computed(() => this.tradeItem().slice(0, this.maxRender()));

    //A new search starts again from the first page
    setName(name: string) {
        this.name.set(name);
        this.maxRender.set(PAGE);
    }

    showMore() {
        this.maxRender.update(max => max + PAGE);
    }

    clearFilters() {
        this.hidden.set(new Set());
        this.name.set('');
    }

    ariaSort(field: keyof TradeItem) {
        return ariaSort(this.sortState(), field);
    }

    sort(field: keyof TradeItem) {
        this.sortState.set(nextSort(this.sortState(), field));
    }

    openHistory(item: TradeItem) {
        this.history.open({ id: item.id, name: item.name });
    }

    show(category: TradeCategory, show: boolean) {
        this.hidden.update(hidden => {
            const next = new Set(hidden);
            if (show) next.delete(category);
            else next.add(category);
            return next;
        });
    }
}
