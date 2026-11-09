import { ariaSort, nextSort, sortRows } from './table-sort';

describe('table sort', () => {
  const rows = [{ name: 'b', price: 10 }, { name: 'a', price: 2 }, { name: 'c', price: 5 }];

  it('sorts numbers by value and text alphabetically', () => {
    expect(sortRows(rows, { field: 'price', desc: false }).map(r => r.price)).toEqual([2, 5, 10]);
    expect(sortRows(rows, { field: 'name', desc: true }).map(r => r.name)).toEqual(['c', 'b', 'a']);
  });

  it('keeps the order when nothing is sorted', () => {
    expect(sortRows(rows, null)).toBe(rows);
  });

  it('starts ascending and reverses on the same column', () => {
    const first = nextSort<typeof rows[number]>(null, 'price');
    expect(first).toEqual({ field: 'price', desc: false });
    expect(nextSort(first, 'price')).toEqual({ field: 'price', desc: true });
    expect(nextSort(first, 'name')).toEqual({ field: 'name', desc: false });
  });

  it('announces only the sorted column', () => {
    expect(ariaSort({ field: 'price', desc: true }, 'price')).toBe('descending');
    expect(ariaSort({ field: 'price', desc: true }, 'name')).toBeNull();
  });
});
