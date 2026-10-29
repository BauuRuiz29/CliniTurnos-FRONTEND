import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import type { Disponibilidad } from '../../../../core/models/disponibilidad';
import { ReservarTurnoHttpRepository } from './reservar-turno.repository.http';

// Datos propios de esta pantalla: no depende de `catalogo/`.
export interface ProfesionalReserva {
  id: number;
  nombre: string;
  apellido: string;
  especialidades: { id: number; nombre: string }[];
}

// Tipos compartidos con el área profesional (reprogramar también elige franja).
export type { DiaSemana, Disponibilidad, FechaBloqueada, HorarioMedico, Slot } from '../../../../core/models/disponibilidad';

// Reservar es un UPDATE del slot pregenerado (DISPONIBLE → RESERVADO), no un INSERT.
// El paciente no viaja: el back lo toma de la sesión (JWT), y la obra social sale de pacientes.obra_social_id.
export interface SolicitudReserva {
  turnoId: number;
  comentario: string | null; // turnos.comentario, varchar(255). Al reprogramar el back no lo recibe.
  /** Reprogramar = cancelar este turno + reservar el nuevo [AGENTS §4.2]; el back lo hace en una sola operación. */
  reprogramaTurnoId: number | null;
}

export interface TurnoReservado {
  turnoId: number;
  fecha: string; // yyyy-MM-dd
  horaInicio: string; // HH:mm
  profesional: string; // vacío en turnos de estudio
  especialidad: string | null; // la que tenga el slot en el back
  estudio?: string; // nombre del tipo de estudio, solo en turnos de estudio
}

// Fila de `tipos_estudio` que se está reservando [R20].
export interface TipoEstudioReserva {
  id: number;
  nombre: string;
  descripcion: string;
}

// El back crea el registro de `estudios` (SOLICITADO, con paciente y turno) al reservar con tipo_estudio_id.
export interface SolicitudReservaEstudio {
  turnoId: number;
  tipoEstudioId: number;
  comentario: string | null;
}

/** El slot ya no está DISPONIBLE (otro paciente lo reservó o se bloqueó). */
export class SlotNoDisponibleError extends Error {
  constructor() {
    super('El horario elegido ya no está disponible.');
  }
}

/** Reserva de turno de consulta con un profesional [R06, CU04] o de estudio [R20]. */
@Injectable({ providedIn: 'root', useClass: ReservarTurnoHttpRepository })
export abstract class ReservarTurnoRepository {
  abstract obtenerProfesional(id: number): Observable<ProfesionalReserva | null>;
  /** Sin caché [Rnf 08]: cada llamada trae el estado actual. */
  abstract obtenerDisponibilidad(profesionalId: number): Observable<Disponibilidad>;
  /** Falla con `SlotNoDisponibleError` si el slot ya no está DISPONIBLE. */
  abstract reservar(solicitud: SolicitudReserva): Observable<TurnoReservado>;

  /** null si no existe o no está activo [R20]. */
  abstract obtenerTipoEstudio(id: number): Observable<TipoEstudioReserva | null>;
  /** Slots ESTUDIO libres: no tienen profesional ni horarios_medico [Rnf 08]. */
  abstract obtenerDisponibilidadEstudios(): Observable<Disponibilidad>;
  /** Falla con `SlotNoDisponibleError` si el slot ya no está DISPONIBLE. */
  abstract reservarEstudio(solicitud: SolicitudReservaEstudio): Observable<TurnoReservado>;
}
