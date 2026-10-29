import { formatDate } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { Observable, of } from 'rxjs';
import { EstadoTurno } from '../../../../core/models/enums';
import { TurnoPaciente, TurnosRepository } from '../data-access/turnos.repository';
import { DetalleTurno } from './detalle-turno';

const enDias = (d: number) => formatDate(Date.now() + d * 86_400_000, 'yyyy-MM-dd', 'en-US');

const base: TurnoPaciente = {
  id: 1, fecha: enDias(5), horaInicio: '10:30', horaFin: '11:00', estado: EstadoTurno.RESERVADO,
  profesional: { id: 7, nombre: 'Juan García' }, especialidad: 'Cardiología',
  comentario: null,
};

class RepoFalso implements TurnosRepository {
  turno: TurnoPaciente | null = base;
  cancelados: number[] = [];
  listar(): Observable<TurnoPaciente[]> { return of([]); }
  obtener(): Observable<TurnoPaciente | null> { return of(this.turno); }
  cancelar(id: number): Observable<TurnoPaciente> {
    this.cancelados.push(id);
    return of({ ...this.turno!, estado: EstadoTurno.CANCELADO });
  }
}

describe('DetalleTurno', () => {
  let repo: RepoFalso;
  let navigate: ReturnType<typeof vi.fn>;

  function crear(turno: TurnoPaciente | null) {
    repo.turno = turno;
    TestBed.configureTestingModule({
      imports: [DetalleTurno],
      providers: [
        provideRouter([]),
        { provide: TurnosRepository, useValue: repo },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ turnoId: '1' })) } },
      ],
    });
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true) as never;
    const fixture = TestBed.createComponent(DetalleTurno);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  beforeEach(() => {
    repo = new RepoFalso();
    // jsdom no implementa <dialog>.
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();
  });

  it('redirige a mis turnos si el turno no existe', () => {
    crear(null);
    expect(navigate).toHaveBeenCalledWith(['/paciente/turnos']);
  });

  it('cancela un turno reservado con más de 24 h y va a la confirmación [R08]', () => {
    const c = crear(base);
    expect(c.modificable()).toBe(true);
    c.cancelar();
    expect(repo.cancelados).toEqual([1]);
    expect(navigate.mock.calls[0][0]).toEqual(['/paciente/confirmacion/turno-cancelado']);
  });

  it('no deja cancelar ni reprogramar a menos de 24 h', () => {
    const c = crear({ ...base, fecha: enDias(0), horaInicio: '23:59' });
    expect(c.modificable()).toBe(false);
    c.cancelar();
    c.reprogramar();
    expect(repo.cancelados).toEqual([]);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('no deja cancelar un turno que no está reservado', () => {
    const c = crear({ ...base, estado: EstadoTurno.FINALIZADO });
    expect(c.modificable()).toBe(false);
  });

  it('reprogramar lleva a reservar con el mismo profesional', () => {
    crear(base).reprogramar();
    expect(navigate).toHaveBeenCalledWith(['/paciente/reservar-turno', 7], { queryParams: { reprograma: 1 } });
  });
});
