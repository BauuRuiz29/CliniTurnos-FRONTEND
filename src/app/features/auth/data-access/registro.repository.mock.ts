import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import type { RegistroRepository } from './registro.repository';

//despues implementar el backend, ahora es solo visual
@Injectable()
export class RegistroMockRepository implements RegistroRepository {
  registrar(): Observable<void> {
    return of(undefined).pipe(delay(400));
  }
}
