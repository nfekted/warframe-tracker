//Column sorting shared by the market price tables
export type SortState<T> = { field: keyof T, desc: boolean } | null;

//Numbers by value, text alphabetically
export function sortRows<T>(rows: T[], sort: SortState<T>): T[] {
  if (!sort) return rows;
  const { field, desc } = sort;
  return [...rows].sort((a, b) => {
    const result = typeof a[field] == 'number' ? +a[field] - +b[field] : String(a[field]).localeCompare(String(b[field]));
    return desc ? -result : result;
  });
}

//Clicking the same column again reverses the order
export function nextSort<T>(current: SortState<T>, field: keyof T): SortState<T> {
  return { field, desc: current?.field == field && !current.desc };
}

//Only the sorted column has a direction; the others are not announced as sorted
export function ariaSort<T>(sort: SortState<T>, field: keyof T): 'ascending' | 'descending' | null {
  if (sort?.field != field) return null;
  return sort.desc ? 'descending' : 'ascending';
}
