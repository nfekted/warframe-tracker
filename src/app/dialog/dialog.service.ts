import { Injectable, signal } from '@angular/core';

export interface DialogOptions {
  text: string;
  confirm: string;
  //Without it the dialog is a plain message with a single button
  cancel?: string;
  danger?: boolean;
  icon?: 'success' | 'error';
}

//Messages and confirmations shown by DialogComponent, one at a time
@Injectable({ providedIn: 'root' })
export class DialogService {
  readonly current = signal<DialogOptions | null>(null);
  private resolve?: (confirmed: boolean) => void;

  //Resolves true when confirmed, false when cancelled or closed with Esc
  open(options: DialogOptions): Promise<boolean> {
    this.close(false);
    this.current.set(options);
    return new Promise(resolve => this.resolve = resolve);
  }

  close(confirmed: boolean) {
    const resolve = this.resolve;
    this.resolve = undefined;
    this.current.set(null);
    resolve?.(confirmed);
  }
}
