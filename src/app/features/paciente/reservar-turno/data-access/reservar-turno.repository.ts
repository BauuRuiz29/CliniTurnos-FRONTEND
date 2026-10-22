import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EstadoTurno } from '../../../../core/models/enums';
import { LugarAtencion } from '../../../../core/models/lugar-atencion';
import { ReservarTurnoMockRepository } from './reservar-turno.repository.mock';

// Datos propios de esta pantalla: no depende de `catalogo/`.
export interface ProfesionalReserva {
  id: number;
  titulo: 'Dr.' | 'Dra.';
  nombre: string;
  apellido: string;
  especialidad: { id: number; nombre: string };
  lugar: LugarAtencion;
}

// El enum del DER hoy va de LUNES a VIERNES; el front acepta cualquier día que traiga horarios_medico.
export type DiaSemana = 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO' | 'DOMINGO';

// Tabla `horarios_medico` (solo las filas activas).
export interface HorarioMedico {
  diaSemana: DiaSemana;
  horaDesde: string; // HH:mm
  horaHasta: string; // HH:mm
  duracionTurnosMin: number;
}

// Tabla `fechas_bloqueadas`: puede cubrir unas horas o días enteros.
export interface FechaBloqueada {
  fechaDesde: string; // yyyy-MM-ddTHH:mm
  fechaHasta: string; // yyyy-MM-ddTHH:mm
  motivo: string | null;
}

// Fila pregenerada de `turnos` (ventana de ~30 días).
export interface Slot {
  turnoId: number;
  fecha: string; // yyyy-MM-dd
  horaInicio: string; // HH:mm
  horaFin: string; // HH:mm
  estado: EstadoTurno;
}

export interface Disponibilidad {
  horarios: HorarioMedico[];
  bloqueos: FechaBloqueada[];
  slots: Slot[];
}

// Reservar es un UPDATE del slot pregenerado (DISPONIBLE → RESERVADO), no un INSERT.
// El paciente no viaja: el back lo toma de la sesión (JWT), y la obra social sale de pacientes.obra_social_id.
export interface SolicitudReserva {
  turnoId: number;
  especialidadId: number;
  comentario: string | null; // turnos.comentario, varchar(255)
  /** Reprogramar = cancelar este turno + reservar el nuevo [AGENTS §4.2]; el back lo hace en una sola operación. */
  reprogramaTurnoId: number | null;
}

export interface TurnoReservado {
  turnoId: number;
  fecha: string; // yyyy-MM-dd
  horaInicio: string; // HH:mm
  profesional: string;
  especialidad: string;
  lugar: LugarAtencion;
}

/** El slot ya no está DISPONIBLE (otro paciente lo reservó o se bloqueó). */
export class SlotNoDisponibleError extends Error {
  constructor() {
    super('El horario elegido ya no está disponible.');
  }
}

/** Reserva de turno de consulta con un profesional [R06, CU04]. */
@Injectable({ providedIn: 'root', useClass: ReservarTurnoMockRepository })
export abstract class ReservarTurnoRepository {
  abstract obtenerProfesional(id: number): Observable<ProfesionalReserva | null>;
  /** Sin caché [Rnf 08]: cada llamada trae el estado actual. */
  abstract obtenerDisponibilidad(profesionalId: number): Observable<Disponibilidad>;
  /** Falla con `SlotNoDisponibleError` si el slot ya no está DISPONIBLE. */
  abstract reservar(solicitud: SolicitudReserva): Observable<TurnoReservado>;
}
