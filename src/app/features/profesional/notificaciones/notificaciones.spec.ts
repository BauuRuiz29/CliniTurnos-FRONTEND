import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { NotificacionProfesional, NotificacionesRepository } from './data-access/notificaciones.repository';
import { Notificaciones } from './notificaciones';

const LISTA: NotificacionProfesional[] = [
  { id: 1, turnoId: 40, tipo: 'TURNO_ASIGNADO', asunto: 'Nuevo turno asignado', mensaje: '', fechaEnvio: '2026-10-26T10:00:00Z', leida: false },
  { id: 2, turnoId: null, tipo: 'INFORME_PENDIENTE', asunto: 'Informe pendiente', mensaje: '', fechaEnvio: '2026-10-25T10:00:00Z', leida: true },
];

describe('Notificaciones (profesional)', () => {
  let component: Notificaciones;
  let marcadas: number[];
  let navigate: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    marcadas = [];
    TestBed.configureTestingModule({
      imports: [Notificaciones],
      providers: [
        provideRouter([]),
        { provide: NotificacionesRepository, useValue: { listar: () => of(LISTA), marcarLeida: (id: number) => (marcadas.push(id), of(undefined)) } },
      ],
    });
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true) as never;
    const fixture = TestBed.createComponent(Notificaciones);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('filtra leídas y no leídas', () => {
    component.filtro.set('No leídas');
    expect(component.visibles().map((n) => n.id)).toEqual([1]);
    component.filtro.set('Leídas');
    expect(component.visibles().map((n) => n.id)).toEqual([2]);
  });

  it('al abrirla la marca como leída y va al turno [R15]', () => {
    component.abrir(LISTA[0]);
    expect(marcadas).toEqual([1]);
    expect(component.leida(LISTA[0])).toBe(true);
    expect(navigate).toHaveBeenCalledWith(['/profesional/turnos', 40]);
  });
});
