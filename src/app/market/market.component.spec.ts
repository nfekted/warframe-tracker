import 'fake-indexeddb/auto';
import { TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { ProgressStore } from '../../shared/store/progress.store';
import { tradeCategory } from './best-items/best-items.component';
import { MarketComponent, normalize } from './market.component';
import itemPrices from '../../shared/jsons/tradeable/tradePrices.json';

describe('tradeCategory', () => {
  it.each([
    ['Saryn Prime Set', 'primeSets'],
    ['Saryn Prime Neuroptics Blueprint', 'primeItems'],
    ['Axi A1 Relic', 'relics'],
    ['Requiem I Relic', 'relics'],
    ['Arcane Essence Helmet', 'helmets'],
    ['Arcane Energize', 'arcanes'],
    ['Axios Javelineers', 'miscellaneous'],
    ['Secura Dual Cestra', 'miscellaneous'],
  ])('%s is %s', (name, category) => {
    expect(tradeCategory(name)).toBe(category);
  });
});

describe('MarketComponent search', () => {
  let market: MarketComponent;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({ imports: [TranslocoTestingModule.forRoot({ langs: { en: {} } })] });
    market = TestBed.createComponent(MarketComponent).componentInstance;
  });

  afterEach(async () => {
    vi.useRealTimers();
    await TestBed.inject(ProgressStore).reset();
  });

  function search(term: string) {
    market.onSearchChange(term);
    vi.advanceTimersByTime(150);
    return market.filteredItems();
  }

  it('ignores accents and case', () => {
    expect(normalize('Lâmina ÉTER')).toBe('lamina eter');
  });

  it('waits for the user to stop typing', () => {
    market.onSearchChange('cestra');
    vi.advanceTimersByTime(100);
    expect(market.filteredItems()).toEqual([]);

    vi.advanceTimersByTime(50);
    expect(market.filteredItems().length).toBeGreaterThan(0);
  });

  it('finds items by the English or Portuguese name', () => {
    expect(search('secura dual cestra').map(i => i.name_en)).toContain('Secura Dual Cestra');
    expect(search('cestras duplas secura').map(i => i.name_en)).toContain('Secura Dual Cestra');
  });

  it('shows at most 50 results', () => {
    expect(search('a').length).toBe(50);
  });

  it('only suggests items that have a price', () => {
    const priced = new Set(itemPrices.map(p => p.id));
    expect(search('a').every(item => priced.has(item.id))).toBe(true);
  });

  it('does not suggest items already on the list', () => {
    const [item] = search('secura dual cestra');
    market.selectItem(item, document.createElement('input'));

    expect(search('secura dual cestra').map(i => i.id)).not.toContain(item.id);
  });

  it('tells when nothing is found', () => {
    search('zzzz');
    expect(market.noMatch()).toBe(true);

    search('');
    expect(market.noMatch()).toBe(false);
  });

  it('adds the selected item and clears the search', () => {
    const input = document.createElement('input');
    input.value = 'secura dual';
    const [item] = search('secura dual cestra');

    market.selectItem(item, input);

    expect(input.value).toBe('');
    expect(market.filteredItems()).toEqual([]);
    expect(market.myList().map(i => i.id)).toEqual([item.id]);
  });
});
