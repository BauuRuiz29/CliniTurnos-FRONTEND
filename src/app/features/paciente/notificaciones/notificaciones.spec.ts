import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Notificaciones } from './notificaciones';

describe('Notificaciones', () => {
  let component: Notificaciones;
  let fixture: ComponentFixture<Notificaciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Notificaciones],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Notificaciones);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('lista las notificaciones de la más nueva a la más vieja', () => {
    const fechas = component.visibles().map((n) => n.fechaEnvio);
    expect(fechas.length).toBeGreaterThan(0);
    expect(fechas).toEqual([...fechas].sort().reverse());
  });

  it('filtra informes y turnos', () => {
    component.filtro.set('Informes');
    expect(component.visibles().every((n) => n.tipo === 'INFORME_DISPONIBLE')).toBe(true);
    component.filtro.set('Turnos');
    expect(component.visibles().some((n) => n.tipo === 'INFORME_DISPONIBLE')).toBe(false);
  });

  it('el informe lleva a informes y el resto al turno', () => {
    const [informe] = component.visibles().filter((n) => n.tipo === 'INFORME_DISPONIBLE');
    expect(component.destino(informe)).toEqual(['/paciente/informes']);
    expect(component.destino({ ...informe, tipo: 'TURNO_CANCELADO', turnoId: 5 })).toEqual(['/paciente/turnos', 5]);
  });
});
