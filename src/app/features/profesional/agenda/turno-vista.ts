import { EstadoTurno } from '../../../core/models/enums';
import { ESTADO_TURNO_TEXTO } from '../../../core/models/turno-estado';
import type { PacienteTurno, TurnoProfesional } from './data-access/agenda.repository';

// Cómo se muestra un turno en las listas del profesional (inicio y agenda).

/** Turnos que todavía requieren algo del profesional. */
export const ESTADOS_PENDIENTES: readonly EstadoTurno[] = [EstadoTurno.RESERVADO, EstadoTurno.EN_CURSO];

/** Pendiente para el profesional: por atender, en curso, o cerrado con el informe sin cargar. */
export function requiereAccion(t: TurnoProfesional): boolean {
  return ESTADOS_PENDIENTES.includes(t.estado) || t.informePendiente;
}

/** Informe por cargar: atención en curso o turno cerrado sin informe. */
export function informePorCargar(t: TurnoProfesional): boolean {
  return t.estado === EstadoTurno.EN_CURSO || t.informePendiente;
}

export interface AccionTurno {
  texto: string;
  ruta: (string | number)[];
  variante: 'detalle' | 'informe' | 'ver-informe';
}

/** Acción principal de la fila según el estado (prototipo: Detalle / Completar informe / Ver informe). */
export function accionTurno(t: TurnoProfesional): AccionTurno {
  switch (t.estado) {
    case EstadoTurno.EN_CURSO:
      return { texto: 'Completar informe', ruta: ['/profesional/turnos', t.id, 'informe'], variante: 'informe' };
    case EstadoTurno.FINALIZADO:
      return t.informePendiente
        ? { texto: 'Completar informe', ruta: ['/profesional/turnos', t.id, 'informe'], variante: 'informe' }
        : { texto: 'Ver informe', ruta: ['/profesional/turnos', t.id, 'informe'], variante: 'ver-informe' };
    default:
      return { texto: 'Detalle', ruta: ['/profesional/turnos', t.id], variante: 'detalle' };
  }
}

export function textoEstado(estado: EstadoTurno): string {
  return ESTADO_TURNO_TEXTO[estado];
}

/** Modificador CSS del badge: `status--en-curso`, etc. */
export function claseEstado(estado: EstadoTurno): string {
  return `status status--${estado.toLowerCase().replace('_', '-')}`;
}

export function nombrePaciente(p: PacienteTurno): string {
  return `${p.nombre} ${p.apellido}`;
}

export function inicialesPaciente(p: { nombre: string; apellido: string }): string {
  return `${p.nombre[0]}${p.apellido[0]}`.toUpperCase();
}

export const claveTurno = (t: TurnoProfesional) => `${t.fecha}T${t.horaInicio}`;

export function mesCorto(iso: string): string {
  const [a, m] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat('es-AR', { month: 'short' }).format(new Date(a, m - 1, 1)).toUpperCase();
}
