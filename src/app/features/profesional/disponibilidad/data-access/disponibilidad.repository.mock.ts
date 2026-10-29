import { Injectable, inject } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { EstadoTurno } from '../../../../core/models/enums';
import { DEMORA_MS, ProfesionalMockDb } from '../../data-access/profesional.mock-db';
import type { Bloqueo, DisponibilidadRepository, HorarioProfesional, NuevoBloqueo } from './disponibilidad.repository';

@Injectable()
export class DisponibilidadMockRepository implements DisponibilidadRepository {
  private readonly db = inject(ProfesionalMockDb);

  horarios(): Observable<HorarioProfesional[]> {
    return of(this.db.horarios.map((h) => ({ ...h }))).pipe(delay(DEMORA_MS));
  }

  cambiarActivo(horarioId: number, activo: boolean): Observable<HorarioProfesional> {
    const horario = this.db.horarios.find((h) => h.id === horarioId);
    if (!horario) return throwError(() => new Error('Horario inexistente.')).pipe(delay(DEMORA_MS));
    horario.activo = activo;
    return of({ ...horario }).pipe(delay(DEMORA_MS));
  }

  bloqueos(): Observable<Bloqueo[]> {
    return of(this.db.bloqueos.map((b) => ({ ...b }))).pipe(delay(DEMORA_MS));
  }

  // Las franjas libres que caen en el bloqueo pasan a BLOQUEADO; las reservadas no se tocan (lo decide el back).
  bloquear(nuevo: NuevoBloqueo): Observable<Bloqueo> {
    const bloqueo = { ...nuevo, id: this.db.nuevoId() };
    this.db.bloqueos.push(bloqueo);
    for (const t of this.db.turnos) {
      if (t.estado === EstadoTurno.DISPONIBLE && enRango(t.fecha, t.horaInicio, t.horaFin, bloqueo)) t.estado = EstadoTurno.BLOQUEADO;
    }
    return of({ ...bloqueo }).pipe(delay(DEMORA_MS));
  }

  desbloquear(bloqueoId: number): Observable<void> {
    const i = this.db.bloqueos.findIndex((b) => b.id === bloqueoId);
    if (i >= 0) {
      const [quitado] = this.db.bloqueos.splice(i, 1);
      for (const t of this.db.turnos) {
        const sigueBloqueado = this.db.bloqueos.some((b) => enRango(t.fecha, t.horaInicio, t.horaFin, b));
        if (t.estado === EstadoTurno.BLOQUEADO && enRango(t.fecha, t.horaInicio, t.horaFin, quitado) && !sigueBloqueado) t.estado = EstadoTurno.DISPONIBLE;
      }
    }
    return of(undefined).pipe(delay(DEMORA_MS));
  }
}

function enRango(fecha: string, inicio: string, fin: string, b: NuevoBloqueo): boolean {
  return `${fecha}T${inicio}` < b.fechaHasta && `${fecha}T${fin}` > b.fechaDesde;
}
