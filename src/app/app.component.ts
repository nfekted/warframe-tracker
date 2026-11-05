import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ItemsPanelComponent } from './items-panel/items-panel.component';
import { MarketComponent } from './market/market.component';
import { StarChartPanelComponent } from './star-chart-panel/star-chart-panel.component';
import { TranslocoService } from '@jsverse/transloco';
import { IncarnonPanelComponent } from './incarnon-panel/incarnon-panel.component';
import { ProgressStore } from '../shared/store/progress.store';


@Component({
    selector: 'app-root',
    imports: [SidebarComponent, ItemsPanelComponent, MarketComponent, StarChartPanelComponent, IncarnonPanelComponent],
    templateUrl: './app.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './app.component.scss'
})
export class AppComponent {
  private translocoService = inject(TranslocoService);
  store = inject(ProgressStore);

  render: string = 'items';

  changeLang(lang: string) {
    this.translocoService.setActiveLang(lang);
    this.store.setLang(lang);
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
