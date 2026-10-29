import { Component, computed, inject } from '@angular/core';
import { formatDate } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { EstadoTurno } from '../../../core/models/enums';
import { InformesRepository } from '../informes-medicos/data-access/informes.repository';
import { ESTADO_TURNO_TEXTO, TurnoPaciente, TurnosRepository } from '../turnos/data-access/turnos.repository';

/** Dashboard del paciente: próximo turno y turnos reservados [R07]. */
@Component({
  imports: [RouterLink],
  selector: 'app-inicio',
  styleUrls: ['./inicio.css', '../turnos/turnos.css'],
  templateUrl: './inicio.html',
})
export class Inicio {
  private readonly repo = inject(TurnosRepository);
  private readonly recurso = rxResource({ stream: () => this.repo.listar(), defaultValue: [] });

  readonly cargando = this.recurso.isLoading;
  readonly error = this.recurso.error;

  readonly reservados = computed(() => reservadosFuturos(this.recurso.hasValue() ? this.recurso.value() : [], new Date()));
  readonly proximo = computed(() => this.reservados()[0]);
  readonly proximos = computed(() => this.reservados().slice(0, 3));

  private readonly informesRepo = inject(InformesRepository);
  private readonly informes = rxResource({ stream: () => this.informesRepo.listar(), defaultValue: [] });
  readonly informesDisponibles = computed(() => (this.informes.hasValue() ? this.informes.value().length : 0));

  estado(t: TurnoPaciente): string {
    return ESTADO_TURNO_TEXTO[t.estado];
  }

  dia(t: TurnoPaciente): string {
    return t.fecha.slice(8, 10);
  }

  mes(t: TurnoPaciente): string {
    const [a, m] = t.fecha.split('-').map(Number);
    return new Intl.DateTimeFormat('es-AR', { month: 'short' }).format(new Date(a, m - 1, 1)).toUpperCase();
  }
}

/** RESERVADO que todavía no empezaron, del más cercano al más lejano. */
export function reservadosFuturos(turnos: TurnoPaciente[], ahora: Date): TurnoPaciente[] {
  const desde = formatDate(ahora, "yyyy-MM-dd'T'HH:mm", 'en-US');
  return turnos
    .filter((t) => t.estado === EstadoTurno.RESERVADO && clave(t) >= desde)
    .sort((a, b) => clave(a).localeCompare(clave(b)));
}

const clave = (t: TurnoPaciente) => `${t.fecha}T${t.horaInicio}`;
