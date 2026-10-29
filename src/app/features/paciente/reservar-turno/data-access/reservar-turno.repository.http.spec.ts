import { formatDate } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../../../../core/config/tokens';
import { TurnoDto } from '../../../../core/models/turno.dto';
import { SlotNoDisponibleError } from './reservar-turno.repository';
import { ReservarTurnoHttpRepository } from './reservar-turno.repository.http';

const API = 'http://api.test/api';

const PROFESIONAL = {
  id: 4,
  usuario: { id: 6, nombre: 'Laura', apellido: 'Fernández', login: 'lf@example.com', foto: null },
  especialidades: [{ id: 4, especialidad: { id: 5, nombre: 'Pediatría', descripcion: '' } }],
  horarios: [
    { id: 1, profesional: 4, dia_semana: 'LUNES', hora_desde: '08:00:00', hora_hasta: '12:00:00', duracion_turnos_min: 30, activo: true },
    { id: 2, profesional: 4, dia_semana: 'MARTES', hora_desde: '08:00:00', hora_hasta: '12:00:00', duracion_turnos_min: 30, activo: false },
  ],
  matriculas: [],
};

const slot = (extra: Partial<TurnoDto> = {}): TurnoDto => ({
  id: 70, paciente: null, paciente_nombre: null, profesional: 4, profesional_nombre: 'Laura Fernández', especialidad: null,
  especialidad_nombre: null, tipo_turno: 'CONSULTA', fecha: '2026-11-02', estado: 'DISPONIBLE',
  fecha_hora_inicio: '08:00:00', fecha_hora_fin: '08:30:00', comentario: null, ...extra,
});

describe('ReservarTurnoHttpRepository', () => {
  let repo: ReservarTurnoHttpRepository;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReservarTurnoHttpRepository, provideHttpClient(), provideHttpClientTesting(), { provide: API_URL, useValue: API }],
    });
    repo = TestBed.inject(ReservarTurnoHttpRepository);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('trae el profesional con todas sus especialidades; null si no existe', async () => {
    const p = firstValueFrom(repo.obtenerProfesional(4));
    http.expectOne(`${API}/profesionales/profesionales/4/`).flush(PROFESIONAL);
    expect(await p).toEqual({ id: 4, nombre: 'Laura', apellido: 'Fernández', especialidades: [{ id: 5, nombre: 'Pediatría', descripcion: '' }] });

    const inexistente = firstValueFrom(repo.obtenerProfesional(99));
    http.expectOne(`${API}/profesionales/profesionales/99/`).flush({}, { status: 404, statusText: 'Not Found' });
    expect(await inexistente).toBeNull();
  });

  it('arma la disponibilidad con horarios activos, slots de consulta y bloqueos del profesional [Rnf 08]', async () => {
    const disp = firstValueFrom(repo.obtenerDisponibilidad(4));
    http.expectOne(`${API}/profesionales/profesionales/4/`).flush(PROFESIONAL);
    const turnos = http.expectOne((r) => r.url === `${API}/turnos/turnos/`);
    expect(turnos.request.params.get('profesional')).toBe('4');
    expect(turnos.request.params.get('estado')).toBe('DISPONIBLE');
    turnos.flush([slot(), slot({ id: 71, tipo_turno: 'ESTUDIO' })]);
    const desde = '2026-11-02T11:00:00Z';
    const hasta = '2026-11-02T13:00:00Z';
    http.expectOne(`${API}/turnos/fechas-bloqueadas/`).flush([
      { id: 1, profesional: 4, fecha_desde: desde, fecha_hasta: hasta, motivo: 'Congreso' },
      { id: 2, profesional: 1, fecha_desde: desde, fecha_hasta: hasta, motivo: 'De otro' },
    ]);

    expect(await disp).toEqual({
      horarios: [{ diaSemana: 'LUNES', horaDesde: '08:00', horaHasta: '12:00', duracionTurnosMin: 30 }],
      bloqueos: [{ fechaDesde: formatDate(desde, "yyyy-MM-dd'T'HH:mm", 'en-US'), fechaHasta: formatDate(hasta, "yyyy-MM-dd'T'HH:mm", 'en-US'), motivo: 'Congreso' }],
      slots: [{ turnoId: 70, fecha: '2026-11-02', horaInicio: '08:00', horaFin: '08:30', estado: 'DISPONIBLE' }],
    });
  });

  it('reserva con el comentario [R06]', async () => {
    const r = firstValueFrom(repo.reservar({ turnoId: 70, comentario: 'Control', reprogramaTurnoId: null }));
    const req = http.expectOne(`${API}/turnos/turnos/70/reservar/`);
    expect(req.request.body).toEqual({ comentario: 'Control' });
    req.flush(slot({ paciente: 8, estado: 'RESERVADO', comentario: 'Control' }));
    expect(await r).toEqual({ turnoId: 70, fecha: '2026-11-02', horaInicio: '08:00', profesional: 'Laura Fernández', especialidad: null });
  });

  it('reprograma desde el turno viejo con el id del nuevo [R08]', async () => {
    const r = firstValueFrom(repo.reservar({ turnoId: 70, comentario: null, reprogramaTurnoId: 45 }));
    const req = http.expectOne(`${API}/turnos/turnos/45/reprogramar/`);
    expect(req.request.body).toEqual({ nuevo_turno_id: 70 });
    req.flush({ mensaje: 'Turno reprogramado correctamente', turno: slot({ paciente: 8, estado: 'RESERVADO' }) });
    expect((await r).turnoId).toBe(70);
  });

  it('si el slot ya no está disponible devuelve SlotNoDisponibleError', async () => {
    const r = firstValueFrom(repo.reservar({ turnoId: 70, comentario: null, reprogramaTurnoId: null }));
    http.expectOne(`${API}/turnos/turnos/70/reservar/`).flush({ error: 'El turno no está disponible' }, { status: 400, statusText: 'Bad Request' });
    await expect(r).rejects.toBeInstanceOf(SlotNoDisponibleError);
  });
});
