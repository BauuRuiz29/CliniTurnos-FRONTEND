import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Genero, TipoDocumento } from '../../../../core/models/enums';
import type { Alergia, Medicacion } from '../../../../core/models/historia-clinica';
import { MisDatosHttpRepository } from './mis-datos.repository.http';

// GET /users/me/ (usuario + `paciente` anidado) y las listas de su historia clínica.
export interface DatosPaciente {
  nombre: string;
  apellido: string;
  genero: Genero;
  tipoIdentificacion: TipoDocumento;
  numIdentificacion: string;
  fechaNacimiento: string; // yyyy-mm-dd
  telefono: string;
  correo: string;
  login: string;
  obraSocialId: number | null; // null = Particular
  grupoSanguineo: string | null;
  contactoEmergenciaNombre: string | null;
  contactoEmergenciaNumero: string | null;
  alergias: Alergia[];
  medicaciones: Medicacion[]; // solo las activas: las inactivas no se muestran
}

// Lo que el paciente puede modificar por PATCH /users/me/. Usuario y documento identifican la cuenta;
// alergias y medicación son de solo lectura para el paciente.
export type DatosPacienteEditables = Omit<DatosPaciente, 'login' | 'tipoIdentificacion' | 'numIdentificacion' | 'alergias' | 'medicaciones'>;

/** Datos del paciente logueado [R03, CU03]. */
@Injectable({ providedIn: 'root', useClass: MisDatosHttpRepository })
export abstract class MisDatosRepository {
  abstract obtener(): Observable<DatosPaciente>;
  /** Devuelve los datos como quedaron guardados. */
  abstract guardar(datos: DatosPacienteEditables): Observable<DatosPaciente>;
}
