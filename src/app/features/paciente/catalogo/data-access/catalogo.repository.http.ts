import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_URL } from '../../../../core/config/tokens';
import { Especialidad, Profesional, TipoEstudio } from './catalogo.models';
import type { CatalogoRepository } from './catalogo.repository';
import { CatalogoMockRepository } from './catalogo.repository.mock';

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

/** Catálogo contra la API [R04, R19]. */
@Injectable()
export class CatalogoHttpRepository implements CatalogoRepository {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);
  // TODO: tipos de estudio quedan en mock (el back no tiene categoría ni preparación).
  private readonly mock = new CatalogoMockRepository();

  getEspecialidades(): Observable<Especialidad[]> {
    return this.http
      .get<EspecialidadDto[]>(`${this.apiUrl}/profesionales/especialidades/`)
      .pipe(map((dtos) => dtos.map(aEspecialidad)));
  }

  getProfesionales(): Observable<Profesional[]> {
    return this.http
      .get<ProfesionalDto[]>(`${this.apiUrl}/profesionales/profesionales/`)
      .pipe(map((dtos) => dtos.map(aProfesional)));
  }

  getTiposEstudio(): Observable<TipoEstudio[]> {
    return this.mock.getTiposEstudio();
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
