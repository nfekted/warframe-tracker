import { Component, ChangeDetectionStrategy, ElementRef, computed, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { INTRINSICS } from '../../shared/metadata';
import { ProgressStore } from '../../shared/store/progress.store';
import { DialogService } from '../dialog/dialog.service';
import { ThousandsPipe } from '../../shared/utils/thousands.pipe';
import { Bootstrap } from '../../shared/utils/bootstrap';

import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

@Component({
    selector: 'app-sidebar',
    imports: [TranslocoModule, RouterLink, RouterLinkActive, ThousandsPipe],
    templateUrl: './sidebar.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  private transloco = inject(TranslocoService);
  private dialog = inject(DialogService);
  store = inject(ProgressStore);

  intrinsics = INTRINSICS;

  private menu = viewChild.required<ElementRef<HTMLElement>>('menu');

  //On phones the menu covers the page, so it closes after each navigation
  constructor() {
    inject(Router).events.pipe(filter(event => event instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => Bootstrap().Collapse.getInstance(this.menu().nativeElement)?.hide());
  }

  //Percentage of the way to the next rank; full at the last rank
  progress = computed(() => {
    const current = this.store.masteryRank().xp;
    const next = this.store.nextRank().xp;
    return next > current ? (this.store.account().xp - current) / (next - current) * 100 : 100;
  });

  //The store clamps the value; the input is rewritten so it never shows a value that is not counted
  setIntrinsic(kind: 'railjack' | 'drifter', input: HTMLInputElement) {
    if (kind == 'railjack') this.store.setRailjack(input.valueAsNumber);
    else this.store.setDrifter(input.valueAsNumber);

    if (input.value != '') input.value = String(this.store[kind]());
  }

  async delete() {
    const confirmed = await this.dialog.open({
      text: this.transloco.translate('erase'),
      confirm: this.transloco.translate('delete'),
      cancel: this.transloco.translate('cancel'),
      danger: true,
    });
    if (confirmed) await this.store.reset();
  }

  exportData() {
    const blob = new Blob([this.store.exportData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `warframe-tracker-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async importData(input: HTMLInputElement) {
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    const confirmed = await this.dialog.open({
      text: this.transloco.translate('import.confirm'),
      confirm: this.transloco.translate('sidebar.import'),
      cancel: this.transloco.translate('cancel'),
    });
    if (!confirmed) return;

    try {
      await this.store.importData(await file.text());
      this.dialog.open({ text: this.transloco.translate('import.success'), confirm: this.transloco.translate('ok'), icon: 'success' });
    } catch (error) {
      const reason = error instanceof Error && error.message == 'newer_version' ? 'newer_version' : 'invalid_file';
      this.dialog.open({ text: this.transloco.translate('import.' + reason), confirm: this.transloco.translate('ok'), icon: 'error' });
    }
  }
}
