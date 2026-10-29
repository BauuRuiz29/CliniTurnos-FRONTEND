import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../../../../core/config/tokens';
import { API, consultaDto } from '../../testing/api-falsa';
import { AtencionHttpRepository } from './atencion.repository.http';

describe('AtencionHttpRepository', () => {
  let repo: AtencionHttpRepository;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AtencionHttpRepository, provideHttpClient(), provideHttpClientTesting(), { provide: API_URL, useValue: API }],
    });
    repo = TestBed.inject(AtencionHttpRepository);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function documentos(consultaId: number, docs: unknown[]) {
    http.expectOne((r) => r.url === `${API}/clinicos/documentos/` && r.params.get('consulta') === String(consultaId)).flush(docs);
  }

  it('busca la consulta del turno y trae sus adjuntos; null si no se inició', async () => {
    const informe = firstValueFrom(repo.obtener(13));
    http.expectOne(`${API}/clinicos/consultas/`).flush([consultaDto({ diagnostico: 'Gripe' })]);
    documentos(3, [{ id: 9, nombre: 'ecg.pdf', archivo_url: 'http://api.test/media/ecg.pdf' }]);
    expect(await informe).toEqual({
      id: 3, turnoId: 13, diagnostico: 'Gripe', planTratamiento: null, indicaciones: null, finalizada: false,
      adjuntos: [{ id: 9, titulo: 'ecg.pdf', url: 'http://api.test/media/ecg.pdf' }],
    });

    const sinIniciar = firstValueFrom(repo.obtener(50));
    http.expectOne(`${API}/clinicos/consultas/`).flush([consultaDto()]);
    expect(await sinIniciar).toBeNull();
  });

  it('guardar manda los textos por PATCH (sirve también con la consulta ya cerrada) [R13]', async () => {
    const informe = firstValueFrom(repo.guardar(3, { diagnostico: 'Gripe', planTratamiento: '', indicaciones: 'Reposo' }));
    const patch = http.expectOne(`${API}/clinicos/consultas/3/`);
    expect(patch.request.method).toBe('PATCH');
    expect(patch.request.body).toEqual({ diagnostico: 'Gripe', plan_tratamiento: null, indicaciones: 'Reposo' });
    patch.flush(consultaDto({ diagnostico: 'Gripe', indicaciones: 'Reposo', estado: 'FINALIZADA' }));
    documentos(3, []);
    expect(await informe).toEqual(expect.objectContaining({ diagnostico: 'Gripe', finalizada: true }));
  });

  it('cerrar finaliza la consulta (y el turno) aunque no tenga informe', async () => {
    const informe = firstValueFrom(repo.cerrar(3));
    const post = http.expectOne(`${API}/clinicos/consultas/3/finalizar/`);
    expect(post.request.method).toBe('POST');
    post.flush({ mensaje: 'ok', consulta: consultaDto({ estado: 'FINALIZADA' }) });
    documentos(3, []);
    expect(await informe).toEqual(expect.objectContaining({ diagnostico: null, finalizada: true }));
  });

  it('descarga el adjunto como Blob desde su archivo_url', async () => {
    const archivo = firstValueFrom(repo.descargar({ id: 9, titulo: 'ecg.pdf', url: 'http://api.test/media/ecg.pdf' }));
    const req = http.expectOne('http://api.test/media/ecg.pdf');
    expect(req.request.responseType).toBe('blob');
    req.flush(new Blob(['%PDF']));
    expect(await archivo).toBeInstanceOf(Blob);
  });

  it('adjunta como multipart asociado a la consulta y al turno', async () => {
    const archivo = new File(['%PDF'], 'ecg.pdf', { type: 'application/pdf' });
    const adjunto = firstValueFrom(repo.adjuntar(3, archivo));
    http.expectOne(`${API}/clinicos/consultas/3/`).flush(consultaDto());
    const post = http.expectOne(`${API}/clinicos/documentos/`);
    const datos = post.request.body as FormData;
    expect([datos.get('consulta'), datos.get('turno'), datos.get('nombre')]).toEqual(['3', '13', 'ecg.pdf']);
    expect(datos.get('archivo')).toBeInstanceOf(File);
    post.flush({ id: 9, nombre: 'ecg.pdf', archivo_url: 'http://api.test/media/ecg.pdf' });
    expect(await adjunto).toEqual({ id: 9, titulo: 'ecg.pdf', url: 'http://api.test/media/ecg.pdf' });
  });

  it('quitar un adjunto lo borra', async () => {
    const r = firstValueFrom(repo.quitarAdjunto(3, 9));
    const req = http.expectOne(`${API}/clinicos/documentos/9/`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
    await r;
  });
});
