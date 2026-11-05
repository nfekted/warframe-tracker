import { Component, ChangeDetectionStrategy, ElementRef, afterRenderEffect, inject, viewChild } from '@angular/core';
import { DialogService } from './dialog.service';

//Native modal <dialog>: Esc and the cancel button close it unconfirmed
@Component({
    selector: 'app-dialog',
    templateUrl: './dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './dialog.component.scss'
})
export class DialogComponent {
  service = inject(DialogService);

  private dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    //After render, so the buttons exist and autofocus works
    afterRenderEffect(() => {
      const options = this.service.current();
      const dialog = this.dialog().nativeElement;
      if (options && !dialog.open) {
        dialog.returnValue = '';
        dialog.showModal();
      } else if (!options && dialog.open) {
        dialog.close();
      }
    });
  }

  onClose(dialog: HTMLDialogElement) {
    if (this.service.current()) this.service.close(dialog.returnValue == 'confirm');
  }
}
