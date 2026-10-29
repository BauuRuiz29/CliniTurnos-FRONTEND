import { Injectable, inject } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { DEMORA_MS, ProfesionalMockDb } from '../../data-access/profesional.mock-db';
import type { NotificacionProfesional, NotificacionesRepository } from './notificaciones.repository';

@Injectable()
export class NotificacionesMockRepository implements NotificacionesRepository {
  private readonly db = inject(ProfesionalMockDb);

  listar(): Observable<NotificacionProfesional[]> {
    return of(this.db.notificaciones.map((n) => ({ ...n }))).pipe(delay(DEMORA_MS));
  }

  marcarLeida(id: number): Observable<void> {
    const n = this.db.notificaciones.find((x) => x.id === id);
    if (n) n.leida = true;
    return of(undefined).pipe(delay(DEMORA_MS));
  }
}
