import { EstadoTurno } from './enums';

// Transiciones permitidas del turno [AGENTS §4.2]. Reprogramar no es un estado: es cancelar + reservar otro.
export const TRANSICIONES_TURNO: Record<EstadoTurno, readonly EstadoTurno[]> = {
  DISPONIBLE: [EstadoTurno.RESERVADO],
  BLOQUEADO: [],
  RESERVADO: [EstadoTurno.EN_CURSO, EstadoTurno.AUSENTE, EstadoTurno.CANCELADO],
  EN_CURSO: [EstadoTurno.FINALIZADO],
  FINALIZADO: [],
  CANCELADO: [EstadoTurno.DISPONIBLE],
  AUSENTE: [],
};

/** Texto para mostrar el estado en pantalla. */
export const ESTADO_TURNO_TEXTO: Record<EstadoTurno, string> = {
  DISPONIBLE: 'Disponible',
  BLOQUEADO: 'Bloqueado',
  RESERVADO: 'Reservado',
  EN_CURSO: 'En curso',
  FINALIZADO: 'Finalizado',
  CANCELADO: 'Cancelado',
  AUSENTE: 'Ausente',
};

export function puedeTransicionar(desde: EstadoTurno, hasta: EstadoTurno): boolean {
  return TRANSICIONES_TURNO[desde].includes(hasta);
}

/** Cancelar o reprogramar solo hasta `ventanaHoras` antes del inicio [R08, R12]. */
export function dentroDeVentanaCancelacion(fecha: string, horaInicio: string, ahora: Date, ventanaHoras: number): boolean {
  const [a, m, d] = fecha.split('-').map(Number);
  const [h, min] = horaInicio.split(':').map(Number);
  return new Date(a, m - 1, d, h, min).getTime() - ahora.getTime() >= ventanaHoras * 3_600_000;
}
