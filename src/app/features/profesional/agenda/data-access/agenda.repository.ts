import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import type { Disponibilidad } from '../../../../core/models/disponibilidad';
import { EstadoTurno, TipoDocumento, TipoTurno } from '../../../../core/models/enums';
import { AgendaHttpRepository } from './agenda.repository.http';

// Paciente del turno: `usuarios` + `pacientes` + obra social. Solo pacientes asignados al profesional [Rnf 01].
export interface PacienteTurno {
  id: number; // paciente_id
  nombre: string;
  apellido: string;
  tipoIdentificacion: TipoDocumento;
  numIdentificacion: string;
  fechaNacimiento: string; // yyyy-MM-dd
  telefono: string | null;
  correo: string;
  obraSocial: string | null;
}

// Turno de la agenda del profesional logueado (tabla `turnos`). Nunca llegan DISPONIBLE ni BLOQUEADO.
export interface TurnoProfesional {
  id: number; // turno_id
  fecha: string; // yyyy-MM-dd
  horaInicio: string; // HH:mm
  horaFin: string; // HH:mm
  estado: EstadoTurno;
  tipoTurno: TipoTurno;
  especialidad: string | null; // null: el slot se generó sin especialidad
  comentario: string | null;
  paciente: PacienteTurno;
  /** consulta_id: existe desde que se inicia la atención. */
  consultaId: number | null;
  /** FINALIZADO sin diagnóstico: se cerró el turno y el informe se carga después. */
  informePendiente: boolean;
}

// Historia clínica del paciente: `alergias` + `medicaciones_habituales` activas.
export interface FichaPaciente {
  alergias: string[];
  medicaciones: string[];
}

/** Agenda del profesional [R11, R12, R13]. El back solo devuelve los turnos del profesional de la sesión [Rnf 01]. */
@Injectable({ providedIn: 'root', useClass: AgendaHttpRepository })
export abstract class AgendaRepository {
  abstract listar(): Observable<TurnoProfesional[]>;
  /** null si no existe o no es del profesional. */
  abstract obtener(id: number): Observable<TurnoProfesional | null>;
  abstract ficha(pacienteId: number): Observable<FichaPaciente>;
  /** RESERVADO → EN_CURSO y crea la consulta (POST /turnos/{id}/iniciar/). */
  abstract iniciar(id: number): Observable<TurnoProfesional>;
  /** RESERVADO → CANCELADO. Devuelve el turno como era, con estado CANCELADO (para la confirmación). */
  abstract cancelar(id: number): Observable<TurnoProfesional>;
  /** Franjas del profesional para elegir la nueva fecha. Sin caché [Rnf 08]. */
  abstract disponibilidad(): Observable<Disponibilidad>;
  /** Cancela el turno y reserva `nuevoTurnoId` para el mismo paciente. Devuelve el turno nuevo. */
  abstract reprogramar(id: number, nuevoTurnoId: number): Observable<TurnoProfesional>;
}
