import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../../../core/config/tokens';
import { Genero, TipoDocumento } from '../../../core/models/enums';
import { RegistroInvalidoError } from './registro.errores';
import { RegistroHttpRepository } from './registro.repository.http';

const DATOS = {
  nombre: ' Juan ', apellido: 'Pérez', genero: Genero.MASCULINO, tipoIdentificacion: TipoDocumento.DNI, numIdentificacion: '30123456',
  fechaNacimiento: '1990-05-10', telefono: '+54 11 1234 5678', correo: 'juan@example.com', login: 'juanperez', password: 'secreta123',
};

describe('RegistroHttpRepository', () => {
  let repo: RegistroHttpRepository;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RegistroHttpRepository, provideHttpClient(), provideHttpClientTesting(), { provide: API_URL, useValue: 'http://api.test/api' }],
    });
    repo = TestBed.inject(RegistroHttpRepository);
    http = TestBed.inject(HttpTestingController);
  });

  it('manda los datos en snake_case al endpoint público de registro [R01]', async () => {
    const resultado = firstValueFrom(repo.registrar(DATOS));
    const req = http.expectOne('http://api.test/api/users/registro/');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      login: 'juanperez', password: 'secreta123', nombre: 'Juan', apellido: 'Pérez', genero: 'MASCULINO',
      fecha_nacimiento: '1990-05-10', telefono: '+54 11 1234 5678', correo: 'juan@example.com',
      tipo_identificacion: 'DNI', num_identificacion: '30123456',
    });
    req.flush({ id: 1 }, { status: 201, statusText: 'Created' });
    await expect(resultado).resolves.toBeUndefined();
  });

  it('traduce los errores 400 de DRF a campos del formulario', async () => {
    const resultado = firstValueFrom(repo.registrar(DATOS));
    http.expectOne('http://api.test/api/users/registro/').flush(
      { login: ['Este login ya está en uso.'], num_identificacion: ['Este documento ya está registrado.'], non_field_errors: ['Algo general'] },
      { status: 400, statusText: 'Bad Request' },
    );
    const error = await resultado.catch((e: unknown) => e);
    expect(error).toBeInstanceOf(RegistroInvalidoError);
    expect((error as RegistroInvalidoError).campos).toEqual({ login: 'Este login ya está en uso.', numIdentificacion: 'Este documento ya está registrado.' });
    expect((error as RegistroInvalidoError).generales).toEqual(['Algo general']);
  });
});
