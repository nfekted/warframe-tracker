import { ThousandsPipe } from './thousands.pipe';

describe('ThousandsPipe', () => {
  const pipe = new ThousandsPipe();

  it('uses the separator of the app language', () => {
    expect(pipe.transform(3087038, 'en')).toBe('3,087,038');
    expect(pipe.transform(3087038, 'pt')).toBe('3.087.038');
  });

  it('leaves small numbers alone', () => {
    expect(pipe.transform(999, 'pt')).toBe('999');
  });
});
