import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { API_URL } from '../../../core/config/tokens';
import { EstadoTurno, Genero, TipoDocumento } from '../../../core/models/enums';
import { TurnoDto, horaCorta } from '../../../core/models/turno.dto';
import type { PacienteTurno, TurnoProfesional } from '../agenda/data-access/agenda.repository';

// Lecturas de la API que comparten los repositorios del área profesional.

// GET /pacientes/pacientes/ (solo lo que se usa).
export interface PacienteDto {
  id: number;
  usuario: { nombre: string; apellido: string };
  obra_social: { nombre: string } | null;
  fecha_nacimiento: string;
  telefono: string | null;
  correo: string;
  tipo_identificacion: TipoDocumento;
  num_identificacion: string;
}

// GET /clinicos/consultas/ (al médico le devuelve solo las de sus turnos).
export interface ConsultaDto {
  id: number;
  turno: number;
  diagnostico: string | null;
  plan_tratamiento: string | null;
  indicaciones: string | null;
  estado: 'EN_CURSO' | 'FINALIZADA';
}

// GET /profesionales/profesionales/ (solo lo que se usa).
export interface ProfesionalDto {
  id: number;
  usuario: { id: number; nombre: string; apellido: string; login: string; foto: string | null };
  especialidades: { especialidad: { id: number; nombre: string } }[];
  matriculas: { numero_matricula: string; tipo_matricula: string; jurisdiccion: string | null; activa: boolean }[];
}

@Injectable({ providedIn: 'root' })
export class ProfesionalApi {
  private readonly http = inject(HttpClient);
  readonly url = inject(API_URL);

  /** Al médico el back le devuelve sus turnos, incluidas las franjas libres. */
  turnos(params: Record<string, string> = {}): Observable<TurnoDto[]> {
    return this.http.get<TurnoDto[]>(`${this.url}/turnos/turnos/`, { params });
  }

  turno(id: number): Observable<TurnoDto> {
    return this.http.get<TurnoDto>(`${this.url}/turnos/turnos/${id}/`);
  }

  // El back no filtra este listado por profesional: se cruza con los turnos propios.
  pacientes(): Observable<Map<number, PacienteDto>> {
    return this.http.get<PacienteDto[]>(`${this.url}/pacientes/pacientes/`).pipe(map((ps) => new Map(ps.map((p) => [p.id, p]))));
  }

  paciente(id: number): Observable<PacienteDto> {
    return this.http.get<PacienteDto>(`${this.url}/pacientes/pacientes/${id}/`);
  }

  consultas(): Observable<ConsultaDto[]> {
    return this.http.get<ConsultaDto[]>(`${this.url}/clinicos/consultas/`);
  }

  /**
   * Profesional de la sesión. /users/me/ no trae el id de profesional: se busca por usuario.
   * También devuelve el género, que el listado de profesionales no trae.
   */
  miProfesional(): Observable<{ profesional: ProfesionalDto; genero: Genero | null }> {
    return forkJoin({
      me: this.http.get<{ id: number; genero: Genero | null }>(`${this.url}/users/me/`),
      profesionales: this.http.get<ProfesionalDto[]>(`${this.url}/profesionales/profesionales/`),
    }).pipe(
      map(({ me, profesionales }) => {
        const profesional = profesionales.find((p) => p.usuario.id === me.id);
        if (!profesional) throw new Error('El usuario no tiene perfil de profesional.');
        return { profesional, genero: me.genero };
      }),
    );
  }
}

/** Turnos con paciente: los DISPONIBLE y BLOQUEADO no son parte de la agenda. */
export function conPaciente(turnos: TurnoDto[]): TurnoDto[] {
  return turnos.filter((t) => t.paciente !== null && t.estado !== EstadoTurno.DISPONIBLE && t.estado !== EstadoTurno.BLOQUEADO);
}

export function aPacienteTurno(p: PacienteDto): PacienteTurno {
  return {
    id: p.id,
    nombre: p.usuario.nombre,
    apellido: p.usuario.apellido,
    tipoIdentificacion: p.tipo_identificacion,
    numIdentificacion: p.num_identificacion,
    fechaNacimiento: p.fecha_nacimiento,
    telefono: p.telefono,
    correo: p.correo,
    obraSocial: p.obra_social?.nombre ?? null,
  };
}

export function aTurnoProfesional(t: TurnoDto, paciente: PacienteDto, consulta: ConsultaDto | undefined): TurnoProfesional {
  return {
    id: t.id,
    fecha: t.fecha,
    horaInicio: horaCorta(t.fecha_hora_inicio),
    horaFin: horaCorta(t.fecha_hora_fin),
    estado: t.estado,
    tipoTurno: t.tipo_turno,
    especialidad: t.especialidad_nombre,
    comentario: t.comentario,
    paciente: aPacienteTurno(paciente),
    consultaId: consulta?.id ?? null,
    informePendiente: t.estado === EstadoTurno.FINALIZADO && !!consulta && !consulta.diagnostico?.trim(),
  };
}
