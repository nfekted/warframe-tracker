import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import itemPrices from '../../../shared/jsons/tradeable/tradePrices.json';

@Component({
    selector: 'app-best-items',
    standalone: true,
    imports: [FormsModule, CommonModule],
    templateUrl: './best-items.component.html',
    styleUrl: './best-items.component.scss'
})
export class BestItemsComponent {

    maxRender: number = 100;
    tradeItem: { id: string, url: string, name: string, lowest: number, higher: number, average: number, most_frequent: number }[] = [];

    showPrimeItems: boolean = true;
    showPrimeSets: boolean = true;
    showRelics: boolean = true;
    showHelmet: boolean = true;
    showMiscellaneous: boolean = true;

    ngOnInit(): void {
        this.loadItems();
    }

    loadItems() {
        this.tradeItem = itemPrices;

        if (!this.showMiscellaneous) this.tradeItem = this.tradeItem.filter(i =>
            i.name.includes(' Prime ')
            || i.name.includes(' Prime Set')
            || i.name.includes(' Helmet')
            || i.name.includes('Lith')
            || i.name.includes('Meso')
            || i.name.includes('Neo')
            || i.name.includes('Axi')
            || i.name.includes('Requiem')
        );

        if (!this.showPrimeItems) this.tradeItem = this.tradeItem.filter(i => !i.name.includes(' Prime ') || i.name.includes(' Prime Set'));

        if (!this.showPrimeSets) this.tradeItem = this.tradeItem.filter(i => !i.name.includes(' Prime Set'));

        if (!this.showRelics) this.tradeItem = this.tradeItem.filter(i => !i.name.includes('Lith') && !i.name.includes('Meso') && !i.name.includes('Neo') && !i.name.includes('Axi') && !i.name.includes('Requiem'));

        if (!this.showHelmet) this.tradeItem = this.tradeItem.filter(i => !i.name.includes(' Helmet'));

        this.tradeItem.sort((a, b) => { return b.most_frequent - a.most_frequent });
    }
}