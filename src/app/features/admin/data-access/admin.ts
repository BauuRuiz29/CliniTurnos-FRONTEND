import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { API_URL } from '../../../core/config/tokens';
import type { HorarioMedico } from '../../../core/models/disponibilidad';
import { EstadoTurno, Genero, Rol } from '../../../core/models/enums';
import { ESTADO_TURNO_TEXTO } from '../../../core/models/turno-estado';
import { TurnoDto } from '../../../core/models/turno.dto';
import { VENTANA_DIAS } from '../../../shared/utils/calendario';
import { hoyIso } from '../../../shared/utils/formularios';

//#region DTOs (solo lo que usa el área admin)
interface UsuarioDto {
  id: number;
  login: string;
  nombre: string;
  apellido: string;
  estado: 'ACTIVO' | 'INACTIVO';
  roles: Rol[];
}

interface ProfesionalDto {
  id: number;
  usuario: { id: number; nombre: string; apellido: string; login: string };
  especialidades: { especialidad: { id: number; nombre: string } }[];
}

interface EspecialidadDto {
  id: number;
  nombre: string;
  descripcion: string | null;
}
//#endregion

export interface UsuarioAdmin {
  id: number; // usuario_id
  nombre: string; // nombre y apellido
  login: string;
  roles: Rol[];
  activo: boolean;
}

export interface ProfesionalAdmin {
  id: number; // profesional_id
  nombre: string; // nombre y apellido
  login: string;
  especialidades: string[];
  activo: boolean; // usuarios.estado
}

export interface EspecialidadAdmin {
  id: number;
  nombre: string;
  descripcion: string;
}

/** Lo que guarda POST /profesionales/profesionales/alta/ [R16]. */
export interface AltaProfesional {
  nombre: string;
  apellido: string;
  genero: Genero;
  login: string;
  password: string;
  especialidadIds: number[];
  numeroMatricula: string | null;
  tipoMatricula: 'NACIONAL' | 'PROVINCIAL' | null;
  horarios: HorarioMedico[];
}

export interface Conteo {
  etiqueta: string;
  cantidad: number;
}

export interface ResumenAdmin {
  profesionalesActivos: number;
  pacientes: number;
  turnosHoy: number;
  porEstado: Conteo[];
  porEspecialidad: Conteo[];
}

// Los turnos que tienen paciente; DISPONIBLE y BLOQUEADO son franjas libres.
const ESTADOS_CON_PACIENTE: EstadoTurno[] = [
  EstadoTurno.RESERVADO,
  EstadoTurno.EN_CURSO,
  EstadoTurno.FINALIZADO,
  EstadoTurno.CANCELADO,
  EstadoTurno.AUSENTE,
];

/** Área de administración contra la API [R16, R21]. Los endpoints de escritura exigen rol ADMIN. */
@Injectable({ providedIn: 'root' })
export class AdminRepository {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  usuarios(): Observable<UsuarioAdmin[]> {
    return this.http.get<UsuarioDto[]>(`${this.apiUrl}/users/usuarios/`).pipe(map((dtos) => dtos.map(aUsuario)));
  }

  /** ACTIVO / INACTIVO: un usuario inactivo no puede loguearse. */
  cambiarEstadoUsuario(id: number, activo: boolean): Observable<UsuarioAdmin> {
    return this.http
      .patch<UsuarioDto>(`${this.apiUrl}/users/usuarios/${id}/`, { estado: activo ? 'ACTIVO' : 'INACTIVO' })
      .pipe(map(aUsuario));
  }

  // El estado no viene en el profesional: sale de su usuario.
  profesionales(): Observable<ProfesionalAdmin[]> {
    return forkJoin({ profesionales: this.profesionalesDto(), usuarios: this.http.get<UsuarioDto[]>(`${this.apiUrl}/users/usuarios/`) }).pipe(
      map(({ profesionales, usuarios }) =>
        profesionales.map((p) => ({
          id: p.id,
          nombre: `${p.usuario.nombre} ${p.usuario.apellido}`,
          login: p.usuario.login,
          especialidades: p.especialidades.map((e) => e.especialidad.nombre),
          activo: usuarios.find((u) => u.id === p.usuario.id)?.estado !== 'INACTIVO',
        })),
      ),
    );
  }

  /**
   * Alta del profesional y de su disponibilidad [R16, R22]: crea cada horario y genera los turnos
   * DISPONIBLE de los próximos VENTANA_DIAS días. Devuelve false si el profesional se creó
   * pero falló la disponibilidad (reintentar el alta chocaría con el usuario ya creado).
   */
  altaProfesional(a: AltaProfesional): Observable<boolean> {
    return this.http
      .post<{ id: number }>(`${this.apiUrl}/profesionales/profesionales/alta/`, {
        nombre: a.nombre,
        apellido: a.apellido,
        genero: a.genero,
        login: a.login,
        password: a.password,
        especialidad_ids: a.especialidadIds,
        ...(a.numeroMatricula ? { numero_matricula: a.numeroMatricula, tipo_matricula: a.tipoMatricula } : {}),
      })
      .pipe(
        switchMap(({ id }) => {
          if (!a.horarios.length) return of(true);
          const horarios = a.horarios.map((h) =>
            this.http.post(`${this.apiUrl}/profesionales/horarios/`, {
              profesional: id,
              dia_semana: h.diaSemana,
              hora_desde: h.horaDesde,
              hora_hasta: h.horaHasta,
              duracion_turnos_min: h.duracionTurnosMin,
              activo: true,
            }),
          );
          return forkJoin(horarios).pipe(
            switchMap(() => this.http.post(`${this.apiUrl}/turnos/turnos/generar_slots/`, { profesional_id: id, dias: VENTANA_DIAS })),
            map(() => true),
            catchError(() => of(false)),
          );
        }),
      );
  }

