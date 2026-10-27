import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TURNOS } from '../data-access/datos-prototipo';

type FiltroAgenda = 'Todos' | 'Pendientes' | 'Pasados';

/** Agenda de turnos del profesional [R11]. */
@Component({
  imports: [RouterLink],
  selector: 'app-agenda',
  styleUrl: './agenda.css',
  templateUrl: './agenda.html',
})
export class Agenda {
  readonly filtros: FiltroAgenda[] = ['Todos', 'Pendientes', 'Pasados'];
  readonly filtro = signal<FiltroAgenda>('Todos');

  readonly turnos = computed(() => {
    switch (this.filtro()) {
      case 'Pendientes':
        return TURNOS.filter((t) => t.estado === 'Pendiente');
      case 'Pasados':
        return TURNOS.filter((t) => t.estado === 'Confirmado');
      default:
        return TURNOS;
    }
  });
}
