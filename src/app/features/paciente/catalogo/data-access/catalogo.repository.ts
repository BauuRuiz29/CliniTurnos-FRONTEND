import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Especialidad, Profesional, TipoEstudio } from './catalogo.models';
import { CatalogoHttpRepository } from './catalogo.repository.http';

/**
 * De dónde vienen los datos del catálogo: la API (`CatalogoHttpRepository`).
 * Para volver a datos de prueba, cambiar `useClass` por `CatalogoMockRepository`.
 */
@Injectable({ providedIn: 'root', useClass: CatalogoHttpRepository })
export abstract class CatalogoRepository {
  abstract getEspecialidades(): Observable<Especialidad[]>;
  abstract getProfesionales(): Observable<Profesional[]>;
  abstract getTiposEstudio(): Observable<TipoEstudio[]>;
}
