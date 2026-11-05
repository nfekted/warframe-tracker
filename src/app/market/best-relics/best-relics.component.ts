
import { Component, ChangeDetectionStrategy, computed, signal } from "@angular/core";
import relicPrices from '../../../shared/jsons/tradeable/relics.json';

//Era (Lith, Meso, Neo, Axi, Requiem) taken from the name and sorted by expected price once
const RELICS = relicPrices
    .map(relic => ({ ...relic, era: relic.name.split(' ')[0] }))
    .sort((a, b) => b.expected - a.expected);

@Component({
    selector: 'app-best-relics',
    templateUrl: './best-relics.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './best-relics.component.scss'
})
export class BestRelicsComponent {

    eras = ['Lith', 'Meso', 'Neo', 'Axi', 'Requiem'];
    maxRelic = signal(100);
    relicFilter = signal('');

    relics = computed(() => {
        const era = this.relicFilter();
        return era ? RELICS.filter(r => r.era == era) : RELICS;
    });

    rendered = computed(() => this.relics().slice(0, this.maxRelic()));

    setFilter(era: string) {
        this.relicFilter.set(era);
        this.maxRelic.set(100);
    }

    showAll() {
        this.maxRelic.set(Infinity);
    }
}
