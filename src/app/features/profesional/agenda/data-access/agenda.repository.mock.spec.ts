import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { EstadoTurno } from '../../../../core/models/enums';
import { isoLocal, sumarDias } from '../../../../shared/utils/calendario';
import { ProfesionalMockDb } from '../../data-access/profesional.mock-db';
import { AgendaMockRepository } from './agenda.repository.mock';

// El mock respeta la máquina de estados del turno [AGENTS §4.2].
describe('AgendaMockRepository', () => {
  let repo: AgendaMockRepository;
  let db: ProfesionalMockDb;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [AgendaMockRepository] });
    repo = TestBed.inject(AgendaMockRepository);
    db = TestBed.inject(ProfesionalMockDb);
  });

  const reservadoLejano = () => db.turnos.find((t) => t.estado === EstadoTurno.RESERVADO && t.fecha >= isoLocal(sumarDias(new Date(), 2)))!;

  it('iniciar pasa RESERVADO → EN_CURSO y crea la consulta', async () => {
    const fila = reservadoLejano();
    const turno = await firstValueFrom(repo.iniciar(fila.id));
    expect(turno.estado).toBe(EstadoTurno.EN_CURSO);
    expect(turno.consultaId).not.toBeNull();
  });

  it('no inicia un turno FINALIZADO', async () => {
    const fila = db.turnos.find((t) => t.estado === EstadoTurno.FINALIZADO)!;
    await expect(firstValueFrom(repo.iniciar(fila.id))).rejects.toThrow();
  });

  it('cancelar deja el turno CANCELADO y la franja libre otra vez', async () => {
    const fila = reservadoLejano();
    const libresAntes = db.turnos.filter((t) => t.fecha === fila.fecha && t.horaInicio === fila.horaInicio && t.estado === EstadoTurno.DISPONIBLE).length;
    const turno = await firstValueFrom(repo.cancelar(fila.id));
    expect(turno.estado).toBe(EstadoTurno.CANCELADO);
    expect(db.turnos.filter((t) => t.fecha === fila.fecha && t.horaInicio === fila.horaInicio && t.estado === EstadoTurno.DISPONIBLE).length).toBe(libresAntes + 1);
  });

  it('reprogramar cancela el original y reserva la franja nueva para el mismo paciente', async () => {
    const original = reservadoLejano();
    const libre = db.turnos.find((t) => t.estado === EstadoTurno.DISPONIBLE && t.fecha > original.fecha)!;
    const nuevo = await firstValueFrom(repo.reprogramar(original.id, libre.id));
    expect(nuevo.id).toBe(libre.id);
    expect(nuevo.estado).toBe(EstadoTurno.RESERVADO);
    expect(nuevo.paciente.id).toBe(original.pacienteId);
    expect(original.estado).toBe(EstadoTurno.CANCELADO);
  });

  it('no reprograma a una franja ocupada', async () => {
    const original = reservadoLejano();
    const ocupada = db.turnos.find((t) => t.estado === EstadoTurno.RESERVADO && t.id !== original.id)!;
    await expect(firstValueFrom(repo.reprogramar(original.id, ocupada.id))).rejects.toThrow();
    expect(original.estado).toBe(EstadoTurno.RESERVADO);
  });
});
