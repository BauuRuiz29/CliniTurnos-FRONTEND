import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../../../core/config/tokens';
import type { ObraSocial, ObrasSocialesRepository } from './obras-sociales.repository';

/** GET /pacientes/obras-sociales/: ya viene como { id, nombre }. */
@Injectable()
export class ObrasSocialesHttpRepository implements ObrasSocialesRepository {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  listar(): Observable<ObraSocial[]> {
    return this.http.get<ObraSocial[]>(`${this.apiUrl}/pacientes/obras-sociales/`);
  }
}
