import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../../../../core/config/tokens';
import { CatalogoHttpRepository } from './catalogo.repository.http';

const API = 'http://api.test/api';

describe('CatalogoHttpRepository', () => {
  let repo: CatalogoHttpRepository;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CatalogoHttpRepository, provideHttpClient(), provideHttpClientTesting(), { provide: API_URL, useValue: API }],
    });
    repo = TestBed.inject(CatalogoHttpRepository);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('trae las especialidades [R19]', async () => {
    const resultado = firstValueFrom(repo.getEspecialidades());
    http.expectOne(`${API}/profesionales/especialidades/`).flush([
      { id: 2, nombre: 'Cardiología', descripcion: 'Corazón' },
      { id: 9, nombre: 'Nueva', descripcion: null },
    ]);
    expect(await resultado).toEqual([
      { id: 2, nombre: 'Cardiología', descripcion: 'Corazón' },
      { id: 9, nombre: 'Nueva', descripcion: '' },
    ]);
  });

  it('trae los tipos de estudio [R20]', async () => {
    const resultado = firstValueFrom(repo.getTiposEstudio());
    http.expectOne(`${API}/clinicos/tipos-estudio/`).flush([{ id: 3, nombre: 'Glucemia', descripcion: null, duracion_min: 10, activo: true }]);
    expect(await resultado).toEqual([{ id: 3, nombre: 'Glucemia', descripcion: '', duracionMin: 10 }]);
  });

  it('con fecha pide solo los profesionales con turnos libres ese día [R05]', async () => {
    const resultado = firstValueFrom(repo.getProfesionales('2026-11-02'));
    http
      .expectOne(`${API}/turnos/turnos/profesionales-disponibles/?fecha=2026-11-02`)
      .flush({ fecha: '2026-11-02', cantidad: 1, profesionales: [{ id: 4, usuario: { id: 6, nombre: 'Laura', apellido: 'Fernández' }, especialidades: [] }] });
    expect(await resultado).toEqual([{ id: 4, nombre: 'Laura', apellido: 'Fernández', especialidades: [] }]);
  });

  it('aplana el profesional con todas sus especialidades [R04]', async () => {
    const resultado = firstValueFrom(repo.getProfesionales());
    http.expectOne(`${API}/profesionales/profesionales/`).flush([
      {
        id: 4,
        usuario: { id: 6, nombre: 'Laura', apellido: 'Fernández', login: 'lf@example.com', foto: null },
        especialidades: [
          { id: 4, especialidad: { id: 5, nombre: 'Pediatría', descripcion: '' } },
          { id: 5, especialidad: { id: 6, nombre: 'Clínica médica', descripcion: '' } },
        ],
        horarios: [],
        matriculas: [],
      },
    ]);
    expect(await resultado).toEqual([
      { id: 4, nombre: 'Laura', apellido: 'Fernández', especialidades: [{ id: 5, nombre: 'Pediatría' }, { id: 6, nombre: 'Clínica médica' }] },
    ]);
  });
});
