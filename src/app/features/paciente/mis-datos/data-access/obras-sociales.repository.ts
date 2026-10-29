import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ObrasSocialesHttpRepository } from './obras-sociales.repository.http';

// Tabla `obras_sociales` del DER.
export interface ObraSocial {
  id: number;
  nombre: string;
}

@Injectable({ providedIn: 'root', useClass: ObrasSocialesHttpRepository })
export abstract class ObrasSocialesRepository {
  abstract listar(): Observable<ObraSocial[]>;
}
