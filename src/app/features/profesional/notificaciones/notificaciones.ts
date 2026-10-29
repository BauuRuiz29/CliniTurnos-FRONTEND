import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Notificacion, TipoNotificacion } from '../../../core/models/notificacion';
import { NotificacionesRepository } from '../../../core/notificaciones/notificaciones';
import { haceCuanto } from '../../../shared/utils/fechas';

const SIMBOLO: Partial<Record<TipoNotificacion, string>> = {
  RESERVA: '▦',
  REPROGRAMACION: '◷',
  CANCELACION: '▦',
};

/** Avisos de turnos nuevos, cancelados y reprogramados [R15, R18]. */
@Component({
  selector: 'app-profesional-notificaciones',
  styleUrl: './notificaciones.css',
  templateUrl: './notificaciones.html',
})
export class Notificaciones {
  private readonly repo = inject(NotificacionesRepository);
  private readonly router = inject(Router);
  private readonly recurso = rxResource({ stream: () => this.repo.listar(), defaultValue: [] });

  readonly cargando = this.recurso.isLoading;
  readonly error = this.recurso.error;

  readonly visibles = computed(() =>
    [...(this.recurso.hasValue() ? this.recurso.value() : [])].sort((a, b) => b.fecha.localeCompare(a.fecha)),
  );

  simbolo(n: Notificacion): string {
    return SIMBOLO[n.tipo] ?? '▦';
  }

  cuando(n: Notificacion): string {
    return haceCuanto(n.fecha);
  }

  /** Si es de un turno, abre su detalle. */
  abrir(n: Notificacion): void {
    if (n.turnoId !== null) void this.router.navigate(['/profesional/turnos', n.turnoId]);
  }
}
