import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EstadoTurno, TipoTurno } from '../../../../core/models/enums';
import { TurnosHttpRepository } from './turnos.repository.http';

// Turno del paciente logueado (tabla `turnos` + nombre del profesional y de la especialidad).
export interface TurnoPaciente {
  id: number;
  fecha: string; // yyyy-MM-dd
  horaInicio: string; // HH:mm
  horaFin: string; // HH:mm
  estado: EstadoTurno;
  tipoTurno: TipoTurno; // ESTUDIO no tiene profesional [R20]
  profesional: { id: number; nombre: string }; // nombre y apellido, sin título
  especialidad: string | null; // null: el turno se generó sin especialidad
  comentario: string | null;
}

// El paciente nunca ve DISPONIBLE ni BLOQUEADO: esos turnos no son suyos.
export { ESTADO_TURNO_TEXTO } from '../../../../core/models/turno-estado';

/** Turnos del paciente [R07, R08]. El back solo devuelve los del paciente de la sesión [Rnf 01]. */
@Injectable({ providedIn: 'root', useClass: TurnosHttpRepository })
export abstract class TurnosRepository {
  abstract listar(): Observable<TurnoPaciente[]>;
  /** null si no existe o no es del paciente. */
  abstract obtener(id: number): Observable<TurnoPaciente | null>;
  /** RESERVADO → CANCELADO. Devuelve el turno actualizado. */
  abstract cancelar(id: number): Observable<TurnoPaciente>;
}
