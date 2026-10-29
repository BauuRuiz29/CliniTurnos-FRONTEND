import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { EstadoTurno } from '../../../../core/models/enums';
import { isoLocal } from '../../../../shared/utils/calendario';
import { AgendaFalsa, turnoDePrueba } from '../../testing/datos-prueba';
import { AgendaRepository } from '../data-access/agenda.repository';
import { DetalleTurno } from './detalle-turno';

describe('DetalleTurno (profesional)', () => {
  let repo: AgendaFalsa;
  let navigate: ReturnType<typeof vi.fn>;

  async function crear(id: number) {
    TestBed.configureTestingModule({
      imports: [DetalleTurno],
      providers: [
        provideRouter([]),
        { provide: AgendaRepository, useValue: repo },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ turnoId: String(id) }) } } },
      ],
    });
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true) as never;
    const fixture = TestBed.createComponent(DetalleTurno);
    await fixture.whenStable();
    return fixture.componentInstance;
  }

  beforeEach(() => {
    // jsdom no implementa <dialog>.
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();
    repo = new AgendaFalsa();
    const pronto = new Date(Date.now() + 3 * 3_600_000);
    repo.turnos = [
      turnoDePrueba({ id: 1 }),
      turnoDePrueba({ id: 2, fecha: isoLocal(pronto), horaInicio: `${String(pronto.getHours()).padStart(2, '0')}:00` }),
    ];
  });

  it('vuelve a la agenda si el turno no existe', async () => {
    await crear(99);
    expect(navigate).toHaveBeenCalledWith(['/profesional/agenda']);
  });

  it('permite cancelar o reprogramar solo hasta 24 h antes [R12]', async () => {
    expect((await crear(1)).modificable()).toBe(true);
    TestBed.resetTestingModule();
    expect((await crear(2)).modificable()).toBe(false);
  });

  it('comenzar consulta inicia el turno y abre el informe [R13]', async () => {
    const c = await crear(1);
    c.comenzarConsulta();
    expect(repo.llamadas).toEqual(['iniciar:1']);
    expect(navigate).toHaveBeenCalledWith(['/profesional/turnos', 1, 'informe']);
  });

  it('cancelar lleva a la confirmación con el turno cancelado (el back puede liberar la franja)', async () => {
    const c = await crear(1);
    c.cancelar();
    expect(repo.llamadas).toEqual(['cancelar:1']);
    expect(navigate).toHaveBeenCalledWith(['/profesional/turnos', 1, 'cancelado'], { state: { turno: expect.objectContaining({ id: 1 }) } });
  });

  it('no se puede iniciar un turno que no está RESERVADO', async () => {
    repo.turnos = [turnoDePrueba({ id: 1, estado: EstadoTurno.FINALIZADO })];
    const c = await crear(1);
    c.comenzarConsulta();
    expect(repo.llamadas).toEqual([]);
  });
});
