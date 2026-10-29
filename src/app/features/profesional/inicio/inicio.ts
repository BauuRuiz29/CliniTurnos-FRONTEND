import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { EstadoTurno, Genero } from '../../../core/models/enums';
import { isoLocal } from '../../../shared/utils/calendario';
import { AgendaRepository, TurnoProfesional } from '../agenda/data-access/agenda.repository';
import { ESTADOS_PENDIENTES, accionTurno, claseEstado, claveTurno, informePorCargar, nombrePaciente, textoEstado } from '../agenda/turno-vista';

/** Resumen del día del profesional [R11]. */
@Component({
  imports: [RouterLink],
  selector: 'app-profesional-inicio',
  styleUrl: './inicio.css',
  templateUrl: './inicio.html',
})
export class Inicio {
  private readonly agenda = inject(AgendaRepository);
  private readonly auth = inject(AuthService);

  private readonly turnos = rxResource({ stream: () => this.agenda.listar(), defaultValue: [] });
  // Saludo con el usuario de la sesión: "Dr."/"Dra." solo si el género lo indica.
  readonly saludo = computed(() => {
    const u = this.auth.usuario();
    if (!u) return ''; // solo entre el logout y salir del área: el guard garantiza el usuario al entrar
    const titulo = u.genero === Genero.MASCULINO ? 'Dr. ' : u.genero === Genero.FEMENINO ? 'Dra. ' : '';
    return `${titulo}${u.nombre} ${u.apellido}`;
  });

  readonly cargando = this.turnos.isLoading;
  readonly error = this.turnos.error;

  private readonly hoy = computed(() => {
    const hoy = isoLocal(new Date());
    return (this.turnos.hasValue() ? this.turnos.value() : []).filter((t) => t.fecha === hoy).sort((a, b) => claveTurno(a).localeCompare(claveTurno(b)));
  });
  readonly turnosHoy = computed(() => this.hoy().filter((t) => t.estado !== EstadoTurno.CANCELADO).length);
  readonly pendientesHoy = computed(() => this.hoy().filter((t) => t.estado === EstadoTurno.RESERVADO).length);
  readonly informesPendientes = computed(() => (this.turnos.hasValue() ? this.turnos.value() : []).filter(informePorCargar).length);
  readonly proximos = computed(() => this.hoy().filter((t) => ESTADOS_PENDIENTES.includes(t.estado)));

  readonly accion = accionTurno;
  readonly nombre = (t: TurnoProfesional) => nombrePaciente(t.paciente);
  readonly estado = (t: TurnoProfesional) => textoEstado(t.estado);
  readonly claseEstado = (t: TurnoProfesional) => claseEstado(t.estado);
}
