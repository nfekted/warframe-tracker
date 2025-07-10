import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import relicPrices from '../../../shared/jsons/tradeable/relics.json';

@Component({
    selector: 'app-best-relics',
    standalone: true,
    imports: [FormsModule, CommonModule],
    templateUrl: './best-relics.component.html',
    styleUrl: './best-relics.component.scss'
})
export class BestRelicsComponent {

    relics: { name: string, worst: number, worst_name: string, worst_url: string, best: number, best_name: string, best_url: string, expected: number }[] = [];
    maxRelic: number = 100;
    relicFilter: string;

    ngOnInit(): void {
        this.loadRelics();
    }

    loadRelics() {
        this.maxRelic = 100;
        this.relics = relicPrices;

        switch (this.relicFilter) {
            case 'Lith':
                this.relics = this.relics.filter(r => r.name.includes('Lith '));
                break;
            case 'Meso':
                this.relics = this.relics.filter(r => r.name.includes('Meso '));
                break;
            case 'Neo':
                this.relics = this.relics.filter(r => r.name.includes('Neo '));
                break;
            case 'Axi':
                this.relics = this.relics.filter(r => r.name.includes('Axi '));
                break;
            case 'Requiem':
                this.relics = this.relics.filter(r => r.name.includes('Requiem '));
                break;
        }

        this.relics.sort((a, b) => { return b.expected - a.expected });
    }

}

