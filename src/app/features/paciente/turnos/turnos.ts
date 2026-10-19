import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EstadoTurno } from '../../../core/models/enums';
import { ESTADO_TURNO_TEXTO, TurnoPaciente, TurnosRepository } from './data-access/turnos.repository';

// Un turno vencido sin atender lo pasa el back a AUSENTE, así que el estado alcanza para separar.
const ACTIVOS: EstadoTurno[] = [EstadoTurno.RESERVADO, EstadoTurno.EN_CURSO];

/** Turnos próximos y pasados del paciente [R07]. Cancelar se hace desde el detalle. */
@Component({
  imports: [RouterLink, NgTemplateOutlet],
  selector: 'app-turnos',
  styleUrl: './turnos.css',
  templateUrl: './turnos.html',
})
export class Turnos {
  private readonly repo = inject(TurnosRepository);
  private readonly recurso = rxResource({ stream: () => this.repo.listar(), defaultValue: [] });

  readonly cargando = this.recurso.isLoading;
  readonly error = this.recurso.error;

  private readonly ordenados = computed(() =>
    [...(this.recurso.hasValue() ? this.recurso.value() : [])].sort((a, b) => clave(a).localeCompare(clave(b))),
  );
  readonly proximos = computed(() => this.ordenados().filter((t) => ACTIVOS.includes(t.estado)));
  readonly pasados = computed(() => this.ordenados().filter((t) => !ACTIVOS.includes(t.estado)).reverse());

  estado(t: TurnoPaciente): string {
    return ESTADO_TURNO_TEXTO[t.estado];
  }

  dia(t: TurnoPaciente): string {
    return t.fecha.slice(8, 10);
  }

  mes(t: TurnoPaciente): string {
    return mesCorto(t.fecha);
  }
}

const clave = (t: TurnoPaciente) => `${t.fecha}T${t.horaInicio}`;

function mesCorto(iso: string): string {
  const [a, m] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat('es-AR', { month: 'short' }).format(new Date(a, m - 1, 1)).toUpperCase();
}
