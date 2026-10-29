import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import type { EstadoEstudio } from '../../../../core/models/enums';
import { InformesHttpRepository } from './informes.repository.http';

// Informe de una consulta finalizada: `consultas` + nombre del profesional + especialidad del turno + adjuntos.
export interface InformeMedico {
  id: number; // consulta_id
  turnoId: number;
  fecha: string; // yyyy-MM-dd, del turno
  profesional: string; // nombre y apellido, sin título
  especialidad: string | null; // null: el turno no tiene especialidad
  diagnostico: string;
  planTratamiento: string | null;
  indicaciones: string | null;
  adjuntos: AdjuntoInformeMedico[];
}

export interface AdjuntoInformeMedico {
  id: number; // documento_id
  titulo: string;
  url: string | null; // archivo_url: de donde se descarga
}

// Fila de `estudios` del paciente + nombre del tipo de estudio [R10, R20].
export interface EstudioPaciente {
  id: number; // estudio_id
  nombre: string; // tipos_estudio.nombre
  fechaSolicitud: string; // yyyy-MM-dd
  estado: EstadoEstudio;
}

/** Informes médicos del paciente [R10]. El back solo devuelve los del paciente de la sesión [Rnf 01]. */
@Injectable({ providedIn: 'root', useClass: InformesHttpRepository })
export abstract class InformesRepository {
  /** Solo informes cargados: un turno cerrado con el informe pendiente todavía no aparece. */
  abstract listar(): Observable<InformeMedico[]>;
  /** null si no existe o no es del paciente. */
  abstract obtener(id: number): Observable<InformeMedico | null>;
  abstract descargar(adjunto: AdjuntoInformeMedico): Observable<Blob>;
  /** Estudios del paciente de la sesión, en cualquier estado. */
  abstract listarEstudios(): Observable<EstudioPaciente[]>;
}
