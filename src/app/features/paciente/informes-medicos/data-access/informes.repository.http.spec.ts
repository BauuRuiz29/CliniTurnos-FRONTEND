import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../../../../core/config/tokens';
import { InformesHttpRepository } from './informes.repository.http';

const API = 'http://api.test/api';

const consulta = (id: number, turno: number, diagnostico: string | null) => ({
  id, turno, fecha_turno: '2026-10-29', hora_turno: '14:00:00', profesional_nombre: 'Pablo Sánchez', paciente_nombre: 'Ana Álvarez',
  diagnostico, plan_tratamiento: 'Kinesiología', indicaciones: null, observaciones: null, estado: 'FINALIZADA', fecha_consulta: '2026-10-29T14:10:00-03:00',
});

describe('InformesHttpRepository', () => {
  let repo: InformesHttpRepository;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InformesHttpRepository, provideHttpClient(), provideHttpClientTesting(), { provide: API_URL, useValue: API }],
    });
    repo = TestBed.inject(InformesHttpRepository);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function responder() {
    http.expectOne(`${API}/clinicos/historias-clinicas/`).flush([
      { id: 8, informes: [consulta(6, 301, 'Tendinitis'), consulta(8, 82, null)] },
    ]);
    http.expectOne(`${API}/clinicos/documentos/`).flush([
      { id: 3, consulta: 6, turno: 301, nombre: 'orden.pdf', archivo_url: 'http://api.test/media/orden.pdf' },
      { id: 4, consulta: null, turno: 50, nombre: 'otro.pdf', archivo_url: 'http://api.test/media/otro.pdf' },
    ]);
    const turnos = http.expectOne((r) => r.url === `${API}/turnos/turnos/`);
    expect(turnos.request.params.get('estado')).toBe('FINALIZADO');
    turnos.flush([{ id: 301, especialidad_nombre: 'Traumatología' }]);
  }

  it('arma los informes con la especialidad del turno y sus adjuntos; los pendientes no aparecen [R10]', async () => {
    const lista = firstValueFrom(repo.listar());
    responder();
    expect(await lista).toEqual([
      {
        id: 6, turnoId: 301, fecha: '2026-10-29', profesional: 'Pablo Sánchez', especialidad: 'Traumatología',
        diagnostico: 'Tendinitis', planTratamiento: 'Kinesiología', indicaciones: null,
        adjuntos: [{ id: 3, titulo: 'orden.pdf', url: 'http://api.test/media/orden.pdf' }],
      },
    ]);
  });

  it('obtener devuelve null si no existe o está pendiente', async () => {
    const pendiente = firstValueFrom(repo.obtener(8));
    responder();
    expect(await pendiente).toBeNull();
  });

  it('descarga el adjunto como Blob', async () => {
    const archivo = firstValueFrom(repo.descargar({ id: 3, titulo: 'orden.pdf', url: 'http://api.test/media/orden.pdf' }));
    const req = http.expectOne('http://api.test/media/orden.pdf');
    expect(req.request.responseType).toBe('blob');
    req.flush(new Blob(['%PDF']));
    expect(await archivo).toBeInstanceOf(Blob);
  });

  it('lista los estudios del paciente [R10, R20]', async () => {
    const estudios = firstValueFrom(repo.listarEstudios());
    http.expectOne(`${API}/clinicos/estudios/`).flush([
      { id: 5, tipo_estudio: 3, tipo_estudio_nombre: 'Glucemia', paciente: 8, turno: 90, fecha_solicitud: '2026-11-02T08:00:00-03:00', estado: 'SOLICITADO' },
    ]);
    expect(await estudios).toEqual([{ id: 5, nombre: 'Glucemia', fechaSolicitud: '2026-11-02', estado: 'SOLICITADO' }]);
  });
});
