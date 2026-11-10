
import { Component, ChangeDetectionStrategy, computed, inject, signal } from "@angular/core";
import { TranslocoModule } from '@jsverse/transloco';
import relicPrices from '../../../shared/jsons/tradeable/relics.json';
import { MARKET_DATA } from '../../../shared/metadata';
import { ProgressStore } from '../../../shared/store/progress.store';
import { ThousandsPipe } from '../../../shared/utils/thousands.pipe';

//Era (Lith, Meso, Neo, Axi, Requiem) taken from the name and sorted by expected price once;
//all of them are Radiant (said above the table), so the suffix is dropped
const RELICS = relicPrices
    .map(relic => ({ ...relic, name: relic.name.replace(' (Radiant)', ''), era: relic.name.split(' ')[0] }))
    .sort((a, b) => b.expected - a.expected);

@Component({
    selector: 'app-best-relics',
    imports: [TranslocoModule, ThousandsPipe],
    templateUrl: './best-relics.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './best-relics.component.scss'
})
export class BestRelicsComponent {
    lang = inject(ProgressStore).lang;
    relicData = MARKET_DATA.relics;

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
