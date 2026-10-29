import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { guardarArchivo } from '../../../../shared/utils/archivos';
import { fechaLarga } from '../../../../shared/utils/fechas';
import { AdjuntoInformeMedico, InformeMedico, InformesRepository } from '../data-access/informes.repository';

/** Detalle de un informe médico del paciente: diagnóstico, plan, indicaciones y adjuntos [R10]. */
@Component({
  imports: [RouterLink],
  selector: 'app-detalle-informe',
  styleUrls: ['../../detalle.css', './detalle-informe.css'],
  templateUrl: './detalle-informe.html',
})
export class DetalleInforme {
  private readonly repo = inject(InformesRepository);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly informe = signal<InformeMedico | null>(null);
  readonly fecha = computed(() => (this.informe() ? fechaLarga(this.informe()!.fecha) : ''));
  readonly descargando = signal<number | null>(null);
  readonly errorDescarga = signal(false);

  constructor() {
    inject(ActivatedRoute).paramMap.pipe(takeUntilDestroyed()).subscribe((params) => this.cargar(Number(params.get('informeId'))));
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

  private cargar(id: number): void {
    this.repo
      .obtener(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((informe) => {
        if (!informe) {
          void this.router.navigate(['/paciente/informes']);
          return;
        }
        this.informe.set(informe);
      });
  }
}
