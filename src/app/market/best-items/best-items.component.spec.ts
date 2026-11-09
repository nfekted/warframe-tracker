import 'fake-indexeddb/auto';
import { TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { BestItemsComponent } from './best-items.component';

describe('BestItemsComponent', () => {
  let best: BestItemsComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TranslocoTestingModule.forRoot({ langs: { en: {} } })] });
    best = TestBed.createComponent(BestItemsComponent).componentInstance;
  });

  it('starts with the most valuable items', () => {
    const medians = best.rendered().map(i => i.most_frequent);
    expect(medians).toEqual([...medians].sort((a, b) => b - a));
  });

  it('finds items by the English or Portuguese name', () => {
    best.setName('secura dual cestra');
    expect(best.tradeItem().map(i => i.name)).toContain('Secura Dual Cestra');

    best.setName('cestras duplas secura');
    expect(best.tradeItem().map(i => i.name)).toContain('Secura Dual Cestra');
  });

  it('shows one more page at a time and restarts on a new search', () => {
    best.showMore();
    expect(best.rendered().length).toBe(200);

    best.setName('prime');
    expect(best.rendered().length).toBe(100);
  });

  it('clears the name and the hidden categories', () => {
    best.show('relics', false);
    best.setName('zzzz');
    expect(best.tradeItem()).toEqual([]);

    best.clearFilters();
    expect(best.name()).toBe('');
    expect(best.hidden().size).toBe(0);
  });
});
