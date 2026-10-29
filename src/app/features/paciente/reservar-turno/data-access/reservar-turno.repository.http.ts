import { formatDate } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, throwError } from 'rxjs';
import { API_URL } from '../../../../core/config/tokens';
import { EstadoTurno, TipoTurno } from '../../../../core/models/enums';
import { TurnoDto, horaCorta } from '../../../../core/models/turno.dto';
import { DIAS_SEMANA } from '../../../../shared/utils/calendario';
import type {
  DiaSemana,
  Disponibilidad,
  ProfesionalReserva,
  ReservarTurnoRepository,
  Slot,
  SolicitudReserva,
  SolicitudReservaEstudio,
  TipoEstudioReserva,
  TurnoReservado,
} from './reservar-turno.repository';
import { SlotNoDisponibleError } from './reservar-turno.repository';

// GET /profesionales/profesionales/{id}/ (solo lo que usa la reserva).
interface ProfesionalDto {
  id: number;
  usuario: { nombre: string; apellido: string };
  especialidades: { especialidad: { id: number; nombre: string } }[];
  horarios: { dia_semana: DiaSemana; hora_desde: string; hora_hasta: string; duracion_turnos_min: number; activo: boolean }[];
}

interface TipoEstudioDto {
  id: number;
  nombre: string;
  descripcion: string | null;
}

interface FechaBloqueadaDto {
  profesional: number;
  fecha_desde: string; // ISO con zona horaria
  fecha_hasta: string;
  motivo: string | null;
}

/** Reserva y reprogramación contra la API [R06, R08, Rnf 08]. */
@Injectable()
export class ReservarTurnoHttpRepository implements ReservarTurnoRepository {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  obtenerProfesional(id: number): Observable<ProfesionalReserva | null> {
    return this.profesional(id).pipe(
      map((p) => ({
        id: p.id,
        nombre: p.usuario.nombre,
        apellido: p.usuario.apellido,
        especialidades: p.especialidades.map((pe) => pe.especialidad),
      })),
      catchError((e: unknown) => (e instanceof HttpErrorResponse && e.status === 404 ? of(null) : throwError(() => e))),
    );
  }

  // Slots DISPONIBLE del back. Bloquear fechas no cambia el estado de los slots, así que los bloqueos
  // se piden aparte para no ofrecer esos horarios (el endpoint no filtra: se toman los del profesional).
  obtenerDisponibilidad(profesionalId: number): Observable<Disponibilidad> {
    return forkJoin({
      profesional: this.profesional(profesionalId),
      turnos: this.http.get<TurnoDto[]>(`${this.apiUrl}/turnos/turnos/`, {
        params: { profesional: profesionalId, estado: EstadoTurno.DISPONIBLE },
      }),
      bloqueos: this.http.get<FechaBloqueadaDto[]>(`${this.apiUrl}/turnos/fechas-bloqueadas/`),
    }).pipe(
      map(({ profesional, turnos, bloqueos }) => ({
        horarios: profesional.horarios
          .filter((h) => h.activo)
          .map((h) => ({
            diaSemana: h.dia_semana,
            horaDesde: horaCorta(h.hora_desde),
            horaHasta: horaCorta(h.hora_hasta),
            duracionTurnosMin: h.duracion_turnos_min,
          })),
        bloqueos: bloqueos
          .filter((b) => b.profesional === profesionalId)
          .map((b) => ({ fechaDesde: fechaHoraLocal(b.fecha_desde), fechaHasta: fechaHoraLocal(b.fecha_hasta), motivo: b.motivo })),
        slots: turnos.filter((t) => t.tipo_turno === TipoTurno.CONSULTA).map(aSlot),
      })),
    );
  }

  obtenerTipoEstudio(id: number): Observable<TipoEstudioReserva | null> {
    return this.http.get<TipoEstudioDto>(`${this.apiUrl}/clinicos/tipos-estudio/${id}/`).pipe(
      map((t) => ({ id: t.id, nombre: t.nombre, descripcion: t.descripcion ?? '' })),
      catchError((e: unknown) => (e instanceof HttpErrorResponse && e.status === 404 ? of(null) : throwError(() => e))),
    );
  }

