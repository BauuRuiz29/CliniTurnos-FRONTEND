import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../config/tokens';
import { NotificacionesRepository } from './notificaciones';

const API = 'http://api.test/api';

describe('NotificacionesRepository', () => {
  it('descarta las CANCELADA y usa fecha_programada si no se envió', async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: API_URL, useValue: API }],
    });
    const http = TestBed.inject(HttpTestingController);
    const resultado = firstValueFrom(TestBed.inject(NotificacionesRepository).listar());
    const base = { tipo: 'RESERVA', asunto: 'a', mensaje: 'm', fecha_programada: '2026-10-01T10:00:00Z' };
    http.expectOne(`${API}/notificaciones/notificaciones/`).flush([
      { ...base, id: 1, turno: 7, estado: 'ENVIADA', fecha_envio: '2026-10-01T10:05:00Z' },
      { ...base, id: 2, turno: null, estado: 'FALLIDA', fecha_envio: null },
      { ...base, id: 3, turno: null, estado: 'CANCELADA', fecha_envio: null },
    ]);
    expect(await resultado).toEqual([
      { id: 1, turnoId: 7, tipo: 'RESERVA', asunto: 'a', mensaje: 'm', fecha: '2026-10-01T10:05:00Z' },
      { id: 2, turnoId: null, tipo: 'RESERVA', asunto: 'a', mensaje: 'm', fecha: '2026-10-01T10:00:00Z' },
    ]);
    http.verify();
  });
});
