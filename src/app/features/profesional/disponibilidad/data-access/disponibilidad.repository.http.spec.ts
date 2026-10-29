import { formatDate } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../../../../core/config/tokens';
import { API } from '../../testing/api-falsa';
import { DisponibilidadHttpRepository } from './disponibilidad.repository.http';

const PROFESIONAL = { id: 1, usuario: { id: 3, nombre: 'Juan', apellido: 'García', login: 'jg@example.com', foto: null }, especialidades: [], matriculas: [] };

describe('DisponibilidadHttpRepository', () => {
  let repo: DisponibilidadHttpRepository;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DisponibilidadHttpRepository, provideHttpClient(), provideHttpClientTesting(), { provide: API_URL, useValue: API }],
    });
    repo = TestBed.inject(DisponibilidadHttpRepository);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  // /users/me/ no trae el id de profesional: se busca en el listado por usuario.
  function responderProfesional() {
    http.expectOne(`${API}/users/me/`).flush({ id: 3, genero: 'MASCULINO' });
    http.expectOne(`${API}/profesionales/profesionales/`).flush([{ ...PROFESIONAL, id: 2, usuario: { ...PROFESIONAL.usuario, id: 9 } }, PROFESIONAL]);
  }

  it('lista los horarios y cambia si están activos [R22]', async () => {
    const horarios = firstValueFrom(repo.horarios());
    http.expectOne(`${API}/profesionales/horarios/`).flush([
      { id: 1, profesional: 1, dia_semana: 'LUNES', hora_desde: '08:00:00', hora_hasta: '09:00:00', duracion_turnos_min: 30, activo: true },
    ]);
    expect(await horarios).toEqual([{ id: 1, diaSemana: 'LUNES', horaDesde: '08:00', horaHasta: '09:00', duracionTurnosMin: 30, activo: true }]);

    const cambiado = firstValueFrom(repo.cambiarActivo(1, false));
    const patch = http.expectOne(`${API}/profesionales/horarios/1/`);
    expect([patch.request.method, patch.request.body]).toEqual(['PATCH', { activo: false }]);
    patch.flush({ id: 1, profesional: 1, dia_semana: 'LUNES', hora_desde: '08:00:00', hora_hasta: '09:00:00', duracion_turnos_min: 30, activo: false });
    expect((await cambiado).activo).toBe(false);
  });

  it('muestra solo los bloqueos del profesional, en hora local', async () => {
    const bloqueos = firstValueFrom(repo.bloqueos());
    responderProfesional();
    http.expectOne(`${API}/turnos/fechas-bloqueadas/`).flush([
      { id: 1, profesional: 1, fecha_desde: '2026-11-17T03:00:00Z', fecha_hasta: '2026-11-18T02:59:00Z', motivo: 'Congreso' },
      { id: 2, profesional: 2, fecha_desde: '2026-11-17T03:00:00Z', fecha_hasta: '2026-11-18T02:59:00Z', motivo: 'De otro' },
    ]);
    expect(await bloqueos).toEqual([
      { id: 1, fechaDesde: formatDate('2026-11-17T03:00:00Z', "yyyy-MM-dd'T'HH:mm", 'en-US'), fechaHasta: formatDate('2026-11-18T02:59:00Z', "yyyy-MM-dd'T'HH:mm", 'en-US'), motivo: 'Congreso' },
    ]);
  });

  it('bloquea mandando el profesional y las fechas con zona horaria', async () => {
    const bloqueo = firstValueFrom(repo.bloquear({ fechaDesde: '2026-11-20T08:00', fechaHasta: '2026-11-20T12:00', motivo: null }));
    responderProfesional();
    const post = http.expectOne(`${API}/turnos/fechas-bloqueadas/`);
    expect(post.request.body).toEqual({
      profesional: 1,
      fecha_desde: new Date('2026-11-20T08:00').toISOString(),
      fecha_hasta: new Date('2026-11-20T12:00').toISOString(),
      motivo: null,
    });
    post.flush({ id: 5, profesional: 1, fecha_desde: new Date('2026-11-20T08:00').toISOString(), fecha_hasta: new Date('2026-11-20T12:00').toISOString(), motivo: null });
    expect(await bloqueo).toEqual({ id: 5, fechaDesde: '2026-11-20T08:00', fechaHasta: '2026-11-20T12:00', motivo: null });
  });

  it('desbloquear borra el bloqueo', async () => {
    const r = firstValueFrom(repo.desbloquear(5));
    const req = http.expectOne(`${API}/turnos/fechas-bloqueadas/5/`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
    await r;
  });
});
