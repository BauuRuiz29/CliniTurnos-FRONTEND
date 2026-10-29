import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PacientesHttpRepository } from './pacientes.repository.http';

// Paciente asignado (`profesional_pacientes`) con lo que muestra la tabla.
export interface PacienteAsignado {
  id: number; // paciente_id
  nombre: string;
  apellido: string;
  numIdentificacion: string;
  telefono: string | null;
  ultimaConsulta: string | null; // yyyy-MM-dd del último turno FINALIZADO
  ultimoTurnoId: number | null;
}

/** Pacientes del profesional [R14]. El back solo devuelve los asignados al profesional de la sesión [Rnf 01]. */
@Injectable({ providedIn: 'root', useClass: PacientesHttpRepository })
export abstract class PacientesRepository {
  abstract listar(): Observable<PacienteAsignado[]>;
}