  // Los slots de estudio se generan por especialidad y sin profesional: se ofrecen todos los ESTUDIO libres.
  // El calendario habilita los días según horarios_medico, que estos turnos no tienen: se arma uno por día con slots.
  obtenerDisponibilidadEstudios(): Observable<Disponibilidad> {
    return this.http
      .get<TurnoDto[]>(`${this.apiUrl}/turnos/turnos/`, { params: { estado: EstadoTurno.DISPONIBLE } })
      .pipe(
        map((turnos) => {
          const slots = turnos.filter((t) => t.tipo_turno === TipoTurno.ESTUDIO).map(aSlot);
          const dias = new Set(slots.map((s) => DIAS_SEMANA[new Date(`${s.fecha}T12:00`).getDay()]));
          return {
            horarios: [...dias].map((diaSemana) => ({ diaSemana, horaDesde: '00:00', horaHasta: '23:59', duracionTurnosMin: 0 })),
            bloqueos: [],
            slots,
          };
        }),
      );
  }

  // POST /turnos/{id}/reservar/ { tipo_estudio_id, comentario }: el back reserva y crea el estudio [R20].
  reservarEstudio(s: SolicitudReservaEstudio): Observable<TurnoReservado> {
    return this.http
      .post<TurnoDto>(`${this.apiUrl}/turnos/turnos/${s.turnoId}/reservar/`, { tipo_estudio_id: s.tipoEstudioId, comentario: s.comentario })
      .pipe(
        map((t) => ({
          turnoId: t.id,
          fecha: t.fecha,
          horaInicio: horaCorta(t.fecha_hora_inicio),
          profesional: '',
          especialidad: t.especialidad_nombre,
        })),
        catchError((e: unknown) => throwError(() => (slotOcupado(e) ? new SlotNoDisponibleError() : e))),
      );
  }

  // Reservar: POST /turnos/{id}/reservar/ (el paciente sale del JWT).
  // Reprogramar: POST /turnos/{viejo}/reprogramar/ { nuevo_turno_id }; el back libera el viejo y reserva el nuevo.
  reservar(s: SolicitudReserva): Observable<TurnoReservado> {
    const pedido = s.reprogramaTurnoId
      ? this.http
          .post<{ turno: TurnoDto }>(`${this.apiUrl}/turnos/turnos/${s.reprogramaTurnoId}/reprogramar/`, { nuevo_turno_id: s.turnoId })
          .pipe(map((r) => r.turno))
      : this.http.post<TurnoDto>(`${this.apiUrl}/turnos/turnos/${s.turnoId}/reservar/`, { comentario: s.comentario });

    return pedido.pipe(
      map((t) => ({
        turnoId: t.id,
        fecha: t.fecha,
        horaInicio: horaCorta(t.fecha_hora_inicio),
        profesional: t.profesional_nombre ?? '',
        especialidad: t.especialidad_nombre,
      })),
      catchError((e: unknown) => throwError(() => (slotOcupado(e) ? new SlotNoDisponibleError() : e))),
    );
  }

  private profesional(id: number): Observable<ProfesionalDto> {
    return this.http.get<ProfesionalDto>(`${this.apiUrl}/profesionales/profesionales/${id}/`);
  }
}

function aSlot(t: TurnoDto): Slot {
  return { turnoId: t.id, fecha: t.fecha, horaInicio: horaCorta(t.fecha_hora_inicio), horaFin: horaCorta(t.fecha_hora_fin), estado: t.estado };
}

// "2026-11-05T12:00:00Z" → "2026-11-05T09:00" en hora local, el formato que compara el calendario.
function fechaHoraLocal(iso: string): string {
  return formatDate(iso, "yyyy-MM-dd'T'HH:mm", 'en-US');
}

// 400 con { error: "...no está disponible..." }: otro paciente lo reservó o el horario ya pasó.
function slotOcupado(e: unknown): boolean {
  return e instanceof HttpErrorResponse && e.status === 400 && /disponible/i.test(String(e.error?.error ?? ''));
}
