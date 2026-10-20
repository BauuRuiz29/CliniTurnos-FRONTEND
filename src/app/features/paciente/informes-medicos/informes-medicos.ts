import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { InformeMedico, InformesRepository } from './data-access/informes.repository';

/** Informes médicos de turnos pasados del paciente, más reciente primero [R10]. */
@Component({
  imports: [RouterLink],
  selector: 'app-informes-medicos',
  styleUrl: './informes-medicos.css',
  templateUrl: './informes-medicos.html',
})
export class InformesMedicos {
  private readonly repo = inject(InformesRepository);
  private readonly recurso = rxResource({ stream: () => this.repo.listar(), defaultValue: [] });

  readonly cargando = this.recurso.isLoading;
  readonly error = this.recurso.error;
  readonly informes = computed(() =>
    [...(this.recurso.hasValue() ? this.recurso.value() : [])].sort((a, b) => b.fecha.localeCompare(a.fecha)),
  );

  fecha(i: InformeMedico): string {
    return i.fecha.split('-').reverse().join('/');
  }
}
