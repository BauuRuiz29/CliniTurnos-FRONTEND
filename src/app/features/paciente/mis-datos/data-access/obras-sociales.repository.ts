import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ObrasSocialesMockRepository } from './obras-sociales.repository.mock';

// Tabla `obras_sociales` del DER.
export interface ObraSocial {
  id: number;
  nombre: string;
}

@Injectable({ providedIn: 'root', useClass: ObrasSocialesMockRepository })
export abstract class ObrasSocialesRepository {
  abstract listar(): Observable<ObraSocial[]>;
}
