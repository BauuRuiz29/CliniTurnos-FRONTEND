import { Injectable } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { EstadoTurno, TipoTurno } from '../../../../core/models/enums';
import { DIAS_SEMANA, VENTANA_DIAS, isoLocal, sumarDias } from '../calendario';
import type {
  Disponibilidad,
  FechaBloqueada,
  HorarioMedico,
  ProfesionalReserva,
  ReservarTurnoRepository,
  Slot,
  SolicitudReserva,
  TurnoReservado,
} from './reservar-turno.repository';
import { SlotNoDisponibleError } from './reservar-turno.repository';

//#region DATOS FORZADOS
// TODO: reemplazar por el back. Mismos ids que el catálogo para que los links funcionen.
const DEMORA_MS = 200;

const CENTRO = { nombre: 'Clínica Centro', direccion: 'Av. Siempre Viva 123, CABA' };
const NORTE = { nombre: 'Clínica Norte', direccion: 'Av. Córdoba 456, CABA' };

const PROFESIONALES: ProfesionalReserva[] = [
  { id: 1, titulo: 'Dr.', nombre: 'Juan', apellido: 'García', especialidad: { id: 1, nombre: 'Cardiología' }, lugar: CENTRO },
  { id: 2, titulo: 'Dra.', nombre: 'María', apellido: 'López', especialidad: { id: 2, nombre: 'Dermatología' }, lugar: NORTE },
  { id: 3, titulo: 'Dr.', nombre: 'Pablo', apellido: 'Sánchez', especialidad: { id: 5, nombre: 'Traumatología' }, lugar: CENTRO },
];

const HORARIOS: Record<number, HorarioMedico[]> = {
  1: [
    { diaSemana: 'LUNES', horaDesde: '08:00', horaHasta: '12:00', duracionTurnosMin: 30 },
    { diaSemana: 'MIERCOLES', horaDesde: '08:00', horaHasta: '12:00', duracionTurnosMin: 30 },
    { diaSemana: 'VIERNES', horaDesde: '09:00', horaHasta: '13:00', duracionTurnosMin: 30 },
  ],
  2: [
    { diaSemana: 'MARTES', horaDesde: '09:00', horaHasta: '13:00', duracionTurnosMin: 20 },
    { diaSemana: 'JUEVES', horaDesde: '09:00', horaHasta: '13:00', duracionTurnosMin: 20 },
  ],
  3: (['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'] as const).map((diaSemana) => ({
    diaSemana, horaDesde: '10:00', horaHasta: '12:00', duracionTurnosMin: 30,
  })),
};
//#endregion

interface FilaTurno extends Slot {
  pacienteId: number | null;
  especialidadId: number | null;
  tipoTurno: TipoTurno;
  comentario: string | null;
}

interface Agenda {
  bloqueos: FechaBloqueada[];
  turnos: FilaTurno[];
  disputadoId: number | null; // simula que otro paciente lo reserva mientras confirmás
}

// En el back sale del JWT; acá es el paciente de la sesión simulada.
const PACIENTE_SESION_ID = 1;

// "Base" en memoria. El front no cachea nada: cada llamada devuelve copias del estado actual [Rnf 08].
@Injectable()
export class ReservarTurnoMockRepository implements ReservarTurnoRepository {
  private sigId = 1;
  private readonly agendas = new Map<number, Agenda>();

  obtenerProfesional(id: number): Observable<ProfesionalReserva | null> {
    return of(PROFESIONALES.find((p) => p.id === id) ?? null).pipe(delay(DEMORA_MS));
  }

  obtenerDisponibilidad(profesionalId: number): Observable<Disponibilidad> {
    const agenda = this.agenda(profesionalId);
    return of({
      horarios: [...(HORARIOS[profesionalId] ?? [])],
      bloqueos: [...agenda.bloqueos],
      slots: agenda.turnos.map(({ turnoId, fecha, horaInicio, horaFin, estado }) => ({ turnoId, fecha, horaInicio, horaFin, estado })),
    }).pipe(delay(DEMORA_MS));
  }

