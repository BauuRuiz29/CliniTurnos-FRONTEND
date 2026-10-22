import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { NotificacionPaciente, TipoNotificacion } from './notificaciones.models';
import type { NotificacionesRepository } from './notificaciones.repository';

//#region DATOS FORZADOS
// TODO: reemplazar por el back. Los turnoId coinciden con el mock de turnos.
const DEMORA_MS = 200;
const haceHoras = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

const NOTIFICACIONES: NotificacionPaciente[] = [
  { id: 1, turnoId: 2, tipo: TipoNotificacion.RECORDATORIO_TURNO, asunto: 'Recordatorio de turno', mensaje: 'Mañana tenés turno con Dra. María López (Dermatología) en Clínica Norte.', fechaEnvio: haceHoras(1) },
  { id: 2, turnoId: 1, tipo: TipoNotificacion.TURNO_RESERVADO, asunto: 'Turno reservado', mensaje: 'Reservaste un turno con Dr. Juan García (Cardiología) en Clínica Centro.', fechaEnvio: haceHoras(5) },
  { id: 3, turnoId: 4, tipo: TipoNotificacion.INFORME_DISPONIBLE, asunto: 'Informe médico disponible', mensaje: 'Dr. Pablo Sánchez cargó el informe de tu consulta de Traumatología.', fechaEnvio: haceHoras(30) },
  { id: 4, turnoId: 3, tipo: TipoNotificacion.TURNO_REPROGRAMADO, asunto: 'Turno reprogramado', mensaje: 'Dr. Pablo Sánchez reprogramó tu turno de Traumatología.', fechaEnvio: haceHoras(72) },
  { id: 5, turnoId: 5, tipo: TipoNotificacion.TURNO_CANCELADO, asunto: 'Turno cancelado', mensaje: 'Se canceló tu turno con Dra. María López (Dermatología).', fechaEnvio: haceHoras(800) },
];
//#endregion

@Injectable()
export class NotificacionesMockRepository implements NotificacionesRepository {
  listar(): Observable<NotificacionPaciente[]> {
    return of(NOTIFICACIONES.map((n) => ({ ...n }))).pipe(delay(DEMORA_MS));
  }
}
