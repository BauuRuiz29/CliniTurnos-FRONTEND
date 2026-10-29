import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { VENTANA_CANCELACION_HORAS } from '../../../../core/config/tokens';
import type { Disponibilidad, Slot } from '../../../../core/models/disponibilidad';
import { EstadoTurno } from '../../../../core/models/enums';
import { dentroDeVentanaCancelacion, puedeTransicionar } from '../../../../core/models/turno-estado';
import { SelectorTurno } from '../../../../shared/ui/selector-turno/selector-turno';
import { horariosDelDia } from '../../../../shared/utils/calendario';
import { fechaLarga } from '../../../../shared/utils/fechas';
import { AgendaRepository, TurnoProfesional } from '../data-access/agenda.repository';
import { nombrePaciente } from '../turno-vista';

const SIN_DISPONIBILIDAD: Disponibilidad = { horarios: [], bloqueos: [], slots: [] };

class FranjaOcupadaError extends Error {}

/** El profesional elige la franja nueva: se cancela el turno y se reserva otro para el mismo paciente [R12, AGENTS §4.2]. */
@Component({
  imports: [RouterLink, SelectorTurno],
  selector: 'app-reprogramar',
  styleUrl: './reprogramar.css',
  templateUrl: './reprogramar.html',
})
export class Reprogramar {
  private readonly repo = inject(AgendaRepository);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ventanaHoras = inject(VENTANA_CANCELACION_HORAS);
  private readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('turnoId'));

  readonly turno = signal<TurnoProfesional | null>(null);
  readonly disponibilidad = signal(SIN_DISPONIBILIDAD);
  readonly slot = signal<Slot | null>(null);
  readonly confirmando = signal(false);
  readonly error = signal('');

  readonly nombre = computed(() => (this.turno() ? nombrePaciente(this.turno()!.paciente) : ''));
  readonly fechaActual = computed(() => (this.turno() ? fechaLarga(this.turno()!.fecha) : ''));
  readonly fechaNueva = computed(() => (this.slot() ? fechaLarga(this.slot()!.fecha) : ''));

  constructor() {
    this.repo
      .obtener(this.id)
      .pipe(takeUntilDestroyed())
      .subscribe((t) => {
        // Solo un RESERVADO dentro de la ventana de 24 h [R12].
        const modificable = !!t && puedeTransicionar(t.estado, EstadoTurno.CANCELADO) && dentroDeVentanaCancelacion(t.fecha, t.horaInicio, new Date(), this.ventanaHoras);
        if (!modificable) {
          void this.router.navigate(t ? ['/profesional/turnos', t.id] : ['/profesional/agenda']);
          return;
        }
        this.turno.set(t);
        this.recargar();
      });
  }

  confirmar(): void {
    const slot = this.slot();
    if (!slot || this.confirmando()) return;
    this.confirmando.set(true);
    this.error.set('');
    // Se vuelve a pedir la disponibilidad justo antes de confirmar [Rnf 08].
    this.repo
      .disponibilidad()
      .pipe(
        switchMap((disp) => {
          this.disponibilidad.set(disp);
          if (!horariosDelDia(slot.fecha, new Date(), disp).some((h) => h.habilitado && h.slot.turnoId === slot.turnoId)) throw new FranjaOcupadaError();
          return this.repo.reprogramar(this.id, slot.turnoId);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (nuevo) => void this.router.navigate(['/profesional/turnos', nuevo.id, 'reprogramado']),
        error: (e: unknown) => {
          this.confirmando.set(false);
          this.slot.set(null);
          this.error.set(e instanceof FranjaOcupadaError ? 'El horario elegido ya no está disponible. Elegí otro.' : 'No pudimos reprogramar el turno. Intentá de nuevo.');
          this.recargar();
        },
      });
  }

  private recargar(): void {
    this.repo
      .disponibilidad()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((disp) => this.disponibilidad.set(disp));
  }
}
