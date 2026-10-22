// `notificaciones.tipo` es varchar en la DB: estos son los tipos que le llegan al paciente.
export const TipoNotificacion = {
  TURNO_RESERVADO: 'TURNO_RESERVADO',
  TURNO_CANCELADO: 'TURNO_CANCELADO',
  TURNO_REPROGRAMADO: 'TURNO_REPROGRAMADO',
  RECORDATORIO_TURNO: 'RECORDATORIO_TURNO',
  INFORME_DISPONIBLE: 'INFORME_DISPONIBLE',
} as const;
export type TipoNotificacion = (typeof TipoNotificacion)[keyof typeof TipoNotificacion];

// Fila de la tabla `notificaciones` del usuario logueado.
export interface NotificacionPaciente {
  id: number; // notificacion_id
  turnoId: number | null; // turno_id
  tipo: TipoNotificacion;
  asunto: string;
  mensaje: string;
  fechaEnvio: string; // fecha_envio, ISO. Solo llegan ENVIADA, que siempre la tiene.
}
