import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { EstadoTurno } from '../../../core/models/enums';
import { DIAS_SEMANA, isoLocal, sumarDias } from '../../../shared/utils/calendario';
import {
  Disponibilidad,
  ProfesionalReserva,
  ReservarTurnoRepository,
  SlotNoDisponibleError,
  SolicitudReserva,
  TurnoReservado,
} from './data-access/reservar-turno.repository';
import { ReservarTurno } from './reservar-turno';

const PROFESIONAL: ProfesionalReserva = { id: 1, nombre: 'Juan', apellido: 'García', especialidades: [{ id: 7, nombre: 'Cardiología' }] };

// Mañana: siempre cae dentro de la ventana; el horario se arma para ese día de la semana.
const manana = sumarDias(new Date(), 1);
const FECHA = isoLocal(manana);
const DIA = DIAS_SEMANA[manana.getDay()];

const disponibilidad = (estado: EstadoTurno): Disponibilidad => ({
  horarios: [{ diaSemana: DIA, horaDesde: '08:00', horaHasta: '09:00', duracionTurnosMin: 30 }],
  bloqueos: [],
  slots: [
    { turnoId: 10, fecha: FECHA, horaInicio: '08:00', horaFin: '08:30', estado },
    { turnoId: 11, fecha: FECHA, horaInicio: '08:30', horaFin: '09:00', estado: EstadoTurno.RESERVADO },
  ],
});

class RepoFalso implements ReservarTurnoRepository {
  respuestas: Disponibilidad[] = [];
  pedidos = 0;
  reservas: SolicitudReserva[] = [];
  conflicto = false;
  obtenerProfesional(id: number): Observable<ProfesionalReserva | null> {
    return of(id === 1 ? PROFESIONAL : null);
  }
  obtenerDisponibilidad(): Observable<Disponibilidad> {
    const r = this.respuestas[Math.min(this.pedidos, this.respuestas.length - 1)];
    this.pedidos++;
    return of(r);
  }
  reservar(s: SolicitudReserva): Observable<TurnoReservado> {
    this.reservas.push(s);
    if (this.conflicto) return throwError(() => new SlotNoDisponibleError());
    return of({ turnoId: s.turnoId, fecha: FECHA, horaInicio: '08:00', profesional: 'Juan García', especialidad: 'Cardiología' });
  }
}

describe('ReservarTurno', () => {
  let repo: RepoFalso;
  let navigate: ReturnType<typeof vi.fn>;

  function crear(profesionalId: string) {
    TestBed.configureTestingModule({
      imports: [ReservarTurno],
      providers: [
        provideRouter([]),
        { provide: ReservarTurnoRepository, useValue: repo },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ profesionalId })) } },
      ],
    });
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true) as never;
    const fixture = TestBed.createComponent(ReservarTurno);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  function elegirPrimerHorario(c: ReservarTurno) {
    c.mes.set({ anio: manana.getFullYear(), mes: manana.getMonth() });
    c.elegirDia(c.dias().find((d) => d?.fecha === FECHA)!);
    c.elegirHorario(c.horarios()[0]);
    c.continuar();
  }

  beforeEach(() => {
    repo = new RepoFalso();
    repo.respuestas = [disponibilidad(EstadoTurno.DISPONIBLE)];
  });

  it('redirige a especialidades si el profesional no existe', () => {
    crear('99');
    expect(navigate).toHaveBeenCalledWith(['/paciente/especialidades']);
  });

  it('muestra los horarios del día y no deja elegir uno reservado', () => {
    const c = crear('1');
    c.mes.set({ anio: manana.getFullYear(), mes: manana.getMonth() });
    c.elegirDia(c.dias().find((d) => d?.fecha === FECHA)!);
    expect(c.horarios().map((h) => h.habilitado)).toEqual([true, false]);
    c.elegirHorario(c.horarios()[1]);
    expect(c.slot()).toBeNull();
  });

  it('confirma: vuelve a pedir disponibilidad, reserva y navega con el turno', () => {
    const c = crear('1');
    elegirPrimerHorario(c);
    expect(c.paso()).toBe(2);
    c.comentario.setValue('  Control anual  ');
    c.confirmar();

    expect(repo.pedidos).toBe(2); // al entrar y justo antes de confirmar [Rnf 08]
    expect(repo.reservas).toEqual([{ turnoId: 10, comentario: 'Control anual', reprogramaTurnoId: null }]);
    expect(navigate).toHaveBeenCalledWith(['/paciente/confirmacion/turno-confirmado'], {
      state: { turno: expect.objectContaining({ turnoId: 10, profesional: 'Juan García' }) },
    });
  });

  it('no reserva con un comentario de más de 255 caracteres', () => {
    const c = crear('1');
    elegirPrimerHorario(c);
    c.comentario.setValue('x'.repeat(256));
    c.confirmar();
    expect(repo.reservas).toEqual([]);
  });

  it('conflicto al revalidar: el slot ya se reservó, muestra error y vuelve a los horarios', () => {
    repo.respuestas = [disponibilidad(EstadoTurno.DISPONIBLE), disponibilidad(EstadoTurno.RESERVADO)];
    const c = crear('1');
    elegirPrimerHorario(c);
    c.confirmar();

    expect(repo.reservas).toEqual([]);
    expect(c.error()).toContain('ya no está disponible');
    expect(c.paso()).toBe(1);
    expect(c.slot()).toBeNull();
    expect(c.horarios()[0].habilitado).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('conflicto al reservar: muestra error y recarga los horarios', () => {
    repo.conflicto = true;
    const c = crear('1');
    elegirPrimerHorario(c);
    c.confirmar();

    expect(c.error()).toContain('ya no está disponible');
    expect(repo.pedidos).toBe(3);
    expect(c.paso()).toBe(1);
    expect(navigate).not.toHaveBeenCalled();
  });
});
