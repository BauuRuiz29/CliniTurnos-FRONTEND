import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../../../../core/config/tokens';
import { API, pacienteDto, turnoDto } from '../../testing/api-falsa';
import { PacientesHttpRepository } from './pacientes.repository.http';

describe('PacientesHttpRepository', () => {
  it('arma los pacientes con los de sus turnos, con su última consulta [R14]', async () => {
    TestBed.configureTestingModule({
      providers: [PacientesHttpRepository, provideHttpClient(), provideHttpClientTesting(), { provide: API_URL, useValue: API }],
    });
    const repo = TestBed.inject(PacientesHttpRepository);
    const http = TestBed.inject(HttpTestingController);

    const lista = firstValueFrom(repo.listar());
    http.expectOne(`${API}/turnos/turnos/`).flush([
      turnoDto({ id: 1, fecha: '2026-10-01', estado: 'FINALIZADO' }),
      turnoDto({ id: 2, fecha: '2026-11-03', estado: 'RESERVADO' }),
      turnoDto({ id: 3, paciente: null, estado: 'DISPONIBLE' }),
    ]);
    // El listado del back trae a todos los pacientes: solo quedan los de sus turnos.
    http.expectOne(`${API}/pacientes/pacientes/`).flush([pacienteDto(), pacienteDto({ id: 99, num_identificacion: '1' })]);

    expect(await lista).toEqual([
      { id: 8, nombre: 'Ana', apellido: 'Álvarez', numIdentificacion: '44976577', telefono: '11 4497 6577', ultimaConsulta: '2026-10-01' },
    ]);
    http.verify();
  });

  it('guarda alergias y medicación: alta, cambio, borrado y suspensión [R03]', async () => {
    TestBed.configureTestingModule({
      providers: [PacientesHttpRepository, provideHttpClient(), provideHttpClientTesting(), { provide: API_URL, useValue: API }],
    });
    const repo = TestBed.inject(PacientesHttpRepository);
    const http = TestBed.inject(HttpTestingController);
    const historia = {
      id: 5,
      paciente: 8,
      alergias: [{ id: 1, descripcion: 'Penicilina', severidad: 'GRAVE' }, { id: 2, descripcion: 'Polen', severidad: null }],
      medicaciones: [
        { id: 3, medicamento: 'Levotiroxina', dosis: '50 mg', frecuencia: null, activo: true },
        { id: 4, medicamento: 'Insulina', dosis: null, frecuencia: null, activo: true },
        { id: 9, medicamento: 'Vieja', dosis: null, frecuencia: null, activo: false },
      ],
    };

    const perfil = firstValueFrom(repo.perfil(8));
    http.expectOne(`${API}/pacientes/pacientes/8/`).flush(pacienteDto());
    http.expectOne(`${API}/clinicos/historias-clinicas/`).flush([historia]);
    const antes = await perfil;
    expect(antes.historiaId).toBe(5);
    expect(antes.medicaciones.map((m) => m.id)).toEqual([3, 4]);

    void firstValueFrom(
      repo.guardarHistoria(
        antes,
        [{ id: 1, descripcion: 'Penicilina', severidad: 'GRAVE' }, { id: null, descripcion: 'Maní', severidad: 'LEVE' }],
        [{ id: 3, medicamento: 'Levotiroxina', dosis: '75 mg', frecuencia: null }],
      ),
    );
    expect(http.expectOne({ method: 'POST', url: `${API}/clinicos/alergias/` }).request.body).toMatchObject({ historia: 5, descripcion: 'Maní', severidad: 'LEVE' });
    http.expectOne({ method: 'DELETE', url: `${API}/clinicos/alergias/2/` });
    expect(http.expectOne({ method: 'PATCH', url: `${API}/clinicos/medicaciones/3/` }).request.body).toEqual({ medicamento: 'Levotiroxina', dosis: '75 mg', frecuencia: null });
    expect(http.expectOne({ method: 'PATCH', url: `${API}/clinicos/medicaciones/4/` }).request.body).toMatchObject({ activo: false });
    // Sin cambios no hay pedido para la alergia 1.
    http.expectNone(`${API}/clinicos/alergias/1/`);
    http.verify();
  });
});
