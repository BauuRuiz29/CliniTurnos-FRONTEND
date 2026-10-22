import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { NotificacionPaciente, TipoNotificacion } from './data-access/notificaciones.models';
import { NotificacionesRepository } from './data-access/notificaciones.repository';

const FILTROS = ['Todas', 'Turnos', 'Informes'] as const;
type Filtro = (typeof FILTROS)[number];

// Mismos símbolos que las notificaciones del profesional.
const SIMBOLO: Record<TipoNotificacion, string> = {
  TURNO_RESERVADO: '▦',
  TURNO_REPROGRAMADO: '▦',
  TURNO_CANCELADO: '▦',
  RECORDATORIO_TURNO: '◷',
  INFORME_DISPONIBLE: '▤',
};

/** Avisos de turnos y de informes del paciente [R09, R17]. */
@Component({
  imports: [DatePipe, RouterLink],
  selector: 'app-notificaciones',
  styleUrl: './notificaciones.css',
  templateUrl: './notificaciones.html',
})
export class Notificaciones {
  private readonly repo = inject(NotificacionesRepository);
  private readonly recurso = rxResource({ stream: () => this.repo.listar(), defaultValue: [] });

  readonly filtros = FILTROS;
  readonly filtro = signal<Filtro>('Todas');
  readonly cargando = this.recurso.isLoading;
  readonly error = this.recurso.error;

  readonly visibles = computed(() => {
    const todas = this.recurso.hasValue() ? this.recurso.value() : [];
    const filtro = this.filtro();
    return todas
      .filter((n) => filtro === 'Todas' || (filtro === 'Informes') === esInforme(n))
      .sort((a, b) => b.fechaEnvio.localeCompare(a.fechaEnvio));
  });

  simbolo(n: NotificacionPaciente): string {
    return SIMBOLO[n.tipo];
  }

  destino(n: NotificacionPaciente): unknown[] | null {
    if (esInforme(n)) return ['/paciente/informes'];
    return n.turnoId === null ? null : ['/paciente/turnos', n.turnoId];
  }
}

const esInforme = (n: NotificacionPaciente) => n.tipo === TipoNotificacion.INFORME_DISPONIBLE;
