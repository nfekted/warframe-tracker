import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { RouterOutlet } from '@angular/router';
import { DialogComponent } from './dialog/dialog.component';
import { ProgressStore } from '../shared/store/progress.store';


@Component({
    selector: 'app-root',
    imports: [SidebarComponent, RouterOutlet, DialogComponent, TranslocoModule],
    templateUrl: './app.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './app.component.scss'
})
export class AppComponent {
  private translocoService = inject(TranslocoService);
  store = inject(ProgressStore);

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