  reservar(solicitud: SolicitudReserva): Observable<TurnoReservado> {
    for (const [profesionalId, agenda] of this.agendas) {
      const fila = agenda.turnos.find((t) => t.turnoId === solicitud.turnoId);
      if (!fila) continue;

      if (agenda.disputadoId === fila.turnoId) {
        fila.estado = EstadoTurno.RESERVADO;
        fila.pacienteId = 999;
        agenda.disputadoId = null;
      }
      // Única transición válida al reservar [AGENTS §4.2].
      if (fila.estado !== EstadoTurno.DISPONIBLE) {
        return throwError(() => new SlotNoDisponibleError()).pipe(delay(DEMORA_MS));
      }
      Object.assign(fila, {
        estado: EstadoTurno.RESERVADO,
        pacienteId: PACIENTE_SESION_ID,
        especialidadId: solicitud.especialidadId,
        tipoTurno: TipoTurno.CONSULTA,
        comentario: solicitud.comentario,
      });
      const p = PROFESIONALES.find((x) => x.id === profesionalId)!;
      return of({
        turnoId: fila.turnoId,
        fecha: fila.fecha,
        horaInicio: fila.horaInicio,
        profesional: `${p.titulo} ${p.nombre} ${p.apellido}`,
        especialidad: p.especialidad.nombre,
        lugar: p.lugar,
      }).pipe(delay(DEMORA_MS));
    }
    return throwError(() => new SlotNoDisponibleError()).pipe(delay(DEMORA_MS));
  }

  // Simula la generación de slots del back a partir de horarios_medico, con bloqueos y reservas de ejemplo.
  private agenda(profesionalId: number): Agenda {
    const existente = this.agendas.get(profesionalId);
    if (existente) return existente;

    const horarios = HORARIOS[profesionalId] ?? [];
    const hoy = new Date();
    const dias: { fecha: string; horario: HorarioMedico }[] = [];
    for (let i = 0; i <= VENTANA_DIAS; i++) {
      const d = sumarDias(hoy, i);
      const horario = horarios.find((h) => h.diaSemana === DIAS_SEMANA[d.getDay()]);
      if (horario) dias.push({ fecha: isoLocal(d), horario });
    }

    const bloqueos: FechaBloqueada[] = [];
    if (dias[2]) bloqueos.push({ fechaDesde: `${dias[2].fecha}T00:00`, fechaHasta: `${dias[2].fecha}T23:59`, motivo: 'Congreso' });
    if (dias[1]) bloqueos.push({ fechaDesde: `${dias[1].fecha}T${dias[1].horario.horaDesde}`, fechaHasta: `${dias[1].fecha}T${sumarMinutos(dias[1].horario.horaDesde, 60)}`, motivo: 'Trámite' });
    const diaCompleto = dias[4]?.fecha; // todos sus slots RESERVADO

    const turnos: FilaTurno[] = [];
    for (const { fecha, horario } of dias) {
      for (let ini = horario.horaDesde; ini < horario.horaHasta; ini = sumarMinutos(ini, horario.duracionTurnosMin)) {
        const horaFin = sumarMinutos(ini, horario.duracionTurnosMin);
        const enBloqueo = bloqueos.some((b) => `${fecha}T${ini}` < b.fechaHasta && `${fecha}T${horaFin}` > b.fechaDesde);
        const reservado = fecha === diaCompleto || turnos.length % 3 === 1;
        turnos.push({
          turnoId: this.sigId++, fecha, horaInicio: ini, horaFin,
          estado: enBloqueo ? EstadoTurno.BLOQUEADO : reservado ? EstadoTurno.RESERVADO : EstadoTurno.DISPONIBLE,
          pacienteId: reservado && !enBloqueo ? 999 : null,
          especialidadId: null, tipoTurno: TipoTurno.CONSULTA, comentario: null,
        });
      }
    }

    const disputado = turnos.find((t) => t.estado === EstadoTurno.DISPONIBLE && t.horaInicio === '10:00' && t.fecha > isoLocal(hoy));
    const agenda = { bloqueos, turnos, disputadoId: disputado?.turnoId ?? null };
    this.agendas.set(profesionalId, agenda);
    return agenda;
  }
}

function sumarMinutos(hora: string, minutos: number): string {
  const [h, m] = hora.split(':').map(Number);
  const total = h * 60 + m + minutos;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}
