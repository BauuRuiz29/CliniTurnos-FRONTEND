import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Especialidad, Profesional, TipoEstudio } from './catalogo.models';
import { CatalogoMockRepository } from './catalogo.repository.mock';

/**
 * De dónde vienen los datos del catálogo. Hoy: mock.
 * Para conectar el back, crear `CatalogoHttpRepository` y cambiar `useClass`.
 */
@Injectable({ providedIn: 'root', useClass: CatalogoMockRepository })
export abstract class CatalogoRepository {
  abstract getEspecialidades(): Observable<Especialidad[]>;
  abstract getProfesionales(): Observable<Profesional[]>;
  abstract getTiposEstudio(): Observable<TipoEstudio[]>;
}
