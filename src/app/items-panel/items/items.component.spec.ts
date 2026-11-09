import 'fake-indexeddb/auto';
import { TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { Item } from '../../../shared/models/item.model';
import { ProgressStore } from '../../../shared/store/progress.store';
import { ItemsComponent } from './items.component';

function item(name: string, mastered = false): Item {
  const i = new Item(name, 'warframes', 'Market', 0, 6000, `https://wiki.warframe.com/w/${name}`);
  i.mastered = mastered;
  return i;
}

describe('ItemsComponent', () => {
  const ash = item('Ash', true);
  const wisp = item('Wisp');
  const excalibur = item('Excalibur Prime');

  function render(visible: Item[]) {
    TestBed.configureTestingModule({
      imports: [ItemsComponent, TranslocoTestingModule.forRoot({ langs: { en: {} } })],
    });
    const fixture = TestBed.createComponent(ItemsComponent);
    fixture.componentRef.setInput('type', 'warframes');
    fixture.componentRef.setInput('items', [ash, wisp, excalibur]);
    fixture.componentRef.setInput('visible', visible);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  afterEach(async () => {
    await TestBed.inject(ProgressStore).reset();
  });

  it('counts every item but lists only the visible ones', () => {
    const el = render([ash, excalibur]);

    expect(el.querySelector('[counter]')!.textContent).toBe('1/3');
    expect([...el.querySelectorAll('.check-name')].map(n => n.textContent)).toEqual(['Ash', 'Excalibur Prime']);
  });

  it('marks mastered items and their rarity', () => {
    const [ashRow, excaliburRow] = render([ash, excalibur]).querySelectorAll('.check-row');

    expect(ashRow.classList).toContain('done');
    expect(ashRow.querySelector('.check-main')!.getAttribute('aria-pressed')).toBe('true');
    expect(ashRow.hasAttribute('data-rarity')).toBe(false);
    expect(excaliburRow.getAttribute('data-rarity')).toBe('prime');
    expect(excaliburRow.classList).not.toContain('done');
  });

  it('links to the wiki in a new tab', () => {
    const link = render([wisp]).querySelector('a')!;

    expect(link.href).toBe('https://wiki.warframe.com/w/Wisp');
    expect(link.target).toBe('_blank');
    expect(link.rel).toBe('noopener');
  });

  it('toggles the item in the store', () => {
    render([wisp]).querySelector<HTMLButtonElement>('.check-main')!.click();

    expect(TestBed.inject(ProgressStore).account().warframes.find(i => i.name == 'Wisp')!.mastered).toBe(true);
  });

  it('hides and shows the list', () => {
    const el = render([wisp]);
    const list = el.querySelector('.check-list')!.closest('.row')!.parentElement!;

    el.querySelector<HTMLInputElement>('#hidewarframes')!.dispatchEvent(new Event('change'));
    TestBed.tick();
    expect(list.hidden).toBe(true);

    el.querySelector<HTMLInputElement>('#showwarframes')!.dispatchEvent(new Event('change'));
    TestBed.tick();
    expect(list.hidden).toBe(false);
  });
});
