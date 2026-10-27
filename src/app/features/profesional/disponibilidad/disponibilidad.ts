import { Component, computed, signal } from '@angular/core';
import { HORARIOS, HorarioAtencion } from '../data-access/datos-prototipo';

// Se atiende de lunes a viernes [AGENTS §4.3].
const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

/** Disponibilidad horaria del profesional [R22]. TODO Fase B: guardar cambios y bloqueo de fechas. */
@Component({
  selector: 'app-disponibilidad',
  styleUrl: './disponibilidad.css',
  templateUrl: './disponibilidad.html',
})
export class Disponibilidad {
  readonly dias = DIAS;
  readonly dia = signal('Martes');
  private readonly horarios = signal(HORARIOS.map((h) => ({ ...h })));
  readonly horariosDelDia = computed(() => this.horarios().filter((h) => h.dia === this.dia()));

  alternar(horario: HorarioAtencion): void {
    this.horarios.update((lista) => lista.map((h) => (h === horario ? { ...h, activo: !h.activo } : h)));
  }
}
