import { Component, OnInit, computed, input, model, signal } from '@angular/core';
import type { Disponibilidad, Slot } from '../../../core/models/disponibilidad';
import { DiaCalendario, HorarioSlot, VENTANA_DIAS, armarMes, horariosDelDia, sumarDias, tituloMes } from '../../utils/calendario';

/**
 * Calendario de días + grilla de horarios para elegir una franja DISPONIBLE.
 * Lo usan la reserva del paciente y el reprogramar del profesional.
 */
@Component({
  selector: 'app-selector-turno',
  styleUrl: './selector-turno.css',
  templateUrl: './selector-turno.html',
})
export class SelectorTurno implements OnInit {
  readonly disponibilidad = input.required<Disponibilidad>();
  readonly slot = model<Slot | null>(null);

  private readonly ahora = new Date();
  private readonly limite = sumarDias(this.ahora, VENTANA_DIAS);

  readonly mes = signal({ anio: this.ahora.getFullYear(), mes: this.ahora.getMonth() });
  readonly fecha = signal<string | null>(null);

  readonly tituloMes = computed(() => tituloMes(this.mes().anio, this.mes().mes));
  readonly dias = computed(() => armarMes(this.mes().anio, this.mes().mes, this.ahora, this.disponibilidad()));
  readonly horarios = computed(() => {
    const fecha = this.fecha();
    return fecha ? horariosDelDia(fecha, this.ahora, this.disponibilidad()) : [];
  });
  readonly hayAnterior = computed(() => this.indiceMes() > this.ahora.getFullYear() * 12 + this.ahora.getMonth());
  readonly haySiguiente = computed(() => this.indiceMes() < this.limite.getFullYear() * 12 + this.limite.getMonth());

  // Si llega con una franja ya elegida (por ejemplo al volver de la confirmación), se abre en ese día.
  ngOnInit(): void {
    const slot = this.slot();
    if (!slot) return;
    const [anio, mes] = slot.fecha.split('-').map(Number);
    this.mes.set({ anio, mes: mes - 1 });
    this.fecha.set(slot.fecha);
  }

  cambiarMes(delta: number): void {
    this.mes.update(({ anio, mes }) => {
      const d = new Date(anio, mes + delta, 1);
      return { anio: d.getFullYear(), mes: d.getMonth() };
    });
  }

  elegirDia(dia: DiaCalendario): void {
    if (!dia.habilitado) return;
    this.fecha.set(dia.fecha);
    this.slot.set(null);
  }

  elegirHorario(horario: HorarioSlot): void {
    if (horario.habilitado) this.slot.set(horario.slot);
  }

  private indiceMes(): number {
    return this.mes().anio * 12 + this.mes().mes;
  }
}
