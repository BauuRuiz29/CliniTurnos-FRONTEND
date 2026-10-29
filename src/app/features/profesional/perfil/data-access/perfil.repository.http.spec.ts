import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../../../../core/config/tokens';
import { API } from '../../testing/api-falsa';
import { PerfilHttpRepository } from './perfil.repository.http';

describe('PerfilHttpRepository', () => {
  it('arma el perfil con el profesional de la sesión, sus especialidades y matrículas activas', async () => {
    TestBed.configureTestingModule({
      providers: [PerfilHttpRepository, provideHttpClient(), provideHttpClientTesting(), { provide: API_URL, useValue: API }],
    });
    const repo = TestBed.inject(PerfilHttpRepository);
    const http = TestBed.inject(HttpTestingController);

    const perfil = firstValueFrom(repo.obtener());
    http.expectOne(`${API}/users/me/`).flush({ id: 6, genero: 'FEMENINO' });
    http.expectOne(`${API}/profesionales/profesionales/`).flush([
      {
        id: 4,
        usuario: { id: 6, nombre: 'Laura', apellido: 'Fernández', login: 'lf@example.com', foto: null },
        especialidades: [{ especialidad: { id: 5, nombre: 'Pediatría' } }, { especialidad: { id: 6, nombre: 'Clínica médica' } }],
        matriculas: [
          { numero_matricula: 'MN 456789', tipo_matricula: 'NACIONAL', jurisdiccion: 'Nación', activa: true },
          { numero_matricula: 'MP 1', tipo_matricula: 'PROVINCIAL', jurisdiccion: null, activa: false },
        ],
      },
    ]);

    expect(await perfil).toEqual({
      nombre: 'Laura', apellido: 'Fernández', foto: null, genero: 'FEMENINO',
      especialidades: ['Pediatría', 'Clínica médica'], matriculas: ['MN 456789 · Nacional · Nación'], correo: 'lf@example.com',
    });
    http.verify();
  });
});
