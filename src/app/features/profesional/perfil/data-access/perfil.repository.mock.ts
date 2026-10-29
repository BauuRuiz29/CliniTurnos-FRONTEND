import { Injectable, inject } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { DEMORA_MS, ProfesionalMockDb } from '../../data-access/profesional.mock-db';
import type { PerfilProfesional, PerfilRepository } from './perfil.repository';

@Injectable()
export class PerfilMockRepository implements PerfilRepository {
  private readonly db = inject(ProfesionalMockDb);

  obtener(): Observable<PerfilProfesional> {
    return of({ ...this.db.perfil }).pipe(delay(DEMORA_MS));
  }
}
