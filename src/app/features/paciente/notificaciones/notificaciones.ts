import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Notificacion, TipoNotificacion } from '../../../core/models/notificacion';
import { NotificacionesRepository } from '../../../core/notificaciones/notificaciones';

// Mismos símbolos que las notificaciones del profesional.
const SIMBOLO: Record<TipoNotificacion, string> = {
  RESERVA: '▦',
  REPROGRAMACION: '▦',
  CANCELACION: '▦',
  RECORDATORIO: '◷',
};

/** Avisos de turnos del paciente [R09, R17]. */
@Component({
  imports: [DatePipe, RouterLink],
  selector: 'app-notificaciones',
  styleUrl: './notificaciones.css',
  templateUrl: './notificaciones.html',
})
export class Notificaciones {
  private readonly repo = inject(NotificacionesRepository);
  private readonly recurso = rxResource({ stream: () => this.repo.listar(), defaultValue: [] });

  readonly cargando = this.recurso.isLoading;
  readonly error = this.recurso.error;

  readonly visibles = computed(() =>
    [...(this.recurso.hasValue() ? this.recurso.value() : [])].sort((a, b) => b.fecha.localeCompare(a.fecha)),
  );

  simbolo(n: Notificacion): string {
    return SIMBOLO[n.tipo] ?? '▦';
  }

  destino(n: Notificacion): unknown[] | null {
    return n.turnoId === null ? null : ['/paciente/turnos', n.turnoId];
  }
}
