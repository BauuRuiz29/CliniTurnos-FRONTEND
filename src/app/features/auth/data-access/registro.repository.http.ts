import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { API_URL } from '../../../core/config/tokens';
import { RegistroInvalidoError } from './registro.errores';
import type { RegistroPaciente, RegistroRepository } from './registro.repository';

// Body de POST /users/registro/: usuario y paciente en el mismo nivel, en snake_case.
interface RegistroDto {
  login: string;
  password: string;
  nombre: string;
  apellido: string;
  genero: string;
  fecha_nacimiento: string;
  telefono: string;
  correo: string;
  tipo_identificacion: string;
  num_identificacion: string;
}

const CAMPO_DE_DTO: Record<keyof RegistroDto, keyof RegistroPaciente> = {
  login: 'login',
  password: 'password',
  nombre: 'nombre',
  apellido: 'apellido',
  genero: 'genero',
  fecha_nacimiento: 'fechaNacimiento',
  telefono: 'telefono',
  correo: 'correo',
  tipo_identificacion: 'tipoIdentificacion',
  num_identificacion: 'numIdentificacion',
};

@Injectable()
export class RegistroHttpRepository implements RegistroRepository {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  registrar(datos: RegistroPaciente): Observable<void> {
    return this.http.post(`${this.apiUrl}/users/registro/`, aDto(datos)).pipe(
      map(() => undefined),
      catchError((err: unknown) => throwError(() => (err instanceof HttpErrorResponse && err.status === 400 ? aError(err.error) : err))),
    );
  }
}

function aDto(d: RegistroPaciente): RegistroDto {
  return {
    login: d.login.trim(),
    password: d.password,
    nombre: d.nombre.trim(),
    apellido: d.apellido.trim(),
    genero: d.genero,
    fecha_nacimiento: d.fechaNacimiento,
    telefono: d.telefono.trim(),
    correo: d.correo.trim(),
    tipo_identificacion: d.tipoIdentificacion,
    num_identificacion: d.numIdentificacion.trim(),
  };
}

// DRF responde 400 con { campo: ["mensaje", ...] } o { non_field_errors: [...] }.
function aError(cuerpo: unknown): RegistroInvalidoError {
  const campos: Partial<Record<keyof RegistroPaciente, string>> = {};
  const generales: string[] = [];
  if (cuerpo && typeof cuerpo === 'object') {
    for (const [clave, valor] of Object.entries(cuerpo)) {
      const mensaje = Array.isArray(valor) ? String(valor[0]) : String(valor);
      const campo = CAMPO_DE_DTO[clave as keyof RegistroDto];
      if (campo) campos[campo] = mensaje;
      else generales.push(mensaje);
    }
  }
  return new RegistroInvalidoError(campos, generales);
}
