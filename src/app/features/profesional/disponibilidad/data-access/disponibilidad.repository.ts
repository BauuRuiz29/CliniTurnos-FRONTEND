import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import type { DiaSemana } from '../../../../core/models/disponibilidad';
import { DisponibilidadHttpRepository } from './disponibilidad.repository.http';

// Fila de `horarios_medico` del profesional logueado.
export interface HorarioProfesional {
  id: number; // horario_id
  diaSemana: DiaSemana;
  horaDesde: string; // HH:mm
  horaHasta: string; // HH:mm
  duracionTurnosMin: number;
  activo: boolean;
}

// Fila de `fechas_bloqueadas`.
export interface Bloqueo {
  id: number; // bloqueo_id
  fechaDesde: string; // yyyy-MM-ddTHH:mm
  fechaHasta: string; // yyyy-MM-ddTHH:mm
  motivo: string | null;
}

export type NuevoBloqueo = Omit<Bloqueo, 'id'>;

/** Disponibilidad horaria del profesional [R22]. */
@Injectable({ providedIn: 'root', useClass: DisponibilidadHttpRepository })
export abstract class DisponibilidadRepository {
  abstract horarios(): Observable<HorarioProfesional[]>;
  abstract cambiarActivo(horarioId: number, activo: boolean): Observable<HorarioProfesional>;
  abstract bloqueos(): Observable<Bloqueo[]>;
  abstract bloquear(bloqueo: NuevoBloqueo): Observable<Bloqueo>;
  abstract desbloquear(bloqueoId: number): Observable<void>;
}
