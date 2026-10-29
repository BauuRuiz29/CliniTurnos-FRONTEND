import { formatDate } from '@angular/common';
import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import type { AdjuntoInformeMedico, InformeMedico, InformesRepository } from './informes.repository';

//#region DATOS FORZADOS
// Para trabajar sin back. Fechas relativas a hoy; el de Sánchez es el turno FINALIZADO del mock de turnos.
const DEMORA_MS = 200;
const GARCIA = 'Juan García';
const LOPEZ = 'María López';
const SANCHEZ = 'Pablo Sánchez';

const haceDias = (dias: number) => formatDate(Date.now() - dias * 86_400_000, 'yyyy-MM-dd', 'en-US');

const INFORMES: InformeMedico[] = [
  {
    id: 1, turnoId: 4, fecha: haceDias(20), profesional: SANCHEZ, especialidad: 'Traumatología',
    diagnostico: 'Tendinitis rotuliana leve.',
    planTratamiento: 'Kinesiología 2 veces por semana durante 4 semanas.',
    indicaciones: 'Reposo deportivo y hielo 15 minutos después de la actividad.',
    adjuntos: [{ id: 1, titulo: 'Orden de kinesiología', url: null }],
  },
  {
    id: 2, turnoId: 7, fecha: haceDias(45), profesional: LOPEZ, especialidad: 'Dermatología',
    diagnostico: 'Dermatitis de contacto.',
    planTratamiento: 'Crema con corticoide por 7 días.',
    indicaciones: 'Evitar el contacto con detergentes. Control en 30 días.',
    adjuntos: [],
  },
  {
    id: 3, turnoId: 8, fecha: haceDias(90), profesional: GARCIA, especialidad: 'Cardiología',
    diagnostico: 'Sin hallazgos patológicos.',
    planTratamiento: null,
    indicaciones: 'Control anual.',
    adjuntos: [{ id: 2, titulo: 'Electrocardiograma', url: null }],
  },
];
//#endregion

@Injectable()
export class InformesMockRepository implements InformesRepository {
  listar(): Observable<InformeMedico[]> {
    return of(INFORMES.map((i) => ({ ...i }))).pipe(delay(DEMORA_MS));
  }

  obtener(id: number): Observable<InformeMedico | null> {
    const informe = INFORMES.find((i) => i.id === id);
    return of(informe ? { ...informe } : null).pipe(delay(DEMORA_MS));
  }

  // Sin back no hay archivo real: devuelve un texto con el nombre.
  descargar(adjunto: AdjuntoInformeMedico): Observable<Blob> {
    return of(new Blob([adjunto.titulo], { type: 'text/plain' })).pipe(delay(DEMORA_MS));
  }
}
