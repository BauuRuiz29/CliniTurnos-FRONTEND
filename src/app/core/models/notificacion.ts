// `notificaciones.tipo` es varchar en la DB: estos son los que crea el back.
// RECORDATORIO solo le llega al paciente [R09].
export const TipoNotificacion = {
  RESERVA: 'RESERVA',
  CANCELACION: 'CANCELACION',
  REPROGRAMACION: 'REPROGRAMACION',
  RECORDATORIO: 'RECORDATORIO',
} as const;
export type TipoNotificacion = (typeof TipoNotificacion)[keyof typeof TipoNotificacion];

// Fila de la tabla `notificaciones` del usuario logueado.
export interface Notificacion {
  id: number; // notificacion_id
  turnoId: number | null; // turno_id
  tipo: TipoNotificacion;
  asunto: string;
  mensaje: string;
  fecha: string; // fecha_envio o, si no se envió, fecha_programada. ISO.
}
