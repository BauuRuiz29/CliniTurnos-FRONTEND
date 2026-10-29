import { provideHttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../../../core/config/tokens';
import { TurnoDto } from '../../../core/models/turno.dto';
import { AdminRepository, ProfesionalAdmin, armarResumen, mensajeDeError } from './admin';

const API = 'http://api.test/api';

const turno = (extra: Partial<TurnoDto>): TurnoDto => ({
  id: 1, paciente: 8, paciente_nombre: null, profesional: 4, profesional_nombre: null, especialidad: null, especialidad_nombre: null,
  tipo_turno: 'CONSULTA', fecha: '2026-11-02', estado: 'RESERVADO', fecha_hora_inicio: '08:00:00', fecha_hora_fin: '08:30:00', comentario: null, ...extra,
});

describe('AdminRepository', () => {
  let repo: AdminRepository;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), { provide: API_URL, useValue: API }] });
    repo = TestBed.inject(AdminRepository);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('el estado del profesional sale de su usuario [R16]', async () => {
    const lista = firstValueFrom(repo.profesionales());
    http.expectOne(`${API}/profesionales/profesionales/`).flush([
      { id: 4, usuario: { id: 6, nombre: 'Laura', apellido: 'Fernández', login: 'lfernandez' }, especialidades: [{ especialidad: { id: 5, nombre: 'Pediatría' } }] },
    ]);
    http.expectOne(`${API}/users/usuarios/`).flush([{ id: 6, login: 'lfernandez', nombre: 'Laura', apellido: 'Fernández', estado: 'INACTIVO', roles: ['MEDICO'] }]);
    expect(await lista).toEqual([{ id: 4, nombre: 'Laura Fernández', login: 'lfernandez', especialidades: ['Pediatría'], activo: false }]);
  });

  it('el alta manda la matrícula solo si se cargó [R16]', async () => {
    const base = { nombre: 'Ana', apellido: 'Paz', genero: 'FEMENINO' as const, login: 'apaz', password: 'clave-segura', especialidadIds: [2], horarios: [] };
    void firstValueFrom(repo.altaProfesional({ ...base, numeroMatricula: null, tipoMatricula: null }));
    const sin = http.expectOne(`${API}/profesionales/profesionales/alta/`);
    expect(sin.request.body).toEqual({ nombre: 'Ana', apellido: 'Paz', genero: 'FEMENINO', login: 'apaz', password: 'clave-segura', especialidad_ids: [2] });
    sin.flush({});

    void firstValueFrom(repo.altaProfesional({ ...base, numeroMatricula: 'MN 1', tipoMatricula: 'NACIONAL' }));
    const con = http.expectOne(`${API}/profesionales/profesionales/alta/`);
    expect(con.request.body).toMatchObject({ numero_matricula: 'MN 1', tipo_matricula: 'NACIONAL' });
    con.flush({});
  });

  it('después del alta crea los horarios y genera los turnos [R16, R22]', async () => {
    const alta = firstValueFrom(repo.altaProfesional({
      nombre: 'Ana', apellido: 'Paz', genero: 'FEMENINO', login: 'apaz', password: 'clave-segura', especialidadIds: [2],
      numeroMatricula: null, tipoMatricula: null,
      horarios: [{ diaSemana: 'LUNES', horaDesde: '08:00', horaHasta: '12:00', duracionTurnosMin: 30 }],
    }));
    http.expectOne(`${API}/profesionales/profesionales/alta/`).flush({ id: 7 });
    const horario = http.expectOne(`${API}/profesionales/horarios/`);
    expect(horario.request.body).toEqual({ profesional: 7, dia_semana: 'LUNES', hora_desde: '08:00', hora_hasta: '12:00', duracion_turnos_min: 30, activo: true });
    horario.flush({});
    const slots = http.expectOne(`${API}/turnos/turnos/generar_slots/`);
    expect(slots.request.body).toEqual({ profesional_id: 7, dias: 30 });
    slots.flush({ error: 'x' }, { status: 400, statusText: 'Bad Request' });
    // El profesional quedó creado: se avisa que falló la disponibilidad en lugar de tirar error.
    expect(await alta).toBe(false);
  });

  it('baja y reactivación usan sus endpoints [R16]', () => {
    void firstValueFrom(repo.cambiarEstadoProfesional(4, false));
    http.expectOne(`${API}/profesionales/profesionales/4/baja/`).flush({});
    void firstValueFrom(repo.cambiarEstadoProfesional(4, true));
    http.expectOne(`${API}/profesionales/profesionales/4/reactivar/`).flush({});
  });

  it('crea con POST y modifica con PATCH [R21]', () => {
    void firstValueFrom(repo.guardarEspecialidad(null, { nombre: 'Nueva', descripcion: '' }));
    expect(http.expectOne(`${API}/profesionales/especialidades/`).request.method).toBe('POST');
    void firstValueFrom(repo.guardarEspecialidad(3, { nombre: 'Editada', descripcion: 'x' }));
    expect(http.expectOne(`${API}/profesionales/especialidades/3/`).request.method).toBe('PATCH');
  });
});

describe('armarResumen', () => {
  const activo: ProfesionalAdmin = { id: 4, nombre: 'Laura Fernández', login: 'lf', especialidades: ['Pediatría'], activo: true };
  const inactivo: ProfesionalAdmin = { ...activo, id: 5, activo: false, especialidades: [] };

  it('cuenta activos, turnos de hoy con paciente y agrupa por estado y especialidad', () => {
    const r = armarResumen(
      [activo, inactivo],
      12,
      [turno({}), turno({ estado: 'DISPONIBLE', paciente: null })],
      [turno({}), turno({ estado: 'CANCELADO' }), turno({ especialidad_nombre: 'Laboratorio', profesional: null }), turno({ profesional: 5 })],
      new Map([[4, 'Pediatría']]),
    );
    expect(r.profesionalesActivos).toBe(1);
    expect(r.pacientes).toBe(12);
    expect(r.turnosHoy).toBe(1);
    expect(r.porEstado).toEqual([{ etiqueta: 'Reservado', cantidad: 3 }, { etiqueta: 'Cancelado', cantidad: 1 }]);
    expect(r.porEspecialidad).toEqual([
      { etiqueta: 'Pediatría', cantidad: 2 },
      { etiqueta: 'Laboratorio', cantidad: 1 },
      { etiqueta: 'Sin especialidad', cantidad: 1 },
    ]);
  });
});

describe('mensajeDeError', () => {
  it('toma el primer mensaje de un 400 de DRF', () => {
    const e = new HttpErrorResponse({ status: 400, error: { login: ['Este login ya está en uso.'] } });
    expect(mensajeDeError(e, 'x')).toBe('Este login ya está en uso.');
    expect(mensajeDeError(new HttpErrorResponse({ status: 500 }), 'x')).toBe('x');
  });
});
