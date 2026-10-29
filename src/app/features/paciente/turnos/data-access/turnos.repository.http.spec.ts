import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../../../../core/config/tokens';
import { TurnoDto } from '../../../../core/models/turno.dto';
import { TurnosHttpRepository } from './turnos.repository.http';

const URL = 'http://api.test/api/turnos/turnos';

const dto = (extra: Partial<TurnoDto> = {}): TurnoDto => ({
  id: 45, paciente: 8, paciente_nombre: 'Ana Álvarez', profesional: 1, profesional_nombre: 'Juan Manuel García',
  especialidad: 2, especialidad_nombre: 'Cardiología', tipo_turno: 'CONSULTA', fecha: '2026-11-03', estado: 'RESERVADO',
  fecha_hora_inicio: '10:00:00', fecha_hora_fin: '10:30:00', comentario: null, ...extra,
});

describe('TurnosHttpRepository', () => {
  let repo: TurnosHttpRepository;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TurnosHttpRepository, provideHttpClient(), provideHttpClientTesting(), { provide: API_URL, useValue: 'http://api.test/api' }],
    });
    repo = TestBed.inject(TurnosHttpRepository);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lista solo los turnos propios, pidiendo por estado para no traer las franjas libres [R07]', async () => {
    const lista = firstValueFrom(repo.listar());
    const pedidos = http.match((r) => r.url === `${URL}/`);
    expect(pedidos.map((p) => p.request.params.get('estado'))).toEqual(['RESERVADO', 'EN_CURSO', 'FINALIZADO', 'CANCELADO', 'AUSENTE']);
    pedidos[0].flush([dto()]);
    pedidos[3].flush([dto({ id: 50, estado: 'CANCELADO', especialidad_nombre: null })]);
    pedidos.filter((_, i) => i !== 0 && i !== 3).forEach((p) => p.flush([]));

    expect(await lista).toEqual([
      { id: 45, fecha: '2026-11-03', horaInicio: '10:00', horaFin: '10:30', estado: 'RESERVADO', profesional: { id: 1, nombre: 'Juan Manuel García' }, especialidad: 'Cardiología', comentario: null },
      { id: 50, fecha: '2026-11-03', horaInicio: '10:00', horaFin: '10:30', estado: 'CANCELADO', profesional: { id: 1, nombre: 'Juan Manuel García' }, especialidad: null, comentario: null },
    ]);
  });

  it('un turno sin paciente o inexistente no es del paciente', async () => {
    const libre = firstValueFrom(repo.obtener(12));
    http.expectOne(`${URL}/12/`).flush(dto({ id: 12, paciente: null, estado: 'DISPONIBLE' }));
    expect(await libre).toBeNull();

    const ajeno = firstValueFrom(repo.obtener(99));
    http.expectOne(`${URL}/99/`).flush({ detail: 'No encontrado.' }, { status: 404, statusText: 'Not Found' });
    expect(await ajeno).toBeNull();
  });

  it('cancela con POST y devuelve el turno de la respuesta [R08]', async () => {
    const cancelado = firstValueFrom(repo.cancelar(45));
    const req = http.expectOne(`${URL}/45/cancelar/`);
    expect(req.request.method).toBe('POST');
    req.flush({ mensaje: 'Turno cancelado y liberado', turno: dto({ paciente: null, estado: 'DISPONIBLE' }) });
    expect((await cancelado).id).toBe(45);
  });
});
