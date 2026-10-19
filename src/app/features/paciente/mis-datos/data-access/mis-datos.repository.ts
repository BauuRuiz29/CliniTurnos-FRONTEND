import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Genero, TipoDocumento } from '../../../../core/models/enums';
import { MisDatosMockRepository } from './mis-datos.repository.mock';

// Campos de `usuarios` + `pacientes` del DER. Los opcionales son nullable en la base.
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
  grupoSanguineo: string | null;
  contactoEmergenciaNombre: string | null;
  contactoEmergenciaNumero: string | null;
  alergias: Alergia[];
  medicaciones: Medicacion[]; // solo las activas: las inactivas no se muestran
}

export type Severidad = 'LEVE' | 'MODERADA' | 'GRAVE';

export const SEVERIDADES: { valor: Severidad; texto: string }[] = [
  { valor: 'LEVE', texto: 'Leve' },
  { valor: 'MODERADA', texto: 'Moderada' },
  { valor: 'GRAVE', texto: 'Grave' },
];

// Tablas `alergias` y `medicaciones_habituales` (1-N de historias_clinicas). Sin id = fila nueva.
export interface Alergia {
  id?: number;
  descripcion: string;
  severidad: Severidad | null;
}

export interface Medicacion {
  id?: number;
  medicamento: string;
  dosis: string | null;
  frecuencia: string | null;
}

// Lo que el paciente puede modificar: usuario y documento identifican la cuenta y la historia clínica.
export type DatosPacienteEditables = Omit<DatosPaciente, 'login' | 'tipoIdentificacion' | 'numIdentificacion'>;

/** Datos del paciente logueado [R03, CU03]. */
@Injectable({ providedIn: 'root', useClass: MisDatosMockRepository })
export abstract class MisDatosRepository {
  abstract obtener(): Observable<DatosPaciente>;
  /** Las listas van completas: una medicación que ya no viene se marca inactiva. Devuelve los datos guardados (con ids nuevos). */
  abstract guardar(datos: DatosPacienteEditables): Observable<DatosPaciente>;
}
