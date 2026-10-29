import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Notificacion } from '../../../core/models/notificacion';
import { NotificacionesRepository } from '../../../core/notificaciones/notificaciones';
import { Notificaciones } from './notificaciones';

const LISTA: Notificacion[] = [
  { id: 1, turnoId: 40, tipo: 'RESERVA', asunto: 'Nuevo turno asignado', mensaje: '', fecha: '2026-10-26T10:00:00Z' },
  { id: 2, turnoId: null, tipo: 'CANCELACION', asunto: 'Turno cancelado', mensaje: '', fecha: '2026-10-27T10:00:00Z' },
];

describe('Notificaciones (profesional)', () => {
  let component: Notificaciones;
  let navigate: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [Notificaciones],
      providers: [provideRouter([]), { provide: NotificacionesRepository, useValue: { listar: () => of(LISTA) } }],
    });
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true) as never;
    const fixture = TestBed.createComponent(Notificaciones);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('lista de la más nueva a la más vieja', () => {
    expect(component.visibles().map((n) => n.id)).toEqual([2, 1]);
  });

  it('al abrirla va al turno [R15]', () => {
    component.abrir(LISTA[0]);
    expect(navigate).toHaveBeenCalledWith(['/profesional/turnos', 40]);
    navigate.mockClear();
    component.abrir(LISTA[1]);
    expect(navigate).not.toHaveBeenCalled();
  });
});
