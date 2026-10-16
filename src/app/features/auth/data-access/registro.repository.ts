import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Genero, TipoDocumento } from '../../../core/models/enums';
import { RegistroMockRepository } from './registro.repository.mock';

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

//Alta de pacientes. 

@Injectable({ providedIn: 'root', useClass: RegistroMockRepository })
export abstract class RegistroRepository {
  abstract registrar(datos: RegistroPaciente): Observable<void>;
}