  /** Baja lógica: no borra, deja al usuario INACTIVO [R16]. */
  cambiarEstadoProfesional(id: number, activo: boolean): Observable<void> {
    return this.http
      .post(`${this.apiUrl}/profesionales/profesionales/${id}/${activo ? 'reactivar' : 'baja'}/`, {})
      .pipe(map(() => undefined));
  }

  especialidades(): Observable<EspecialidadAdmin[]> {
    return this.http.get<EspecialidadDto[]>(`${this.apiUrl}/profesionales/especialidades/`).pipe(map((dtos) => dtos.map(aEspecialidad)));
  }

  especialidad(id: number): Observable<EspecialidadAdmin> {
    return this.http.get<EspecialidadDto>(`${this.apiUrl}/profesionales/especialidades/${id}/`).pipe(map(aEspecialidad));
  }

  /** Alta (sin id) o modificación [R21]. */
  guardarEspecialidad(id: number | null, datos: Omit<EspecialidadAdmin, 'id'>): Observable<void> {
    const url = `${this.apiUrl}/profesionales/especialidades/`;
    const pedido = id === null ? this.http.post(url, datos) : this.http.patch(`${url}${id}/`, datos);
    return pedido.pipe(map(() => undefined));
  }

  /** El back borra en cascada la especialidad de los profesionales que la tienen [R21]. */
  borrarEspecialidad(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/profesionales/especialidades/${id}/`);
  }

  // shortcut: no hay endpoint de estadísticas; se cuentan las listas en el front. Si crecen, pedirle uno al back.
  resumen(): Observable<ResumenAdmin> {
    const turnos = (params: Record<string, string>) => this.http.get<TurnoDto[]>(`${this.apiUrl}/turnos/turnos/`, { params });
    return forkJoin({
      profesionales: this.profesionales(),
      pacientes: this.http.get<unknown[]>(`${this.apiUrl}/pacientes/pacientes/`),
      hoy: turnos({ fecha: hoyIso() }),
      porEstado: forkJoin(ESTADOS_CON_PACIENTE.map((estado) => turnos({ estado }))),
    }).pipe(
      map(({ profesionales, pacientes, hoy, porEstado }) =>
        armarResumen(profesionales, pacientes.length, hoy, porEstado.flat(), this.especialidadPorProfesional(profesionales)),
      ),
    );
  }

  private profesionalesDto(): Observable<ProfesionalDto[]> {
    return this.http.get<ProfesionalDto[]>(`${this.apiUrl}/profesionales/profesionales/`);
  }

  // Los turnos de consulta se generan sin especialidad: se usa la primera del profesional.
  private especialidadPorProfesional(profesionales: ProfesionalAdmin[]): Map<number, string> {
    return new Map(profesionales.filter((p) => p.especialidades.length).map((p) => [p.id, p.especialidades[0]]));
  }
}

export function armarResumen(
  profesionales: ProfesionalAdmin[],
  pacientes: number,
  hoy: TurnoDto[],
  turnos: TurnoDto[],
  especialidadDe: Map<number, string>,
): ResumenAdmin {
  const contar = (claves: string[]): Conteo[] => {
    const totales = new Map<string, number>();
    claves.forEach((c) => totales.set(c, (totales.get(c) ?? 0) + 1));
    return [...totales].map(([etiqueta, cantidad]) => ({ etiqueta, cantidad })).sort((a, b) => b.cantidad - a.cantidad);
  };
  return {
    profesionalesActivos: profesionales.filter((p) => p.activo).length,
    pacientes,
    turnosHoy: hoy.filter((t) => ESTADOS_CON_PACIENTE.includes(t.estado)).length,
    porEstado: contar(turnos.map((t) => ESTADO_TURNO_TEXTO[t.estado])),
    porEspecialidad: contar(
      turnos.map((t) => t.especialidad_nombre ?? (t.profesional !== null ? especialidadDe.get(t.profesional) : undefined) ?? 'Sin especialidad'),
    ),
  };
}

/** Primer mensaje de un 400 de DRF ({ campo: ["mensaje"] } o { error: "mensaje" }). */
export function mensajeDeError(e: unknown, porDefecto: string): string {
  if (!(e instanceof HttpErrorResponse) || e.status !== 400 || typeof e.error !== 'object' || !e.error) return porDefecto;
  const primero = Object.values(e.error as Record<string, unknown>).flat()[0];
  return typeof primero === 'string' ? primero : porDefecto;
}

function aUsuario(u: UsuarioDto): UsuarioAdmin {
  return { id: u.id, nombre: `${u.nombre} ${u.apellido}`, login: u.login, roles: u.roles, activo: u.estado !== 'INACTIVO' };
}

function aEspecialidad(e: EspecialidadDto): EspecialidadAdmin {
  return { id: e.id, nombre: e.nombre, descripcion: e.descripcion ?? '' };
}
