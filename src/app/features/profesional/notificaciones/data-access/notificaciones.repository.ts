import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificacionesMockRepository } from './notificaciones.repository.mock';

// `notificaciones.tipo` es varchar en la DB: estos son los que le llegan al profesional [R15, R18].
export const TipoNotificacionProfesional = {
  TURNO_ASIGNADO: 'TURNO_ASIGNADO',
  TURNO_REPROGRAMADO: 'TURNO_REPROGRAMADO',
  TURNO_CANCELADO: 'TURNO_CANCELADO',
  INFORME_PENDIENTE: 'INFORME_PENDIENTE',
} as const;
export type TipoNotificacionProfesional = (typeof TipoNotificacionProfesional)[keyof typeof TipoNotificacionProfesional];

export interface NotificacionProfesional {
  id: number; // notificacion_id
  turnoId: number | null;
  tipo: TipoNotificacionProfesional;
  asunto: string;
  mensaje: string;
  fechaEnvio: string; // ISO
  /** TODO: la tabla `notificaciones` no tiene "leída"; confirmar con el back cómo se guarda. */
  leida: boolean;
}

/** Notificaciones del profesional [R15, R18]. Solo las del usuario de la sesión [Rnf 01]. */
@Injectable({ providedIn: 'root', useClass: NotificacionesMockRepository })
export abstract class NotificacionesRepository {
  abstract listar(): Observable<NotificacionProfesional[]>;
  abstract marcarLeida(id: number): Observable<void>;
}
