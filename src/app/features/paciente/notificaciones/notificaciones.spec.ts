import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Notificacion } from '../../../core/models/notificacion';
import { NotificacionesRepository } from '../../../core/notificaciones/notificaciones';
import { Notificaciones } from './notificaciones';

const LISTA: Notificacion[] = [
  { id: 1, turnoId: 5, tipo: 'CANCELACION', asunto: 'Turno cancelado', mensaje: '', fecha: '2026-10-20T10:00:00Z' },
  { id: 2, turnoId: null, tipo: 'RECORDATORIO', asunto: 'Recordatorio', mensaje: '', fecha: '2026-10-26T10:00:00Z' },
];

describe('Notificaciones', () => {
  let component: Notificaciones;
  let fixture: ComponentFixture<Notificaciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Notificaciones],
      providers: [provideRouter([]), { provide: NotificacionesRepository, useValue: { listar: () => of(LISTA) } }],
    }).compileComponents();

    fixture = TestBed.createComponent(Notificaciones);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('lista las notificaciones de la más nueva a la más vieja', () => {
    expect(component.visibles().map((n) => n.id)).toEqual([2, 1]);
  });

  it('lleva al turno si tiene uno', () => {
    expect(component.destino(LISTA[0])).toEqual(['/paciente/turnos', 5]);
    expect(component.destino(LISTA[1])).toBeNull();
  });
});
