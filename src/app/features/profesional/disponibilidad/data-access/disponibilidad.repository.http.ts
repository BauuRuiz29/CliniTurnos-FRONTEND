import { formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, switchMap } from 'rxjs';
import type { DiaSemana } from '../../../../core/models/disponibilidad';
import { horaCorta } from '../../../../core/models/turno.dto';
import { ProfesionalApi } from '../../data-access/profesional-api';
import type { Bloqueo, DisponibilidadRepository, HorarioProfesional, NuevoBloqueo } from './disponibilidad.repository';

// /profesionales/horarios/: al médico le devuelve solo los suyos.
interface HorarioDto {
  id: number;
  dia_semana: DiaSemana;
  hora_desde: string; // HH:mm:ss
  hora_hasta: string;
  duracion_turnos_min: number;
  activo: boolean;
}

// /turnos/fechas-bloqueadas/: el back no las filtra por profesional.
interface FechaBloqueadaDto {
  id: number;
  profesional: number;
  fecha_desde: string; // ISO con zona horaria
  fecha_hasta: string;
  motivo: string | null;
}

/** Disponibilidad horaria del profesional contra la API [R22]. */
@Injectable()
export class DisponibilidadHttpRepository implements DisponibilidadRepository {
  private readonly api = inject(ProfesionalApi);
  private readonly http = inject(HttpClient);
  private readonly horariosUrl = `${this.api.url}/profesionales/horarios`;
  private readonly bloqueosUrl = `${this.api.url}/turnos/fechas-bloqueadas`;

  horarios(): Observable<HorarioProfesional[]> {
    return this.http.get<HorarioDto[]>(`${this.horariosUrl}/`).pipe(map((hs) => hs.map(aHorario)));
  }

  cambiarActivo(horarioId: number, activo: boolean): Observable<HorarioProfesional> {
    return this.http.patch<HorarioDto>(`${this.horariosUrl}/${horarioId}/`, { activo }).pipe(map(aHorario));
  }

  bloqueos(): Observable<Bloqueo[]> {
    return this.api.miProfesional().pipe(
      switchMap(({ profesional }) =>
        this.http.get<FechaBloqueadaDto[]>(`${this.bloqueosUrl}/`).pipe(map((bs) => bs.filter((b) => b.profesional === profesional.id).map(aBloqueo))),
      ),
    );
  }

  // El back pide el profesional en el body. Bloquear no cambia el estado de los slots:
  // la reserva y el reprogramar descuentan los bloqueos al armar la disponibilidad.
  bloquear(nuevo: NuevoBloqueo): Observable<Bloqueo> {
    return this.api.miProfesional().pipe(
      switchMap(({ profesional }) =>
        this.http.post<FechaBloqueadaDto>(`${this.bloqueosUrl}/`, {
          profesional: profesional.id,
          fecha_desde: aIso(nuevo.fechaDesde),
          fecha_hasta: aIso(nuevo.fechaHasta),
          motivo: nuevo.motivo,
        }),
      ),
      map(aBloqueo),
    );
  }

  desbloquear(bloqueoId: number): Observable<void> {
    return this.http.delete<void>(`${this.bloqueosUrl}/${bloqueoId}/`);
  }
}

function aHorario(h: HorarioDto): HorarioProfesional {
  return {
    id: h.id,
    diaSemana: h.dia_semana,
    horaDesde: horaCorta(h.hora_desde),
    horaHasta: horaCorta(h.hora_hasta),
    duracionTurnosMin: h.duracion_turnos_min,
    activo: h.activo,
  };
}

function aBloqueo(b: FechaBloqueadaDto): Bloqueo {
  return { id: b.id, fechaDesde: fechaHoraLocal(b.fecha_desde), fechaHasta: fechaHoraLocal(b.fecha_hasta), motivo: b.motivo };
}

// "2026-11-17T00:00:00-03:00" → "2026-11-17T00:00" en hora local (lo que usan el formulario y el calendario).
function fechaHoraLocal(iso: string): string {
  return formatDate(iso, "yyyy-MM-dd'T'HH:mm", 'en-US');
}

// "2026-11-17T09:00" (hora local del datetime-local) → ISO con zona, para que el back no lo corra.
function aIso(local: string): string {
  return new Date(local).toISOString();
}
