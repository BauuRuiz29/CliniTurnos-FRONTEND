import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Sidebar } from './sidebar';

describe('Sidebar', () => {
  let fixture: ComponentFixture<Sidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Sidebar);
    fixture.componentRef.setInput('ariaLabel', 'Navegación');
    fixture.componentRef.setInput('items', [
      { texto: 'Inicio', ruta: 'inicio', icono: 'inicio.png' },
      { texto: 'Agenda', ruta: 'agenda', icono: 'calendario.png' },
    ]);
    await fixture.whenStable();
  });

  it('renderiza un link por item', () => {
    const links = (fixture.nativeElement as HTMLElement).querySelectorAll('a.sidebar__item');
    expect([...links].map((a) => a.textContent?.trim())).toEqual(['Inicio', 'Agenda']);
  });

  it('avisa cuando se cierra sesión', () => {
    let emitido = false;
    fixture.componentInstance.cerrarSesion.subscribe(() => (emitido = true));
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.sidebar__logout')!.click();
    expect(emitido).toBe(true);
  });
});
