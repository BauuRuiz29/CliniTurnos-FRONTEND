import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Genero, TipoDocumento } from '../../../core/models/enums';
import { RegistroHttpRepository } from './registro.repository.http';

//Campos de `usuarios` + `pacientes`
export interface RegistroPaciente {
  nombre: string;
  apellido: string;
  genero: Genero;
  tipoIdentificacion: TipoDocumento;
  numIdentificacion: string;
  fechaNacimiento: string; // yyyy-mm-dd
  telefono: string;
  correo: string;
  login: string;
  password: string;
}

export { RegistroInvalidoError } from './registro.errores';

/** Alta de pacientes [R01]. Falla con `RegistroInvalidoError` si el back rechaza algún dato. */
@Injectable({ providedIn: 'root', useClass: RegistroHttpRepository })
export abstract class RegistroRepository {
  abstract registrar(datos: RegistroPaciente): Observable<void>;
}
