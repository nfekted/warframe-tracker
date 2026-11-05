import { Component, EventEmitter, Output, ChangeDetectionStrategy, inject } from '@angular/core';
import Swal from 'sweetalert2';
import { INTRINSICS } from '../../shared/metadata';
import { ProgressStore } from '../../shared/store/progress.store';

import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

@Component({
    selector: 'app-sidebar',
    imports: [TranslocoModule],
    templateUrl: './sidebar.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  private transloco = inject(TranslocoService);
  store = inject(ProgressStore);

  @Output() changeRender = new EventEmitter<string>();

  intrinsics = INTRINSICS;
  render: string = 'items';

  progress(): number {
    const current = this.store.masteryRank().xp;
    return (this.store.account().xp - current) / (this.store.nextRank().xp - current) * 100;
  }

  //The store clamps the value; the input is rewritten so it never shows a value that is not counted
  setIntrinsic(kind: 'railjack' | 'drifter', input: HTMLInputElement) {
    if (kind == 'railjack') this.store.setRailjack(input.valueAsNumber);
    else this.store.setDrifter(input.valueAsNumber);

    if (input.value != '') input.value = String(this.store[kind]());
  }

  delete() {
    Swal.fire({
      text: this.transloco.translate('erase'),
      showCancelButton: true,
      confirmButtonText: this.transloco.translate('delete'),
      cancelButtonText: this.transloco.translate('cancel'),
      confirmButtonColor: '#a7160c'
    }).then((result) => {
      if (result.isConfirmed) {
        this.store.reset();
      }
    });
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

    const result = await Swal.fire({
      text: this.transloco.translate('import.confirm'),
      showCancelButton: true,
      confirmButtonText: this.transloco.translate('sidebar.import'),
      cancelButtonText: this.transloco.translate('cancel'),
    });
    if (!result.isConfirmed) return;

    try {
      await this.store.importData(await file.text());
      Swal.fire({ text: this.transloco.translate('import.success'), icon: 'success' });
    } catch (error) {
      const reason = error instanceof Error && error.message == 'newer_version' ? 'newer_version' : 'invalid_file';
      Swal.fire({ text: this.transloco.translate('import.' + reason), icon: 'error' });
    }
  }

  changeRenderEvent(type: string) {
    this.render = type;
    this.changeRender.emit(type);
  }
}
