import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, throwError } from 'rxjs';
import { API_URL } from '../../../../core/config/tokens';
import { EstadoEstudio, EstadoTurno } from '../../../../core/models/enums';
import { TurnoDto } from '../../../../core/models/turno.dto';
import type { AdjuntoInformeMedico, EstudioPaciente, InformeMedico, InformesRepository } from './informes.repository';

// GET /clinicos/historias-clinicas/: al paciente le devuelve solo la suya, con `informes` = consultas FINALIZADAS.
interface HistoriaClinicaDto {
  informes: {
    id: number;
    turno: number;
    fecha_turno: string;
    profesional_nombre: string | null;
    diagnostico: string | null;
    plan_tratamiento: string | null;
    indicaciones: string | null;
  }[];
}

// GET /clinicos/documentos/: al paciente le devuelve los de su historia o sus turnos.
interface DocumentoDto {
  id: number;
  consulta: number | null;
  nombre: string;
  archivo_url: string | null;
}

// GET /clinicos/estudios/: al paciente le devuelve solo los suyos.
interface EstudioDto {
  id: number;
  tipo_estudio_nombre: string;
  fecha_solicitud: string; // ISO
  estado: EstadoEstudio;
}

/** Informes médicos del paciente contra la API [R10]. */
@Injectable()
export class InformesHttpRepository implements InformesRepository {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  // La especialidad no viene en el informe: sale del turno de la consulta.
  listar(): Observable<InformeMedico[]> {
    return forkJoin({
      historias: this.http.get<HistoriaClinicaDto[]>(`${this.apiUrl}/clinicos/historias-clinicas/`),
      documentos: this.http.get<DocumentoDto[]>(`${this.apiUrl}/clinicos/documentos/`),
      turnos: this.http.get<TurnoDto[]>(`${this.apiUrl}/turnos/turnos/`, { params: { estado: EstadoTurno.FINALIZADO } }),
    }).pipe(
      map(({ historias, documentos, turnos }) =>
        (historias[0]?.informes ?? [])
          // Sin diagnóstico el informe está pendiente: el médico cerró el turno y lo carga después.
          .filter((i) => !!i.diagnostico?.trim())
          .map((i) => ({
            id: i.id,
            turnoId: i.turno,
            fecha: i.fecha_turno,
            profesional: i.profesional_nombre ?? '',
            especialidad: turnos.find((t) => t.id === i.turno)?.especialidad_nombre ?? null,
            diagnostico: i.diagnostico!,
            planTratamiento: i.plan_tratamiento,
            indicaciones: i.indicaciones,
            adjuntos: documentos.filter((d) => d.consulta === i.id).map(aAdjunto),
          })),
      ),
    );
  }

  obtener(id: number): Observable<InformeMedico | null> {
    return this.listar().pipe(map((informes) => informes.find((i) => i.id === id) ?? null));
  }

  // /media/ es del mismo servidor; se pide como Blob para descargarlo con su nombre.
  descargar(adjunto: AdjuntoInformeMedico): Observable<Blob> {
    if (!adjunto.url) return throwError(() => new Error('El adjunto no tiene archivo.'));
    return this.http.get(adjunto.url, { responseType: 'blob' });
  }

  listarEstudios(): Observable<EstudioPaciente[]> {
    return this.http.get<EstudioDto[]>(`${this.apiUrl}/clinicos/estudios/`).pipe(
      map((dtos) => dtos.map((e) => ({ id: e.id, nombre: e.tipo_estudio_nombre, fechaSolicitud: e.fecha_solicitud.slice(0, 10), estado: e.estado }))),
    );
  }
}

function aAdjunto(d: DocumentoDto): AdjuntoInformeMedico {
  return { id: d.id, titulo: d.nombre, url: d.archivo_url };
}
