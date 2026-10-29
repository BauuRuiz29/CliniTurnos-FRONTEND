import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { haceCuanto } from '../../../shared/utils/fechas';
import { NotificacionProfesional, NotificacionesRepository, TipoNotificacionProfesional } from './data-access/notificaciones.repository';

const FILTROS = ['Todas', 'Leídas', 'No leídas'] as const;
type Filtro = (typeof FILTROS)[number];

const SIMBOLO: Record<TipoNotificacionProfesional, string> = {
  TURNO_ASIGNADO: '▦',
  TURNO_REPROGRAMADO: '◷',
  TURNO_CANCELADO: '▦',
  INFORME_PENDIENTE: '▤',
};

/** Avisos de turnos nuevos, reprogramados e informes pendientes [R15, R18]. */
@Component({
  selector: 'app-profesional-notificaciones',
  styleUrl: './notificaciones.css',
  templateUrl: './notificaciones.html',
})
export class Notificaciones {
  private readonly repo = inject(NotificacionesRepository);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly recurso = rxResource({ stream: () => this.repo.listar(), defaultValue: [] });
  // Las que se marcaron en esta visita, para no volver a pedir la lista.
  private readonly leidasAhora = signal<ReadonlySet<number>>(new Set());

  readonly filtros = FILTROS;
  readonly filtro = signal<Filtro>('Todas');
  readonly cargando = this.recurso.isLoading;
  readonly error = this.recurso.error;

  readonly visibles = computed(() => {
    const filtro = this.filtro();
    return (this.recurso.hasValue() ? this.recurso.value() : [])
      .filter((n) => filtro === 'Todas' || this.leida(n) === (filtro === 'Leídas'))
      .sort((a, b) => b.fechaEnvio.localeCompare(a.fechaEnvio));
  });

  leida(n: NotificacionProfesional): boolean {
    return n.leida || this.leidasAhora().has(n.id);
  }

  simbolo(n: NotificacionProfesional): string {
    return SIMBOLO[n.tipo];
  }

  cuando(n: NotificacionProfesional): string {
    return haceCuanto(n.fechaEnvio);
  }

  /** La marca como leída y, si es de un turno, abre su detalle. */
  abrir(n: NotificacionProfesional): void {
    if (!this.leida(n)) {
      this.repo
        .marcarLeida(n.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.leidasAhora.update((ids) => new Set(ids).add(n.id)));
    }
    if (n.tipo === TipoNotificacionProfesional.INFORME_PENDIENTE) void this.router.navigate(['/profesional/agenda'], { queryParams: { filtro: 'Pendientes' } });
    else if (n.turnoId !== null) void this.router.navigate(['/profesional/turnos', n.turnoId]);
  }
}
