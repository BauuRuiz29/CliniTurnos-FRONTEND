import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import type { Alergia, Medicacion } from '../../../../core/models/historia-clinica';
import type { PacienteTurno } from '../../agenda/data-access/agenda.repository';
import { PacientesHttpRepository } from './pacientes.repository.http';

// Paciente asignado (`profesional_pacientes`) con lo que muestra la tabla.
export interface PacienteAsignado {
  id: number; // paciente_id
  nombre: string;
  apellido: string;
  numIdentificacion: string;
  telefono: string | null;
  ultimaConsulta: string | null; // yyyy-MM-dd del último turno FINALIZADO
}

// Ficha del paciente: datos personales (solo lectura) e historia clínica.
export interface HistoriaPaciente {
  paciente: PacienteTurno;
  historiaId: number;
  alergias: Alergia[];
  medicaciones: Medicacion[]; // solo las activas
}

// Sin id: todavía no existe en el back.
export type AlergiaEditable = Omit<Alergia, 'id'> & { id: number | null };
export type MedicacionEditable = Omit<Medicacion, 'id'> & { id: number | null };

/** Pacientes del profesional [R14]. El back solo devuelve los asignados al profesional de la sesión [Rnf 01]. */
@Injectable({ providedIn: 'root', useClass: PacientesHttpRepository })
export abstract class PacientesRepository {
  abstract listar(): Observable<PacienteAsignado[]>;
  abstract perfil(pacienteId: number): Observable<HistoriaPaciente>;
  /** Aplica las diferencias con `antes` y devuelve el perfil como quedó [R03]. */
  abstract guardarHistoria(
    antes: HistoriaPaciente,
    alergias: AlergiaEditable[],
    medicaciones: MedicacionEditable[],
  ): Observable<HistoriaPaciente>;
}
