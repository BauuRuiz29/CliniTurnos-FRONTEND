import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, of, switchMap, throwError } from 'rxjs';
import { ConsultaDto, ProfesionalApi } from '../../data-access/profesional-api';
import type { AdjuntoInforme, AtencionRepository, DatosInforme, InformeConsulta } from './atencion.repository';

// GET/POST /clinicos/documentos/ (solo lo que se usa).
interface DocumentoDto {
  id: number;
  nombre: string;
  archivo_url: string | null;
}

/** Informe de la atención contra la API [R13, R14]. */
@Injectable()
export class AtencionHttpRepository implements AtencionRepository {
  private readonly api = inject(ProfesionalApi);
  private readonly http = inject(HttpClient);
  private readonly url = `${this.api.url}/clinicos`;

  // El back no filtra consultas por turno: se busca entre las del médico.
  obtener(turnoId: number): Observable<InformeConsulta | null> {
    return this.api.consultas().pipe(
      switchMap((consultas) => {
        const consulta = consultas.find((c) => c.turno === turnoId);
        return consulta ? this.conAdjuntos(consulta) : of(null);
      }),
    );
  }

  // El back acepta el PATCH aunque la consulta ya esté cerrada: así se completa un informe pendiente.
  guardar(consultaId: number, d: DatosInforme): Observable<InformeConsulta> {
    const cuerpo = { diagnostico: d.diagnostico, plan_tratamiento: d.planTratamiento || null, indicaciones: d.indicaciones || null };
    return this.http.patch<ConsultaDto>(`${this.url}/consultas/${consultaId}/`, cuerpo).pipe(switchMap((c) => this.conAdjuntos(c)));
  }

  // El back pasa consulta y turno a FINALIZADO.
  cerrar(consultaId: number): Observable<InformeConsulta> {
    return this.http
      .post<{ consulta: ConsultaDto }>(`${this.url}/consultas/${consultaId}/finalizar/`, {})
      .pipe(switchMap((r) => this.conAdjuntos(r.consulta)));
  }

  // /media/ es del mismo servidor; se pide como Blob para descargarlo con su nombre.
  descargar(adjunto: AdjuntoInforme): Observable<Blob> {
    if (!adjunto.url) return throwError(() => new Error('El adjunto no tiene archivo.'));
    return this.http.get(adjunto.url, { responseType: 'blob' });
  }

  // multipart/form-data. Se asocia también al turno para que el paciente lo vea entre sus documentos.
  adjuntar(consultaId: number, archivo: File): Observable<AdjuntoInforme> {
    return this.http.get<ConsultaDto>(`${this.url}/consultas/${consultaId}/`).pipe(
      switchMap((consulta) => {
        const datos = new FormData();
        datos.append('consulta', String(consultaId));
        datos.append('turno', String(consulta.turno));
        datos.append('nombre', archivo.name);
        datos.append('archivo', archivo);
        return this.http.post<DocumentoDto>(`${this.url}/documentos/`, datos);
      }),
      map(aAdjunto),
    );
  }

  quitarAdjunto(_consultaId: number, adjuntoId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/documentos/${adjuntoId}/`);
  }

  private conAdjuntos(c: ConsultaDto): Observable<InformeConsulta> {
    return forkJoin({ docs: this.http.get<DocumentoDto[]>(`${this.url}/documentos/`, { params: { consulta: c.id } }) }).pipe(
      map(({ docs }) => ({
        id: c.id,
        turnoId: c.turno,
        diagnostico: c.diagnostico,
        planTratamiento: c.plan_tratamiento,
        indicaciones: c.indicaciones,
        finalizada: c.estado === 'FINALIZADA',
        adjuntos: docs.map(aAdjunto),
      })),
    );
  }
}

function aAdjunto(d: DocumentoDto): AdjuntoInforme {
  return { id: d.id, titulo: d.nombre, url: d.archivo_url };
}
