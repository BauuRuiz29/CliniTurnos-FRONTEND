import { Component, computed, signal } from '@angular/core';
import { NOTIFICACIONES, NotificacionProfesional } from '../data-access/datos-prototipo';

type FiltroNotificaciones = 'Todas' | 'Leídas' | 'No leídas';

const SIMBOLO: Record<NotificacionProfesional['icono'], string> = { calendar: '▦', clock: '◷', file: '▤' };

/** Notificaciones del profesional [R15, R18]. */
@Component({
  selector: 'app-profesional-notificaciones',
  styleUrl: './notificaciones.css',
  templateUrl: './notificaciones.html',
})
export class Notificaciones {
  readonly filtros: FiltroNotificaciones[] = ['Todas', 'Leídas', 'No leídas'];
  readonly filtro = signal<FiltroNotificaciones>('Todas');
  private readonly notificaciones = signal(NOTIFICACIONES.map((n) => ({ ...n })));

  readonly visibles = computed(() => {
    const filtro = this.filtro();
    return this.notificaciones().filter((n) => filtro === 'Todas' || n.leida === (filtro === 'Leídas'));
  });

  simbolo(n: NotificacionProfesional): string {
    return SIMBOLO[n.icono];
  }

  marcarLeida(id: number): void {
    this.notificaciones.update((lista) => lista.map((n) => (n.id === id ? { ...n, leida: true } : n)));
  }
}
