import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LugarAtencion } from '../../../../core/models/lugar-atencion';
import { InformesMockRepository } from './informes.repository.mock';

// Informe de un turno pasado: tabla `consultas` + profesional/especialidad del turno + `documentos_clinicos` adjuntos.
export interface InformeMedico {
  id: number; // consulta_id
  turnoId: number;
  fecha: string; // yyyy-MM-dd, de fecha_consulta
  profesional: { id: number; nombre: string }; // nombre con título: "Dr. Juan García"
  especialidad: string;
  lugar: LugarAtencion;
  diagnostico: string | null;
  planTratamiento: string | null;
  indicaciones: string | null;
  adjuntos: { id: number; titulo: string }[]; // documento_id, titulo
}

/** Informes médicos del paciente [R10]. El back solo devuelve los del paciente de la sesión [Rnf 01]. */
@Injectable({ providedIn: 'root', useClass: InformesMockRepository })
export abstract class InformesRepository {
  abstract listar(): Observable<InformeMedico[]>;
  /** null si no existe o no es del paciente. */
  abstract obtener(id: number): Observable<InformeMedico | null>;
}
