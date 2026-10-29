import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { guardarArchivo } from '../../../shared/utils/archivos';
import { EstadoEstudio } from '../../../core/models/enums';
import { AdjuntoInformeMedico, EstudioPaciente, InformeMedico, InformesRepository } from './data-access/informes.repository';

const ESTADO_ESTUDIO_TEXTO: Record<EstadoEstudio, string> = {
  SOLICITADO: 'Solicitado',
  REALIZADO: 'Realizado',
  INFORMADO: 'Informado',
  CANCELADO: 'Cancelado',
};

/** Informes médicos de turnos pasados y estudios del paciente, más reciente primero [R10, R20]. */
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
  private readonly recursoEstudios = rxResource({ stream: () => this.repo.listarEstudios(), defaultValue: [] });

  readonly cargando = this.recurso.isLoading;
  readonly error = this.recurso.error;
  readonly descargando = signal<number | null>(null);
  readonly errorDescarga = signal(false);
  readonly informes = computed(() =>
    [...(this.recurso.hasValue() ? this.recurso.value() : [])].sort((a, b) => b.fecha.localeCompare(a.fecha)),
  );

  readonly cargandoEstudios = this.recursoEstudios.isLoading;
  readonly errorEstudios = this.recursoEstudios.error;
  readonly estudios = computed(() =>
    [...(this.recursoEstudios.hasValue() ? this.recursoEstudios.value() : [])].sort((a, b) => b.fechaSolicitud.localeCompare(a.fechaSolicitud)),
  );

  fecha(i: InformeMedico): string {
    return i.fecha.split('-').reverse().join('/');
  }

  fechaEstudio(e: EstudioPaciente): string {
    return e.fechaSolicitud.split('-').reverse().join('/');
  }

  estadoEstudio(e: EstudioPaciente): string {
    return ESTADO_ESTUDIO_TEXTO[e.estado] ?? e.estado;
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
