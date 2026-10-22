import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import type { NotificacionPaciente } from './notificaciones.models';
import { NotificacionesMockRepository } from './notificaciones.repository.mock';

/** Notificaciones del paciente [R09, R17]. El back solo devuelve las ENVIADA del usuario de la sesión [Rnf 01]. */
@Injectable({ providedIn: 'root', useClass: NotificacionesMockRepository })
export abstract class NotificacionesRepository {
  abstract listar(): Observable<NotificacionPaciente[]>;
}
