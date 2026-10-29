import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../../../../core/config/tokens';
import { MisDatosHttpRepository } from './mis-datos.repository.http';

const API = 'http://api.test/api';

const ME = {
  id: 14, login: 'ana@example.com', nombre: 'Ana', apellido: 'Álvarez', genero: 'FEMENINO', foto: null, estado: 'ACTIVO', roles: ['PACIENTE'],
  paciente: {
    id: 8, fecha_nacimiento: '1992-03-04', telefono: null, correo: 'ana@example.com', tipo_identificacion: 'DNI', num_identificacion: '35111222',
    grupo_sanguineo: 'O+', contacto_emergencia_nombre: null, contacto_emergencia_numero: null, obra_social_id: 4, obra_social_nombre: 'Galeno',
  },
};

const HISTORIA = {
  id: 8,
  alergias: [{ id: 3, historia: 8, fecha_registro: '2026-10-28T20:53:36Z', descripcion: 'Látex', severidad: 'MODERADA' }],
  medicaciones: [
    { id: 5, historia: 8, medicamento: 'Levotiroxina', dosis: '50 mcg', frecuencia: null, fecha_desde: null, fecha_hasta: null, motivo: null, activo: true },
    { id: 6, historia: 8, medicamento: 'Amoxicilina', dosis: '500 mg', frecuencia: 'Cada 8 h', fecha_desde: null, fecha_hasta: null, motivo: null, activo: false },
  ],
};

describe('MisDatosHttpRepository', () => {
  let repo: MisDatosHttpRepository;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MisDatosHttpRepository, provideHttpClient(), provideHttpClientTesting(), { provide: API_URL, useValue: API }],
    });
    repo = TestBed.inject(MisDatosHttpRepository);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function responder(historias: unknown[] = [HISTORIA]) {
    http.expectOne(`${API}/users/me/`).flush(ME);
    http.expectOne(`${API}/clinicos/historias-clinicas/`).flush(historias);
  }

  it('arma los datos con /users/me/ y la historia clínica, solo con medicación activa [R03]', async () => {
    const datos = firstValueFrom(repo.obtener());
    responder();
    expect(await datos).toEqual({
      nombre: 'Ana', apellido: 'Álvarez', genero: 'FEMENINO', tipoIdentificacion: 'DNI', numIdentificacion: '35111222',
      fechaNacimiento: '1992-03-04', telefono: '', correo: 'ana@example.com', login: 'ana@example.com', obraSocialId: 4,
      grupoSanguineo: 'O+', contactoEmergenciaNombre: null, contactoEmergenciaNumero: null,
      alergias: [{ id: 3, descripcion: 'Látex', severidad: 'MODERADA' }],
      medicaciones: [{ id: 5, medicamento: 'Levotiroxina', dosis: '50 mcg', frecuencia: null }],
    });
  });

  it('sin historia clínica las listas quedan vacías', async () => {
    const datos = firstValueFrom(repo.obtener());
    responder([]);
    expect((await datos).alergias).toEqual([]);
  });

  it('guarda con PATCH a /users/me/ anidando los datos del paciente y vuelve a leer', async () => {
    const guardado = firstValueFrom(
      repo.guardar({
        nombre: ' Ana ', apellido: 'Álvarez', genero: 'FEMENINO', fechaNacimiento: '1992-03-04', telefono: '11 5555 5555',
        correo: 'ana@example.com', obraSocialId: null, grupoSanguineo: null, contactoEmergenciaNombre: 'Luis', contactoEmergenciaNumero: null,
      }),
    );
    const patch = http.expectOne(`${API}/users/me/`);
    expect(patch.request.method).toBe('PATCH');
    expect(patch.request.body).toEqual({
      nombre: 'Ana', apellido: 'Álvarez', genero: 'FEMENINO',
      paciente: {
        fecha_nacimiento: '1992-03-04', telefono: '11 5555 5555', correo: 'ana@example.com', grupo_sanguineo: null,
        contacto_emergencia_nombre: 'Luis', contacto_emergencia_numero: null, obra_social_id: null,
      },
    });
    patch.flush(ME);
    responder();
    expect((await guardado).nombre).toBe('Ana');
  });
});
