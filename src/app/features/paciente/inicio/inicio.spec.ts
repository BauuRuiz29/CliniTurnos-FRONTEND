import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { EstadoTurno } from '../../../core/models/enums';
import { of } from 'rxjs';
import { InformesRepository } from '../informes-medicos/data-access/informes.repository';
import { TurnoPaciente, TurnosRepository } from '../turnos/data-access/turnos.repository';
import { Inicio, reservadosFuturos } from './inicio';

describe('Inicio', () => {
  let component: Inicio;
  let fixture: ComponentFixture<Inicio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Inicio],
      providers: [
        provideRouter([]),
        { provide: TurnosRepository, useValue: { listar: () => of([]) } },
        { provide: InformesRepository, useValue: { listar: () => of([{ id: 1 }, { id: 2 }]) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Inicio);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('cuenta los informes disponibles del paciente [R10]', () => {
    expect(component.informesDisponibles()).toBe(2);
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
