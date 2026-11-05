
import { Component, ChangeDetectionStrategy, computed, signal } from "@angular/core";
import itemPrices from '../../../shared/jsons/tradeable/tradePrices.json';

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

//Classified and sorted by median price once
const ITEMS = itemPrices
    .map(item => ({ ...item, category: tradeCategory(item.name) }))
    .sort((a, b) => b.most_frequent - a.most_frequent);

@Component({
    selector: 'app-best-items',
    templateUrl: './best-items.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './best-items.component.scss'
})
export class BestItemsComponent {

    maxRender = signal(100);
    hidden = signal(new Set<TradeCategory>());

    tradeItem = computed(() => {
        const hidden = this.hidden();
        return ITEMS.filter(item => !hidden.has(item.category));
    });

    rendered = computed(() => this.tradeItem().slice(0, this.maxRender()));

    showAll() {
        this.maxRender.set(Infinity);
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
