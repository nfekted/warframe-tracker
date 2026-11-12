import { Injectable, signal } from '@angular/core';

export interface HistoryItem {
  id: string;
  name: string;
  //Series opened first, such as r5 or intact; without it the dialog picks one
  variant?: string;
}

//r5 is shown as Rank 5, subtypes with a capital letter
export function variantLabel(variant: string) {
  return variant.split('-').map(part => /^r\d+$/.test(part) ? `Rank ${part.slice(1)}` : part[0].toUpperCase() + part.slice(1)).join(' · ');
}

//The item whose price history HistoryDialogComponent shows, one at a time
@Injectable({ providedIn: 'root' })
export class HistoryService {
  readonly current = signal<HistoryItem | null>(null);

  open(item: HistoryItem) {
    this.current.set(item);
  }

  close() {
    this.current.set(null);
  }
}
