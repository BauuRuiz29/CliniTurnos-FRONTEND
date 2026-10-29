import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AtencionHttpRepository } from './atencion.repository.http';

// Tabla `consultas` + adjuntos de `documentos_clinicos`.
export interface InformeConsulta {
  id: number; // consulta_id
  turnoId: number;
  diagnostico: string | null;
  planTratamiento: string | null;
  indicaciones: string | null;
  /** La consulta (y su turno) quedó cerrada. Puede estar cerrada con el informe todavía pendiente. */
  finalizada: boolean;
  adjuntos: AdjuntoInforme[];
}

export interface AdjuntoInforme {
  id: number; // documento_id
  titulo: string;
  url: string | null; // archivo_url: de donde se descarga
}

export interface DatosInforme {
  diagnostico: string;
  planTratamiento: string;
  indicaciones: string;
}

/** El informe está cargado cuando tiene diagnóstico; hasta entonces queda pendiente. */
export function informeCompleto(i: Pick<InformeConsulta, 'diagnostico'>): boolean {
  return !!i.diagnostico?.trim();
}

/** Informe médico de la atención [R13, R14]. */
@Injectable({ providedIn: 'root', useClass: AtencionHttpRepository })
export abstract class AtencionRepository {
  /** null si el turno todavía no tiene consulta (no se inició la atención). */
  abstract obtener(turnoId: number): Observable<InformeConsulta | null>;
  /** PATCH /clinicos/consultas/{id}/: guarda los textos del informe (también con la consulta ya cerrada). */
  abstract guardar(consultaId: number, datos: DatosInforme): Observable<InformeConsulta>;
  /** POST /clinicos/consultas/{id}/finalizar/: la consulta y el turno quedan FINALIZADO, con o sin informe. */
  abstract cerrar(consultaId: number): Observable<InformeConsulta>;
  /** POST /clinicos/documentos/ (multipart). */
  abstract adjuntar(consultaId: number, archivo: File): Observable<AdjuntoInforme>;
  abstract quitarAdjunto(consultaId: number, adjuntoId: number): Observable<void>;
  abstract descargar(adjunto: AdjuntoInforme): Observable<Blob>;
}
