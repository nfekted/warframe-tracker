import { TestBed } from '@angular/core/testing';
import { DialogComponent } from './dialog.component';
import { DialogService } from './dialog.service';

//jsdom has <dialog> but not its methods
function stubDialog() {
  const proto = HTMLDialogElement.prototype as any;
  proto.showModal ??= function (this: HTMLDialogElement) { this.open = true; };
  proto.close ??= function (this: HTMLDialogElement, value?: string) {
    if (!this.open) return;
    this.open = false;
    if (value !== undefined) this.returnValue = value;
    this.dispatchEvent(new Event('close'));
  };
}

describe('DialogComponent', () => {
  let service: DialogService;
  let el: HTMLElement;

  beforeAll(stubDialog);

  beforeEach(() => {
    const fixture = TestBed.createComponent(DialogComponent);
    service = TestBed.inject(DialogService);
    el = fixture.nativeElement;
  });

  const dialog = () => el.querySelector('dialog')!;
  const button = (value: string) => el.querySelector<HTMLButtonElement>(`button[value="${value}"]`);

  async function open(cancel?: string) {
    const result = service.open({ text: 'Erase all data?', confirm: 'Delete', cancel, danger: true });
    await TestBed.tick();
    return result;
  }

  it('opens as a modal with the text and buttons', async () => {
    open('Cancel');
    await TestBed.tick();

    expect(dialog().open).toBe(true);
    expect(dialog().textContent).toContain('Erase all data?');
    expect(button('confirm')!.textContent).toBe('Delete');
    expect(button('confirm')!.classList).toContain('btn-danger');
    expect(button('cancel')!.textContent).toBe('Cancel');
  });

  it('shows a single button for messages', async () => {
    open();
    await TestBed.tick();

    expect(button('cancel')).toBeNull();
  });

  it.each([
    ['confirm', true],
    ['cancel', false],
  ])('resolves the %s button as %s and closes', async (value, expected) => {
    const result = open('Cancel');
    await TestBed.tick();

    button(value)!.click();

    expect(await result).toBe(expected);
    expect(dialog().open).toBe(false);
    expect(service.current()).toBeNull();
  });

  it('resolves false when closed with Esc', async () => {
    const result = open('Cancel');
    await TestBed.tick();

    dialog().close();

    expect(await result).toBe(false);
  });

  it('resolves the previous dialog as false when another one opens', async () => {
    const first = open('Cancel');
    await TestBed.tick();

    service.open({ text: 'Data imported', confirm: 'OK' });

    expect(await first).toBe(false);
    await TestBed.tick();
    expect(dialog().textContent).toContain('Data imported');
    expect(dialog().open).toBe(true);
  });
});
