import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import type { ObraSocial, ObrasSocialesRepository } from './obras-sociales.repository';

// Datos ficticios hasta conectar el back.
@Injectable()
export class ObrasSocialesMockRepository implements ObrasSocialesRepository {
  listar(): Observable<ObraSocial[]> {
    return of(['OSDE 210', 'Swiss Medical', 'Galeno', 'IOMA', 'PAMI'].map((nombre, i) => ({ id: i + 1, nombre })));
  }
}
