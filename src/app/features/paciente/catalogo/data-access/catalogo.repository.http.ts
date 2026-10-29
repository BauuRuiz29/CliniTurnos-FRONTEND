import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_URL } from '../../../../core/config/tokens';
import { Especialidad, Profesional, TipoEstudio } from './catalogo.models';
import type { CatalogoRepository } from './catalogo.repository';

// DTOs de /profesionales/ (solo lo que usa el catálogo).
interface EspecialidadDto {
  id: number;
  nombre: string;
  descripcion: string | null;
}

interface ProfesionalDto {
  id: number;
  usuario: { id: number; nombre: string; apellido: string };
  especialidades: { id: number; especialidad: EspecialidadDto }[];
}

// GET /clinicos/tipos-estudio/ (el back solo devuelve los activos).
interface TipoEstudioDto {
  id: number;
  nombre: string;
  descripcion: string | null;
  duracion_min: number | null;
}

/** Catálogo contra la API [R04, R19, R20]. */
@Injectable()
export class CatalogoHttpRepository implements CatalogoRepository {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  getEspecialidades(): Observable<Especialidad[]> {
    return this.http
      .get<EspecialidadDto[]>(`${this.apiUrl}/profesionales/especialidades/`)
      .pipe(map((dtos) => dtos.map(aEspecialidad)));
  }

  getProfesionales(fecha?: string): Observable<Profesional[]> {
    const pedido = fecha
      ? this.http
          .get<{ profesionales: ProfesionalDto[] }>(`${this.apiUrl}/turnos/turnos/profesionales-disponibles/`, { params: { fecha } })
          .pipe(map((r) => r.profesionales))
      : this.http.get<ProfesionalDto[]>(`${this.apiUrl}/profesionales/profesionales/`);
    return pedido.pipe(map((dtos) => dtos.map(aProfesional)));
  }

  getTiposEstudio(): Observable<TipoEstudio[]> {
    return this.http
      .get<TipoEstudioDto[]>(`${this.apiUrl}/clinicos/tipos-estudio/`)
      .pipe(map((dtos) => dtos.map((t) => ({ id: t.id, nombre: t.nombre, descripcion: t.descripcion ?? '', duracionMin: t.duracion_min }))));
  }
}

function aEspecialidad(dto: EspecialidadDto): Especialidad {
  return { id: dto.id, nombre: dto.nombre, descripcion: dto.descripcion ?? '' };
}

function aProfesional(dto: ProfesionalDto): Profesional {
  return {
    id: dto.id,
    nombre: dto.usuario.nombre,
    apellido: dto.usuario.apellido,
    especialidades: dto.especialidades.map((pe) => ({ id: pe.especialidad.id, nombre: pe.especialidad.nombre })),
  };
}
