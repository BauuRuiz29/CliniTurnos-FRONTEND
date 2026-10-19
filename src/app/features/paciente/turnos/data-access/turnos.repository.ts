import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EstadoTurno } from '../../../../core/models/enums';
import { LugarAtencion } from '../../../../core/models/lugar-atencion';
import { TurnosMockRepository } from './turnos.repository.mock';

// Turno del paciente logueado (tabla `turnos` + datos del profesional y del lugar).
export interface TurnoPaciente {
  id: number;
  fecha: string; // yyyy-MM-dd
  horaInicio: string; // HH:mm
  horaFin: string; // HH:mm
  estado: EstadoTurno;
  profesional: { id: number; nombre: string }; // nombre con título: "Dr. Juan García"
  especialidad: string;
  lugar: LugarAtencion;
  comentario: string | null;
}

// El paciente nunca ve DISPONIBLE ni BLOQUEADO: esos turnos no son suyos.
export const ESTADO_TURNO_TEXTO: Record<EstadoTurno, string> = {
  DISPONIBLE: 'Disponible',
  BLOQUEADO: 'Bloqueado',
  RESERVADO: 'Reservado',
  EN_CURSO: 'En curso',
  FINALIZADO: 'Finalizado',
  CANCELADO: 'Cancelado',
  AUSENTE: 'Ausente',
};

/** Turnos del paciente [R07, R08]. El back solo devuelve los del paciente de la sesión [Rnf 01]. */
@Injectable({ providedIn: 'root', useClass: TurnosMockRepository })
export abstract class TurnosRepository {
  abstract listar(): Observable<TurnoPaciente[]>;
  /** null si no existe o no es del paciente. */
  abstract obtener(id: number): Observable<TurnoPaciente | null>;
  /** RESERVADO → CANCELADO. Devuelve el turno actualizado. */
  abstract cancelar(id: number): Observable<TurnoPaciente>;
}
