import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../../../../core/config/tokens';
import { API, consultaDto, pacienteDto, turnoDto } from '../../testing/api-falsa';
import { AgendaHttpRepository } from './agenda.repository.http';

describe('AgendaHttpRepository', () => {
  let repo: AgendaHttpRepository;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AgendaHttpRepository, provideHttpClient(), provideHttpClientTesting(), { provide: API_URL, useValue: API }],
    });
    repo = TestBed.inject(AgendaHttpRepository);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function responderTurno(id: number, extra = {}) {
    http.expectOne(`${API}/turnos/turnos/${id}/`).flush(turnoDto({ id, ...extra }));
    http.expectOne(`${API}/pacientes/pacientes/8/`).flush(pacienteDto());
    http.expectOne(`${API}/clinicos/consultas/`).flush([consultaDto({ turno: 13 })]);
  }

  it('lista solo turnos con paciente, con sus datos y su consulta [R11]', async () => {
    const lista = firstValueFrom(repo.listar());
    http.expectOne(`${API}/turnos/turnos/`).flush([turnoDto({ estado: 'EN_CURSO' }), turnoDto({ id: 20, paciente: null, estado: 'DISPONIBLE' })]);
    http.expectOne(`${API}/pacientes/pacientes/`).flush([pacienteDto(), pacienteDto({ id: 99 })]);
    http.expectOne(`${API}/clinicos/consultas/`).flush([consultaDto()]);

    expect(await lista).toEqual([
      {
        id: 13, fecha: '2026-11-03', horaInicio: '09:00', horaFin: '09:30', estado: 'EN_CURSO', tipoTurno: 'CONSULTA',
        especialidad: 'Cardiología', comentario: 'Control', consultaId: 3, informePendiente: false,
        paciente: {
          id: 8, nombre: 'Ana', apellido: 'Álvarez', tipoIdentificacion: 'DNI', numIdentificacion: '44976577',
          fechaNacimiento: '1992-03-04', telefono: '11 4497 6577', correo: 'ana@example.com', obraSocial: 'OSDE 210',
        },
      },
    ]);
  });

  it('un turno cerrado cuya consulta no tiene diagnóstico queda con el informe pendiente', async () => {
    const lista = firstValueFrom(repo.listar());
    http.expectOne(`${API}/turnos/turnos/`).flush([
      turnoDto({ id: 13, estado: 'FINALIZADO' }),
      turnoDto({ id: 14, estado: 'FINALIZADO' }),
    ]);
    http.expectOne(`${API}/pacientes/pacientes/`).flush([pacienteDto()]);
    http.expectOne(`${API}/clinicos/consultas/`).flush([
      consultaDto({ id: 3, turno: 13, estado: 'FINALIZADA' }),
      consultaDto({ id: 4, turno: 14, estado: 'FINALIZADA', diagnostico: 'HTA' }),
    ]);
    expect((await lista).map((t) => [t.id, t.informePendiente])).toEqual([[13, true], [14, false]]);
  });

  it('un turno libre o inexistente no es parte de la agenda', async () => {
    const libre = firstValueFrom(repo.obtener(20));
    http.expectOne(`${API}/turnos/turnos/20/`).flush(turnoDto({ id: 20, paciente: null, estado: 'DISPONIBLE' }));
    expect(await libre).toBeNull();

    const ajeno = firstValueFrom(repo.obtener(77));
    http.expectOne(`${API}/turnos/turnos/77/`).flush({}, { status: 404, statusText: 'Not Found' });
    expect(await ajeno).toBeNull();
  });

  it('iniciar llama a la acción y vuelve a leer el turno con su consulta [R13]', async () => {
    const turno = firstValueFrom(repo.iniciar(13));
    http.expectOne(`${API}/turnos/turnos/13/iniciar/`).flush({ mensaje: 'Turno iniciado', turno: turnoDto({ estado: 'EN_CURSO' }) });
    responderTurno(13, { estado: 'EN_CURSO' });
    expect(await turno).toEqual(expect.objectContaining({ estado: 'EN_CURSO', consultaId: 3 }));
  });

  it('cancelar lee el turno antes (el back puede liberarlo) y lo devuelve CANCELADO [R12]', async () => {
    const turno = firstValueFrom(repo.cancelar(13));
    responderTurno(13);
    http.expectOne(`${API}/turnos/turnos/13/cancelar/`).flush({ mensaje: 'liberado', turno: turnoDto({ paciente: null, estado: 'DISPONIBLE' }) });
    expect(await turno).toEqual(expect.objectContaining({ id: 13, estado: 'CANCELADO', paciente: expect.objectContaining({ nombre: 'Ana' }) }));
  });

  it('reprogramar manda el turno nuevo y devuelve ese turno', async () => {
    const turno = firstValueFrom(repo.reprogramar(13, 40));
    const req = http.expectOne(`${API}/turnos/turnos/13/reprogramar/`);
    expect(req.request.body).toEqual({ nuevo_turno_id: 40 });
    req.flush({ mensaje: 'ok', turno: turnoDto({ id: 40 }) });
    http.expectOne(`${API}/turnos/turnos/40/`).flush(turnoDto({ id: 40 }));
    http.expectOne(`${API}/pacientes/pacientes/8/`).flush(pacienteDto());
    http.expectOne(`${API}/clinicos/consultas/`).flush([]);
    expect((await turno).id).toBe(40);
  });

  it('disponibilidad: slots libres de consulta, horarios activos y bloqueos propios', async () => {
    const disp = firstValueFrom(repo.disponibilidad());
    const turnos = http.expectOne((r) => r.url === `${API}/turnos/turnos/`);
    expect(turnos.request.params.get('estado')).toBe('DISPONIBLE');
    turnos.flush([turnoDto({ id: 40, paciente: null, estado: 'DISPONIBLE' }), turnoDto({ id: 41, paciente: null, estado: 'DISPONIBLE', tipo_turno: 'ESTUDIO' })]);
    http.expectOne(`${API}/profesionales/horarios/`).flush([
      { profesional: 1, dia_semana: 'LUNES', hora_desde: '08:00:00', hora_hasta: '12:00:00', duracion_turnos_min: 30, activo: true },
      { profesional: 1, dia_semana: 'MARTES', hora_desde: '08:00:00', hora_hasta: '12:00:00', duracion_turnos_min: 30, activo: false },
    ]);
    http.expectOne(`${API}/turnos/fechas-bloqueadas/`).flush([
      { profesional: 1, fecha_desde: '2026-11-05T12:00:00Z', fecha_hasta: '2026-11-05T15:00:00Z', motivo: 'Congreso' },
      { profesional: 2, fecha_desde: '2026-11-05T12:00:00Z', fecha_hasta: '2026-11-05T15:00:00Z', motivo: 'Otro' },
    ]);
    const d = await disp;
    expect(d.slots.map((s) => s.turnoId)).toEqual([40]);
    expect(d.horarios).toEqual([{ diaSemana: 'LUNES', horaDesde: '08:00', horaHasta: '12:00', duracionTurnosMin: 30 }]);
    expect(d.bloqueos.map((b) => b.motivo)).toEqual(['Congreso']);
  });

  it('ficha: alergias y medicación activa del paciente', async () => {
    const ficha = firstValueFrom(repo.ficha(8));
    http.expectOne(`${API}/clinicos/historias-clinicas/`).flush([
      {
        paciente: 8,
        alergias: [{ descripcion: 'Látex', severidad: 'MODERADA' }],
        medicaciones: [
          { medicamento: 'Enalapril', dosis: '10 mg', frecuencia: null, activo: true },
          { medicamento: 'Amoxicilina', dosis: null, frecuencia: null, activo: false },
        ],
      },
    ]);
    expect(await ficha).toEqual({ alergias: ['Látex'], medicaciones: ['Enalapril 10 mg'] });
  });
});
