import { formatDate } from '@angular/common';
import { Injectable } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { EstadoTurno } from '../../../../core/models/enums';
import type { TurnoPaciente, TurnosRepository } from './turnos.repository';

//#region DATOS FORZADOS
// TODO: reemplazar por el back. Fechas relativas a hoy para que siempre haya próximos y pasados.
const DEMORA_MS = 200;
const CENTRO = { nombre: 'Clínica Centro', direccion: 'Av. Siempre Viva 123, CABA' };
const NORTE = { nombre: 'Clínica Norte', direccion: 'Av. Córdoba 456, CABA' };
const GARCIA = { id: 1, nombre: 'Dr. Juan García' };
const LOPEZ = { id: 2, nombre: 'Dra. María López' };
const SANCHEZ = { id: 3, nombre: 'Dr. Pablo Sánchez' };

// Corre sábado y domingo al lunes: se atiende de lunes a viernes.
function enDias(dias: number): string {
  const d = new Date(Date.now() + dias * 86_400_000);
  const corrimiento = d.getDay() === 6 ? 2 : d.getDay() === 0 ? 1 : 0;
  return formatDate(d.getTime() + corrimiento * 86_400_000, 'yyyy-MM-dd', 'en-US');
}
// Dentro de 3 horas: cae adentro de las 24 h, así se ve la cancelación deshabilitada.
const pronto = new Date(Date.now() + 3 * 3_600_000);

const TURNOS: TurnoPaciente[] = [
  { id: 1, fecha: enDias(5), horaInicio: '10:30', horaFin: '11:00', estado: EstadoTurno.RESERVADO, profesional: GARCIA, especialidad: 'Cardiología', lugar: CENTRO, comentario: 'Control anual' },
  { id: 2, fecha: formatDate(pronto, 'yyyy-MM-dd', 'en-US'), horaInicio: formatDate(pronto, 'HH:00', 'en-US'), horaFin: formatDate(pronto, 'HH:20', 'en-US'), estado: EstadoTurno.RESERVADO, profesional: LOPEZ, especialidad: 'Dermatología', lugar: NORTE, comentario: null },
  { id: 3, fecha: enDias(12), horaInicio: '11:00', horaFin: '11:30', estado: EstadoTurno.RESERVADO, profesional: SANCHEZ, especialidad: 'Traumatología', lugar: CENTRO, comentario: 'Dolor de rodilla al correr' },
  { id: 4, fecha: enDias(-20), horaInicio: '09:00', horaFin: '09:30', estado: EstadoTurno.FINALIZADO, profesional: SANCHEZ, especialidad: 'Traumatología', lugar: CENTRO, comentario: null },
  { id: 5, fecha: enDias(-35), horaInicio: '15:20', horaFin: '15:40', estado: EstadoTurno.CANCELADO, profesional: LOPEZ, especialidad: 'Dermatología', lugar: NORTE, comentario: null },
  { id: 6, fecha: enDias(-60), horaInicio: '08:00', horaFin: '08:30', estado: EstadoTurno.AUSENTE, profesional: GARCIA, especialidad: 'Cardiología', lugar: CENTRO, comentario: null },
];
//#endregion

@Injectable()
export class TurnosMockRepository implements TurnosRepository {
  private readonly turnos = TURNOS.map((t) => ({ ...t }));

  listar(): Observable<TurnoPaciente[]> {
    return of(this.turnos.map((t) => ({ ...t }))).pipe(delay(DEMORA_MS));
  }

  obtener(id: number): Observable<TurnoPaciente | null> {
    const turno = this.turnos.find((t) => t.id === id);
    return of(turno ? { ...turno } : null).pipe(delay(DEMORA_MS));
  }

  cancelar(id: number): Observable<TurnoPaciente> {
    const turno = this.turnos.find((t) => t.id === id);
    if (!turno || turno.estado !== EstadoTurno.RESERVADO) {
      return throwError(() => new Error('El turno no se puede cancelar.')).pipe(delay(DEMORA_MS));
    }
    turno.estado = EstadoTurno.CANCELADO;
    return of({ ...turno }).pipe(delay(DEMORA_MS));
  }
}
