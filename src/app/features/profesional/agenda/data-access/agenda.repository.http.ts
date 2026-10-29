import { formatDate } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, switchMap, throwError } from 'rxjs';
import type { DiaSemana, Disponibilidad } from '../../../../core/models/disponibilidad';
import { EstadoTurno, TipoTurno } from '../../../../core/models/enums';
import { TurnoDto, horaCorta } from '../../../../core/models/turno.dto';
import { ProfesionalApi, aTurnoProfesional, conPaciente } from '../../data-access/profesional-api';
import type { AgendaRepository, FichaPaciente, TurnoProfesional } from './agenda.repository';

// GET /clinicos/historias-clinicas/: al médico le devuelve las de los pacientes que atendió.
interface HistoriaClinicaDto {
  paciente: number;
  alergias: { descripcion: string; severidad: string | null }[];
  medicaciones: { medicamento: string; dosis: string | null; frecuencia: string | null; activo: boolean }[];
}

interface HorarioDto {
  profesional: number;
  dia_semana: DiaSemana;
  hora_desde: string;
  hora_hasta: string;
  duracion_turnos_min: number;
  activo: boolean;
}

interface FechaBloqueadaDto {
  profesional: number;
  fecha_desde: string; // ISO con zona horaria
  fecha_hasta: string;
  motivo: string | null;
}

/** Agenda del profesional contra la API [R11, R12, R13]. */
@Injectable()
export class AgendaHttpRepository implements AgendaRepository {
  private readonly api = inject(ProfesionalApi);
  private readonly http = inject(HttpClient);

  listar(): Observable<TurnoProfesional[]> {
    return forkJoin({ turnos: this.api.turnos(), pacientes: this.api.pacientes(), consultas: this.api.consultas() }).pipe(
      map(({ turnos, pacientes, consultas }) =>
        conPaciente(turnos)
          .filter((t) => pacientes.has(t.paciente!))
          .map((t) => aTurnoProfesional(t, pacientes.get(t.paciente!)!, consultas.find((c) => c.turno === t.id))),
      ),
    );
  }

  obtener(id: number): Observable<TurnoProfesional | null> {
    return this.api.turno(id).pipe(
      switchMap((t) => (conPaciente([t]).length ? this.completar(t) : of(null))),
      catchError((e: unknown) => (e instanceof HttpErrorResponse && e.status === 404 ? of(null) : throwError(() => e))),
    );
  }

  ficha(pacienteId: number): Observable<FichaPaciente> {
    return this.http.get<HistoriaClinicaDto[]>(`${this.api.url}/clinicos/historias-clinicas/`).pipe(
      map((historias) => {
        const h = historias.find((x) => x.paciente === pacienteId);
        return {
          alergias: (h?.alergias ?? []).map((a) => a.descripcion),
          medicaciones: (h?.medicaciones ?? [])
            .filter((m) => m.activo)
            .map((m) => [m.medicamento, m.dosis, m.frecuencia].filter(Boolean).join(' ')),
        };
      }),
    );
  }

  // El back crea la consulta al iniciar; se vuelve a leer el turno para tener su consulta_id.
  iniciar(id: number): Observable<TurnoProfesional> {
    return this.http.post(`${this.api.url}/turnos/turnos/${id}/iniciar/`, {}).pipe(switchMap(() => this.obtenerExistente(id)));
  }

  // Con más de 24 h el back libera la franja (vuelve a DISPONIBLE, sin paciente), así que el turno
  // se lee antes de cancelar: la confirmación muestra a quién se le canceló.
  cancelar(id: number): Observable<TurnoProfesional> {
    return this.obtenerExistente(id).pipe(
      switchMap((turno) =>
        this.http.post(`${this.api.url}/turnos/turnos/${id}/cancelar/`, {}).pipe(map(() => ({ ...turno, estado: EstadoTurno.CANCELADO }))),
      ),
    );
  }

  // Slots DISPONIBLE propios + horarios activos + bloqueos (bloquear no cambia el estado de los slots).
  disponibilidad(): Observable<Disponibilidad> {
    return forkJoin({
      turnos: this.api.turnos({ estado: EstadoTurno.DISPONIBLE }),
      horarios: this.http.get<HorarioDto[]>(`${this.api.url}/profesionales/horarios/`),
      bloqueos: this.http.get<FechaBloqueadaDto[]>(`${this.api.url}/turnos/fechas-bloqueadas/`),
    }).pipe(
      map(({ turnos, horarios, bloqueos }) => {
        // /users/me/ no trae el id de profesional: sale de sus horarios o sus turnos.
        const profesionalId = horarios[0]?.profesional ?? turnos[0]?.profesional ?? null;
        return {
          horarios: horarios
            .filter((h) => h.activo)
            .map((h) => ({ diaSemana: h.dia_semana, horaDesde: horaCorta(h.hora_desde), horaHasta: horaCorta(h.hora_hasta), duracionTurnosMin: h.duracion_turnos_min })),
          bloqueos: bloqueos
            .filter((b) => b.profesional === profesionalId)
            .map((b) => ({ fechaDesde: fechaHoraLocal(b.fecha_desde), fechaHasta: fechaHoraLocal(b.fecha_hasta), motivo: b.motivo })),
          slots: turnos
            .filter((t) => t.tipo_turno === TipoTurno.CONSULTA)
            .map((t) => ({ turnoId: t.id, fecha: t.fecha, horaInicio: horaCorta(t.fecha_hora_inicio), horaFin: horaCorta(t.fecha_hora_fin), estado: t.estado })),
        };
      }),
    );
  }

  // POST /turnos/{id}/reprogramar/ { nuevo_turno_id }: el back reserva el nuevo para el mismo paciente y libera el original.
  reprogramar(id: number, nuevoTurnoId: number): Observable<TurnoProfesional> {
    return this.http
      .post(`${this.api.url}/turnos/turnos/${id}/reprogramar/`, { nuevo_turno_id: nuevoTurnoId })
      .pipe(switchMap(() => this.obtenerExistente(nuevoTurnoId)));
  }

  private completar(t: TurnoDto): Observable<TurnoProfesional> {
    return forkJoin({ paciente: this.api.paciente(t.paciente!), consultas: this.api.consultas() }).pipe(
      map(({ paciente, consultas }) => aTurnoProfesional(t, paciente, consultas.find((c) => c.turno === t.id))),
    );
  }

  private obtenerExistente(id: number): Observable<TurnoProfesional> {
    return this.obtener(id).pipe(
      map((t) => {
        if (!t) throw new Error('El turno no existe o no tiene paciente.');
        return t;
      }),
    );
  }
}

// "2026-11-05T12:00:00Z" → "2026-11-05T09:00" en hora local, el formato que compara el calendario.
function fechaHoraLocal(iso: string): string {
  return formatDate(iso, "yyyy-MM-dd'T'HH:mm", 'en-US');
}
