import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { DiaCalendario, HorarioSlot, VENTANA_DIAS, armarMes, horariosDelDia, sumarDias, tituloMes } from './calendario';
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
  imports: [ReactiveFormsModule],
  styleUrl: './reservar-turno.css',
  templateUrl: './reservar-turno.html',
})
export class ReservarTurno {
  private readonly repo = inject(ReservarTurnoRepository);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly ahora = new Date();
  private readonly limite = sumarDias(this.ahora, VENTANA_DIAS);

  readonly profesional = signal<ProfesionalReserva | null>(null);
  readonly disponibilidad = signal(SIN_DISPONIBILIDAD);
  readonly paso = signal<1 | 2>(1);
  readonly mes = signal({ anio: this.ahora.getFullYear(), mes: this.ahora.getMonth() });
  readonly fecha = signal<string | null>(null);
  readonly slot = signal<Slot | null>(null);
  readonly confirmando = signal(false);
  readonly error = signal<string | null>(null);

  // Turno que se está reprogramando (viene del detalle del turno) [R08].
  readonly reprogramaTurnoId = Number(inject(ActivatedRoute).snapshot?.queryParamMap.get('reprograma')) || null;

  readonly comentario =new FormControl('', { nonNullable: true, validators: Validators.maxLength(255) });

  readonly tituloMes = computed(() => tituloMes(this.mes().anio, this.mes().mes));
  readonly dias = computed(() => armarMes(this.mes().anio, this.mes().mes, this.ahora, this.disponibilidad()));
  readonly horarios = computed(() => {
    const fecha = this.fecha();
    return fecha ? horariosDelDia(fecha, this.ahora, this.disponibilidad()) : [];
  });
  readonly fechaElegida = computed(() => {
    const fecha = this.fecha();
    return fecha ? fechaLarga(fecha) : '';
  });
  readonly hayAnterior = computed(() => this.indiceMes() > this.ahora.getFullYear() * 12 + this.ahora.getMonth());
  readonly haySiguiente = computed(() => this.indiceMes() < this.limite.getFullYear() * 12 + this.limite.getMonth());

  constructor() {
    inject(ActivatedRoute).paramMap.pipe(takeUntilDestroyed()).subscribe((params) => this.cargar(Number(params.get('profesionalId'))));
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
    this.error.set(null);
  }

  elegirHorario(horario: HorarioSlot): void {
    if (!horario.habilitado) return;
    this.slot.set(horario.slot);
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
            especialidadId: profesional.especialidad.id,
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

  private indiceMes(): number {
    return this.mes().anio * 12 + this.mes().mes;
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
