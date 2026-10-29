import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { SelectorTurno } from '../../../shared/ui/selector-turno/selector-turno';
import { horariosDelDia } from '../../../shared/utils/calendario';
import { fechaLarga } from '../../../shared/utils/fechas';
import {
  Disponibilidad,
  ProfesionalReserva,
  ReservarTurnoRepository,
  Slot,
  SlotNoDisponibleError,
} from './data-access/reservar-turno.repository';

const SIN_DISPONIBILIDAD: Disponibilidad = { horarios: [], bloqueos: [], slots: [] };

/** Reserva de turno de consulta con un profesional ya elegido [R06, CU04, Rnf 08]. */
@Component({
  selector: 'app-reservar-turno',
  imports: [ReactiveFormsModule, SelectorTurno],
  styleUrl: './reservar-turno.css',
  templateUrl: './reservar-turno.html',
})
export class ReservarTurno {
  private readonly repo = inject(ReservarTurnoRepository);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly profesional = signal<ProfesionalReserva | null>(null);
  readonly disponibilidad = signal(SIN_DISPONIBILIDAD);
  readonly paso = signal<1 | 2>(1);
  readonly slot = signal<Slot | null>(null);
  readonly confirmando = signal(false);
  readonly error = signal<string | null>(null);

  // Turno que se está reprogramando (viene del detalle del turno) [R08].
  readonly reprogramaTurnoId = Number(inject(ActivatedRoute).snapshot?.queryParamMap.get('reprograma')) || null;

  readonly comentario =new FormControl('', { nonNullable: true, validators: Validators.maxLength(255) });

  readonly especialidades = computed(() => (this.profesional()?.especialidades ?? []).map((e) => e.nombre).join(' · '));
  readonly fechaElegida = computed(() => {
    const slot = this.slot();
    return slot ? fechaLarga(slot.fecha) : '';
  });

  constructor() {
    inject(ActivatedRoute).paramMap.pipe(takeUntilDestroyed()).subscribe((params) => this.cargar(Number(params.get('profesionalId'))));
  }

  // Lo emite app-selector-turno al elegir día (null) u horario.
  elegirSlot(slot: Slot | null): void {
    this.slot.set(slot);
    this.error.set(null);
  }

  continuar(): void {
    if (this.slot()) this.paso.set(2);
  }

  volver(): void {
    this.paso.set(1);
  }

  confirmar(): void {
    const profesional = this.profesional();
    const slot = this.slot();
    if (!profesional || !slot || this.comentario.invalid || this.confirmando()) return;

    this.confirmando.set(true);
    this.error.set(null);
    // Se vuelve a pedir la disponibilidad justo antes de reservar [Rnf 08].
    this.repo
      .obtenerDisponibilidad(profesional.id)
      .pipe(
        switchMap((disp) => {
          this.disponibilidad.set(disp);
          if (!horariosDelDia(slot.fecha, new Date(), disp).some((h) => h.habilitado && h.slot.turnoId === slot.turnoId)) {
            throw new SlotNoDisponibleError();
          }
          return this.repo.reservar({
            turnoId: slot.turnoId,
            comentario: this.comentario.value.trim() || null,
            reprogramaTurnoId: this.reprogramaTurnoId,
          });
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (turno) =>
          void this.router.navigate([`/paciente/confirmacion/${this.reprogramaTurnoId ? 'turno-reprogramado' : 'turno-confirmado'}`], { state: { turno } }),
        error: (e: unknown) => {
          this.confirmando.set(false);
          this.error.set(
            e instanceof SlotNoDisponibleError
              ? 'El horario elegido ya no está disponible. Elegí otro.'
              : 'No pudimos reservar el turno. Intentá de nuevo.',
          );
          this.slot.set(null);
          this.paso.set(1);
          this.recargar(profesional.id);
        },
      });
  }

  private cargar(id: number): void {
    this.repo
      .obtenerProfesional(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((profesional) => {
        if (!profesional) {
          void this.router.navigate(['/paciente/especialidades']);
          return;
        }
        this.profesional.set(profesional);
        this.recargar(profesional.id);
      });
  }

  private recargar(profesionalId: number): void {
    this.repo
      .obtenerDisponibilidad(profesionalId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((disp) => this.disponibilidad.set(disp));
  }
}
