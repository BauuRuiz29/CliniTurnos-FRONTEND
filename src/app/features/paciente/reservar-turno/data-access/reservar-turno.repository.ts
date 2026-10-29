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
  profesional: string;
  especialidad: string | null; // la que tenga el slot en el back
}

/** El slot ya no está DISPONIBLE (otro paciente lo reservó o se bloqueó). */
export class SlotNoDisponibleError extends Error {
  constructor() {
    super('El horario elegido ya no está disponible.');
  }
}

/** Reserva de turno de consulta con un profesional [R06, CU04]. */
@Injectable({ providedIn: 'root', useClass: ReservarTurnoHttpRepository })
export abstract class ReservarTurnoRepository {
  abstract obtenerProfesional(id: number): Observable<ProfesionalReserva | null>;
  /** Sin caché [Rnf 08]: cada llamada trae el estado actual. */
  abstract obtenerDisponibilidad(profesionalId: number): Observable<Disponibilidad>;
  /** Falla con `SlotNoDisponibleError` si el slot ya no está DISPONIBLE. */
  abstract reservar(solicitud: SolicitudReserva): Observable<TurnoReservado>;
}
