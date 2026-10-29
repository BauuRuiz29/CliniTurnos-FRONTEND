import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { DIAS_SEMANA, isoLocal, sumarDias } from '../../../../shared/utils/calendario';
import { EstadoTurno } from '../../../../core/models/enums';
import { AgendaFalsa, turnoDePrueba } from '../../testing/datos-prueba';
import { AgendaRepository } from '../data-access/agenda.repository';
import { Reprogramar } from './reprogramar';

const manana = sumarDias(new Date(), 1);
const FECHA = isoLocal(manana);

describe('Reprogramar', () => {
  let repo: AgendaFalsa;
  let navigate: ReturnType<typeof vi.fn>;

  async function crear() {
    TestBed.configureTestingModule({
      imports: [Reprogramar],
      providers: [
        provideRouter([]),
        { provide: AgendaRepository, useValue: repo },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ turnoId: '1' }) } } },
      ],
    });
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true) as never;
    const fixture = TestBed.createComponent(Reprogramar);
    await fixture.whenStable();
    return fixture.componentInstance;
  }

  beforeEach(() => {
    repo = new AgendaFalsa();
    repo.turnos = [turnoDePrueba({ id: 1 })];
    repo.disp = {
      horarios: [{ diaSemana: DIAS_SEMANA[manana.getDay()], horaDesde: '08:00', horaHasta: '09:00', duracionTurnosMin: 30 }],
      bloqueos: [],
      slots: [{ turnoId: 50, fecha: FECHA, horaInicio: '08:00', horaFin: '08:30', estado: EstadoTurno.DISPONIBLE }],
    };
  });

  it('confirma con la franja elegida y muestra el turno nuevo [R12]', async () => {
    const c = await crear();
    c.slot.set(repo.disp.slots[0]);
    c.confirmar();
    expect(repo.llamadas).toEqual(['reprogramar:1->50']);
    expect(navigate).toHaveBeenCalledWith(['/profesional/turnos', 50, 'reprogramado']);
  });

  it('si la franja se ocupó mientras elegía, avisa y no reprograma [Rnf 08]', async () => {
    const c = await crear();
    c.slot.set(repo.disp.slots[0]);
    repo.disp = { ...repo.disp, slots: [{ ...repo.disp.slots[0], estado: EstadoTurno.RESERVADO }] };
    c.confirmar();
    expect(repo.llamadas).toEqual([]);
    expect(c.error()).toContain('ya no está disponible');
    expect(c.slot()).toBeNull();
  });

  it('un turno fuera de la ventana de 24 h vuelve al detalle', async () => {
    repo.turnos = [turnoDePrueba({ id: 1, fecha: isoLocal(new Date()), horaInicio: '23:59' })];
    await crear();
    expect(navigate).toHaveBeenCalledWith(['/profesional/turnos', 1]);
  });
});
