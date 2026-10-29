import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, throwError } from 'rxjs';
import { API_URL } from '../../../../core/config/tokens';
import { EstadoTurno, TipoTurno } from '../../../../core/models/enums';
import { TurnoDto, horaCorta } from '../../../../core/models/turno.dto';
import type { TurnoPaciente, TurnosRepository } from './turnos.repository';

// Al paciente el back le devuelve sus turnos y además todos los DISPONIBLE (para reservar).
// Se pide por estado para traer solo los propios, sin las cientos de franjas libres.
const ESTADOS_DEL_PACIENTE: EstadoTurno[] = [
  EstadoTurno.RESERVADO,
  EstadoTurno.EN_CURSO,
  EstadoTurno.FINALIZADO,
  EstadoTurno.CANCELADO,
  EstadoTurno.AUSENTE,
];

/** Turnos del paciente contra la API [R07, R08]. */
@Injectable()
export class TurnosHttpRepository implements TurnosRepository {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_URL)}/turnos/turnos`;

  listar(): Observable<TurnoPaciente[]> {
    return forkJoin(ESTADOS_DEL_PACIENTE.map((estado) => this.http.get<TurnoDto[]>(`${this.url}/`, { params: { estado } }))).pipe(
      map((listas) => listas.flat().filter((t) => t.paciente !== null).map(aTurnoPaciente)),
    );
  }

  obtener(id: number): Observable<TurnoPaciente | null> {
    return this.http.get<TurnoDto>(`${this.url}/${id}/`).pipe(
      // Un DISPONIBLE (sin paciente) no es un turno del paciente.
      map((t) => (t.paciente === null ? null : aTurnoPaciente(t))),
      catchError((e: unknown) => (e instanceof HttpErrorResponse && e.status === 404 ? of(null) : throwError(() => e))),
    );
  }

  // Con más de 24 h el back lo libera (vuelve a DISPONIBLE); con menos queda CANCELADO.
  cancelar(id: number): Observable<TurnoPaciente> {
    return this.http.post<{ turno: TurnoDto }>(`${this.url}/${id}/cancelar/`, {}).pipe(map((r) => aTurnoPaciente(r.turno)));
  }
}

export function aTurnoPaciente(t: TurnoDto): TurnoPaciente {
  return {
    id: t.id,
    fecha: t.fecha,
    horaInicio: horaCorta(t.fecha_hora_inicio),
    horaFin: horaCorta(t.fecha_hora_fin),
    estado: t.estado,
    tipoTurno: t.tipo_turno,
    profesional: { id: t.profesional ?? 0, nombre: t.profesional_nombre ?? (t.tipo_turno === TipoTurno.ESTUDIO ? 'Estudio' : '') },
    especialidad: t.especialidad_nombre,
    comentario: t.comentario,
  };
}
