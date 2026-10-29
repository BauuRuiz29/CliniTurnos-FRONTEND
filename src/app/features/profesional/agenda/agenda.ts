import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AgendaRepository, TurnoProfesional } from './data-access/agenda.repository';
import { accionTurno, claseEstado, claveTurno, mesCorto, nombrePaciente, requiereAccion, textoEstado } from './turno-vista';

const FILTROS = ['Todos', 'Pendientes', 'Pasados'] as const;
type FiltroAgenda = (typeof FILTROS)[number];

/** Agenda de turnos del profesional, pendientes y pasados [R11]. */
@Component({
  imports: [RouterLink],
  selector: 'app-agenda',
  styleUrl: './agenda.css',
  templateUrl: './agenda.html',
})
export class Agenda {
  private readonly repo = inject(AgendaRepository);
  private readonly recurso = rxResource({ stream: () => this.repo.listar(), defaultValue: [] });

  readonly filtros = FILTROS;
  readonly filtro = signal<FiltroAgenda>(filtroInicial(inject(ActivatedRoute).snapshot?.queryParamMap.get('filtro')));
  readonly cargando = this.recurso.isLoading;
  readonly error = this.recurso.error;

  // Pendientes del más próximo al más lejano; pasados del más reciente al más viejo.
  private readonly pendientes = computed(() => this.todos().filter(requiereAccion));
  private readonly pasados = computed(() => this.todos().filter((t) => !requiereAccion(t)).reverse());
  private readonly todos = computed(() => [...(this.recurso.hasValue() ? this.recurso.value() : [])].sort((a, b) => claveTurno(a).localeCompare(claveTurno(b))));

  readonly turnos = computed(() => {
    switch (this.filtro()) {
      case 'Pendientes':
        return this.pendientes();
      case 'Pasados':
        return this.pasados();
      default:
        return [...this.pendientes(), ...this.pasados()];
    }
  });

  readonly accion = accionTurno;
  readonly nombre = (t: TurnoProfesional) => nombrePaciente(t.paciente);
  readonly estado = (t: TurnoProfesional) => textoEstado(t.estado);
  readonly claseEstado = (t: TurnoProfesional) => claseEstado(t.estado);
  readonly dia = (t: TurnoProfesional) => t.fecha.slice(8, 10);
  readonly mes = (t: TurnoProfesional) => mesCorto(t.fecha);
}

function filtroInicial(valor: string | null | undefined): FiltroAgenda {
  return FILTROS.find((f) => f === valor) ?? 'Todos';
}
