import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { guardarArchivo } from '../../../shared/utils/archivos';
import { AdjuntoInformeMedico, InformeMedico, InformesRepository } from './data-access/informes.repository';

/** Informes médicos de turnos pasados del paciente, más reciente primero [R10]. */
@Component({
  imports: [RouterLink],
  selector: 'app-informes-medicos',
  styleUrl: './informes-medicos.css',
  templateUrl: './informes-medicos.html',
})
export class InformesMedicos {
  private readonly repo = inject(InformesRepository);
  private readonly destroyRef = inject(DestroyRef);
  private readonly recurso = rxResource({ stream: () => this.repo.listar(), defaultValue: [] });

  readonly cargando = this.recurso.isLoading;
  readonly error = this.recurso.error;
  readonly descargando = signal<number | null>(null);
  readonly errorDescarga = signal(false);
  readonly informes = computed(() =>
    [...(this.recurso.hasValue() ? this.recurso.value() : [])].sort((a, b) => b.fecha.localeCompare(a.fecha)),
  );

  fecha(i: InformeMedico): string {
    return i.fecha.split('-').reverse().join('/');
  }

  descargar(adjunto: AdjuntoInformeMedico): void {
    this.descargando.set(adjunto.id);
    this.errorDescarga.set(false);
    this.repo
      .descargar(adjunto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (archivo) => {
          this.descargando.set(null);
          guardarArchivo(archivo, adjunto.titulo);
        },
        error: () => {
          this.descargando.set(null);
          this.errorDescarga.set(true);
        },
      });
  }
}
