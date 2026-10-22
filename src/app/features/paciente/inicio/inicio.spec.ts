import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { EstadoTurno } from '../../../core/models/enums';
import { TurnoPaciente } from '../turnos/data-access/turnos.repository';
import { Inicio, reservadosFuturos } from './inicio';

describe('Inicio', () => {
  let component: Inicio;
  let fixture: ComponentFixture<Inicio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Inicio],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Inicio);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('cuenta y ordena solo los RESERVADO futuros [R07]', () => {
    const turno = (id: number, fecha: string, horaInicio: string, estado: EstadoTurno) => ({ id, fecha, horaInicio, estado }) as TurnoPaciente;
    const ahora = new Date(2026, 9, 20, 10, 0);
    const res = reservadosFuturos(
      [
        turno(1, '2026-10-25', '09:00', EstadoTurno.RESERVADO),
        turno(2, '2026-10-20', '09:59', EstadoTurno.RESERVADO), // ya empezó
        turno(3, '2026-10-20', '11:00', EstadoTurno.RESERVADO),
        turno(4, '2026-10-21', '08:00', EstadoTurno.CANCELADO),
      ],
      ahora,
    );
    expect(res.map((t) => t.id)).toEqual([3, 1]);
  });
});
