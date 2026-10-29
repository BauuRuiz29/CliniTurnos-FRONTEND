import { Injectable, inject } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { VENTANA_CANCELACION_HORAS } from '../../../../core/config/tokens';
import type { Disponibilidad } from '../../../../core/models/disponibilidad';
import { EstadoTurno } from '../../../../core/models/enums';
import { dentroDeVentanaCancelacion, puedeTransicionar } from '../../../../core/models/turno-estado';
import { isoLocal } from '../../../../shared/utils/calendario';
import { DEMORA_MS, FilaTurno, ProfesionalMockDb } from '../../data-access/profesional.mock-db';
import type { AgendaRepository, FichaPaciente, TurnoProfesional } from './agenda.repository';

// Cada llamada devuelve copias del estado actual: el front no cachea [Rnf 08].
@Injectable()
export class AgendaMockRepository implements AgendaRepository {
  private readonly db = inject(ProfesionalMockDb);
  private readonly ventanaHoras = inject(VENTANA_CANCELACION_HORAS);

  listar(): Observable<TurnoProfesional[]> {
    return responder(this.db.turnos.filter((t) => t.pacienteId !== null).map((t) => this.aTurno(t)));
  }

  obtener(id: number): Observable<TurnoProfesional | null> {
    const fila = this.fila(id);
    return responder(fila && fila.pacienteId !== null ? this.aTurno(fila) : null);
  }

  ficha(pacienteId: number): Observable<FichaPaciente> {
    const p = this.db.pacientes.find((x) => x.id === pacienteId);
    return responder({ alergias: [...(p?.alergias ?? [])], medicaciones: [...(p?.medicaciones ?? [])] });
  }

  iniciar(id: number): Observable<TurnoProfesional> {
    const fila = this.fila(id);
    if (!fila || !puedeTransicionar(fila.estado, EstadoTurno.EN_CURSO)) return fallar('El turno no se puede iniciar.');
    fila.estado = EstadoTurno.EN_CURSO;
    if (!this.db.consultas.some((c) => c.turnoId === id)) {
      this.db.consultas.push({ id: this.db.nuevoId(), turnoId: id, diagnostico: null, planTratamiento: null, indicaciones: null, finalizada: false, adjuntos: [] });
    }
    return responder(this.aTurno(fila));
  }

  cancelar(id: number): Observable<TurnoProfesional> {
    const fila = this.fila(id);
    if (!fila || !this.modificable(fila)) return fallar('El turno no se puede cancelar.');
    this.liberar(fila);
    return responder(this.aTurno(fila));
  }

  disponibilidad(): Observable<Disponibilidad> {
    return responder({
      horarios: this.db.horarios.filter((h) => h.activo).map(({ diaSemana, horaDesde, horaHasta, duracionTurnosMin }) => ({ diaSemana, horaDesde, horaHasta, duracionTurnosMin })),
      bloqueos: this.db.bloqueos.map(({ fechaDesde, fechaHasta, motivo }) => ({ fechaDesde, fechaHasta, motivo })),
      slots: this.db.turnos
        .filter((t) => t.fecha >= isoLocal(new Date()) && t.estado !== EstadoTurno.CANCELADO)
        .map(({ id, fecha, horaInicio, horaFin, estado }) => ({ turnoId: id, fecha, horaInicio, horaFin, estado })),
    });
  }

  reprogramar(id: number, nuevoTurnoId: number): Observable<TurnoProfesional> {
    const original = this.fila(id);
    const nuevo = this.fila(nuevoTurnoId);
    const bloqueado = nuevo && this.db.bloqueos.some((b) => `${nuevo.fecha}T${nuevo.horaInicio}` < b.fechaHasta && `${nuevo.fecha}T${nuevo.horaFin}` > b.fechaDesde);
    if (!original || !this.modificable(original)) return fallar('El turno ya no se puede reprogramar.');
    if (!nuevo || nuevo.estado !== EstadoTurno.DISPONIBLE || bloqueado) return fallar('El horario elegido ya no está disponible.');

    Object.assign(nuevo, { estado: EstadoTurno.RESERVADO, pacienteId: original.pacienteId, comentario: original.comentario, tipoTurno: original.tipoTurno });
    this.liberar(original);
    return responder(this.aTurno(nuevo));
  }

  // RESERVADO → CANCELADO; la franja vuelve a quedar DISPONIBLE sin paciente [AGENTS §4.2].
  // Acá se conserva la fila cancelada para el historial y se agrega la franja libre.
  private liberar(fila: FilaTurno): void {
    fila.estado = EstadoTurno.CANCELADO;
    this.db.turnos.push({ ...fila, id: this.db.nuevoId(), estado: EstadoTurno.DISPONIBLE, pacienteId: null, comentario: null });
  }

  private modificable(fila: FilaTurno): boolean {
    return puedeTransicionar(fila.estado, EstadoTurno.CANCELADO) && dentroDeVentanaCancelacion(fila.fecha, fila.horaInicio, new Date(), this.ventanaHoras);
  }

  private fila(id: number): FilaTurno | undefined {
    return this.db.turnos.find((t) => t.id === id);
  }

  private aTurno(fila: FilaTurno): TurnoProfesional {
    const { alergias, medicaciones, ...paciente } = this.db.pacientes.find((p) => p.id === fila.pacienteId)!;
    return {
      id: fila.id,
      fecha: fila.fecha,
      horaInicio: fila.horaInicio,
      horaFin: fila.horaFin,
      estado: fila.estado,
      tipoTurno: fila.tipoTurno,
      especialidad: this.db.perfil.especialidades[0] ?? null,
      comentario: fila.comentario,
      paciente: { ...paciente },
      consultaId: this.db.consultas.find((c) => c.turnoId === fila.id)?.id ?? null,
      informePendiente: fila.estado === EstadoTurno.FINALIZADO && this.db.consultas.some((c) => c.turnoId === fila.id && !c.diagnostico),
    };
  }
}

function responder<T>(valor: T): Observable<T> {
  return of(valor).pipe(delay(DEMORA_MS));
}

function fallar(mensaje: string): Observable<never> {
  return throwError(() => new Error(mensaje)).pipe(delay(DEMORA_MS));
}
