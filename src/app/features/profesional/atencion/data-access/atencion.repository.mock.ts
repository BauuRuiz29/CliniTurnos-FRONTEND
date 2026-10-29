import { Injectable, inject } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { EstadoTurno } from '../../../../core/models/enums';
import { puedeTransicionar } from '../../../../core/models/turno-estado';
import { DEMORA_MS, FilaConsulta, ProfesionalMockDb } from '../../data-access/profesional.mock-db';
import type { AdjuntoInforme, AtencionRepository, DatosInforme, InformeConsulta } from './atencion.repository';
import { informeCompleto } from './atencion.repository';

@Injectable()
export class AtencionMockRepository implements AtencionRepository {
  private readonly db = inject(ProfesionalMockDb);

  obtener(turnoId: number): Observable<InformeConsulta | null> {
    const consulta = this.db.consultas.find((c) => c.turnoId === turnoId);
    return of(consulta ? copia(consulta) : null).pipe(delay(DEMORA_MS));
  }

  // Como el back: se puede guardar con la consulta abierta o ya cerrada (informe pendiente).
  guardar(consultaId: number, datos: DatosInforme): Observable<InformeConsulta> {
    const consulta = this.db.consultas.find((c) => c.id === consultaId);
    if (!consulta) return throwError(() => new Error('La consulta no existe.')).pipe(delay(DEMORA_MS));
    Object.assign(consulta, datos);
    return of(copia(consulta)).pipe(delay(DEMORA_MS));
  }

  // EN_CURSO → FINALIZADO, con o sin informe [AGENTS §4.2].
  cerrar(consultaId: number): Observable<InformeConsulta> {
    const consulta = this.db.consultas.find((c) => c.id === consultaId);
    const turno = this.db.turnos.find((t) => t.id === consulta?.turnoId);
    if (!consulta || !turno || !puedeTransicionar(turno.estado, EstadoTurno.FINALIZADO)) {
      return throwError(() => new Error('La consulta no está en curso.')).pipe(delay(DEMORA_MS));
    }
    consulta.finalizada = true;
    turno.estado = EstadoTurno.FINALIZADO;
    return of(copia(consulta)).pipe(delay(DEMORA_MS));
  }

  adjuntar(consultaId: number, archivo: File): Observable<AdjuntoInforme> {
    const consulta = this.db.consultas.find((c) => c.id === consultaId);
    if (!consulta || informeCompleto(consulta)) return throwError(() => new Error('No se puede adjuntar.')).pipe(delay(DEMORA_MS));
    const adjunto = { id: this.db.nuevoId(), titulo: archivo.name, url: null };
    consulta.adjuntos.push(adjunto);
    return of({ ...adjunto }).pipe(delay(DEMORA_MS));
  }

  quitarAdjunto(consultaId: number, adjuntoId: number): Observable<void> {
    const consulta = this.db.consultas.find((c) => c.id === consultaId);
    if (consulta && !informeCompleto(consulta)) consulta.adjuntos = consulta.adjuntos.filter((a) => a.id !== adjuntoId);
    return of(undefined).pipe(delay(DEMORA_MS));
  }

  // Sin back no hay archivo real: devuelve un texto con el nombre.
  descargar(adjunto: AdjuntoInforme): Observable<Blob> {
    return of(new Blob([adjunto.titulo], { type: 'text/plain' })).pipe(delay(DEMORA_MS));
  }
}

function copia(c: FilaConsulta): InformeConsulta {
  return { ...c, adjuntos: c.adjuntos.map((a) => ({ ...a })) };
}
