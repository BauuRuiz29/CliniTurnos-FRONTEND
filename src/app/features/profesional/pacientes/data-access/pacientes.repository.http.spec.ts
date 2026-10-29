import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../../../../core/config/tokens';
import { API, pacienteDto, turnoDto } from '../../testing/api-falsa';
import { PacientesHttpRepository } from './pacientes.repository.http';

describe('PacientesHttpRepository', () => {
  it('arma los pacientes con los de sus turnos, con última consulta y último turno [R14]', async () => {
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
      { id: 8, nombre: 'Ana', apellido: 'Álvarez', numIdentificacion: '44976577', telefono: '11 4497 6577', ultimaConsulta: '2026-10-01', ultimoTurnoId: 2 },
    ]);
    http.verify();
  });
});
