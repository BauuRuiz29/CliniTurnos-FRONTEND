import { formatDate } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import type { DiaSemana } from '../../../core/models/disponibilidad';
import { Bloqueo, DisponibilidadRepository, HorarioProfesional } from './data-access/disponibilidad.repository';

// Se atiende de lunes a viernes [AGENTS §4.3].
const DIAS: { valor: DiaSemana; texto: string }[] = [
  { valor: 'LUNES', texto: 'Lunes' },
  { valor: 'MARTES', texto: 'Martes' },
  { valor: 'MIERCOLES', texto: 'Miércoles' },
  { valor: 'JUEVES', texto: 'Jueves' },
  { valor: 'VIERNES', texto: 'Viernes' },
];

// fechas_bloqueadas.motivo es varchar(255).
const MAX_MOTIVO = 255;

/** Disponibilidad horaria y bloqueo de fechas del profesional [R22]. */
@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-disponibilidad',
  styleUrl: './disponibilidad.css',
  templateUrl: './disponibilidad.html',
})
export class Disponibilidad {
  private readonly repo = inject(DisponibilidadRepository);
  private readonly destroyRef = inject(DestroyRef);

  readonly dias = DIAS;
  readonly dia = signal<DiaSemana>('LUNES');
  readonly horarios = signal<HorarioProfesional[] | null>(null);
  readonly bloqueos = signal<Bloqueo[] | null>(null);
  readonly guardando = signal<number | null>(null); // horario que se está guardando
  readonly bloqueando = signal(false);
  readonly error = signal('');

  readonly horariosDelDia = computed(() => (this.horarios() ?? []).filter((h) => h.diaSemana === this.dia()).sort((a, b) => a.horaDesde.localeCompare(b.horaDesde)));
  readonly ahora = formatDate(new Date(), "yyyy-MM-dd'T'HH:mm", 'en-US');

  readonly form = new FormGroup(
    {
      fechaDesde: new FormControl('', { nonNullable: true, validators: Validators.required }),
      fechaHasta: new FormControl('', { nonNullable: true, validators: Validators.required }),
      motivo: new FormControl('', { nonNullable: true, validators: Validators.maxLength(MAX_MOTIVO) }),
    },
    { validators: (g) => rangoValido(g, this.ahora) },
  );

  constructor() {
    this.repo.horarios().pipe(takeUntilDestroyed()).subscribe({ next: (h) => this.horarios.set(h), error: () => this.error.set('No pudimos cargar tus horarios.') });
    this.repo.bloqueos().pipe(takeUntilDestroyed()).subscribe({ next: (b) => this.bloqueos.set(b), error: () => this.error.set('No pudimos cargar tus bloqueos.') });
  }

  textoDia(valor: DiaSemana): string {
    return DIAS.find((d) => d.valor === valor)?.texto ?? valor;
  }

  alternar(horario: HorarioProfesional): void {
    if (this.guardando() !== null) return;
    this.guardando.set(horario.id);
    this.error.set('');
    this.repo
      .cambiarActivo(horario.id, !horario.activo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (actualizado) => {
          this.guardando.set(null);
          this.horarios.update((lista) => lista?.map((h) => (h.id === actualizado.id ? actualizado : h)) ?? null);
        },
        error: () => {
          this.guardando.set(null);
          this.error.set('No pudimos guardar el cambio. Intentá de nuevo.');
        },
      });
  }

  bloquear(evento: SubmitEvent): void {
    evento.preventDefault();
    if (this.form.invalid || this.bloqueando()) {
      this.form.markAllAsTouched();
      return;
    }
    const { fechaDesde, fechaHasta, motivo } = this.form.getRawValue();
    this.bloqueando.set(true);
    this.repo
      .bloquear({ fechaDesde, fechaHasta, motivo: motivo.trim() || null })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (bloqueo) => {
          this.bloqueando.set(false);
          this.form.reset();
          this.bloqueos.update((lista) => [...(lista ?? []), bloqueo]);
        },
        error: () => {
          this.bloqueando.set(false);
          this.error.set('No pudimos bloquear las fechas. Intentá de nuevo.');
        },
      });
  }

  desbloquear(bloqueo: Bloqueo): void {
    this.repo
      .desbloquear(bloqueo.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.bloqueos.update((lista) => lista?.filter((b) => b.id !== bloqueo.id) ?? null),
        error: () => this.error.set('No pudimos quitar el bloqueo. Intentá de nuevo.'),
      });
  }

  /** "17/09/2026 08:00" a partir de yyyy-MM-ddTHH:mm. */
  fechaHora(iso: string): string {
    const [fecha, hora] = iso.split('T');
    const [a, m, d] = fecha.split('-');
    return `${d}/${m}/${a} ${hora}`;
  }

  get errorRango(): string | null {
    const errores = this.form.errors;
    if (!errores || !(this.form.controls.fechaDesde.touched || this.form.controls.fechaHasta.touched)) return null;
    if (errores['pasado']) return 'El bloqueo no puede empezar en el pasado.';
    if (errores['rango']) return '"Hasta" tiene que ser posterior a "Desde".';
    return null;
  }
}

function rangoValido(grupo: AbstractControl, ahora: string): ValidationErrors | null {
  const { fechaDesde, fechaHasta } = grupo.value as { fechaDesde: string; fechaHasta: string };
  if (!fechaDesde || !fechaHasta) return null;
  if (fechaDesde < ahora) return { pasado: true };
  return fechaHasta > fechaDesde ? null : { rango: true };
}
