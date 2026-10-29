import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { fechaCorta } from '../../../shared/utils/fechas';
import { inicialesPaciente } from '../agenda/turno-vista';
import { PacienteAsignado, PacientesRepository } from './data-access/pacientes.repository';
import { normalizar } from '../../../shared/utils/texto';

const POR_PAGINA = 5;

/** Pacientes asignados al profesional [R14, Rnf 01]. */
@Component({
  imports: [RouterLink],
  selector: 'app-pacientes',
  styleUrl: './pacientes.css',
  templateUrl: './pacientes.html',
})
export class Pacientes {
  private readonly repo = inject(PacientesRepository);
  private readonly recurso = rxResource({ stream: () => this.repo.listar(), defaultValue: [] });

  readonly cargando = this.recurso.isLoading;
  readonly error = this.recurso.error;
  readonly busqueda = signal('');
  readonly pagina = signal(1);

  readonly filtrados = computed(() => {
    const texto = normalizar(this.busqueda());
    return (this.recurso.hasValue() ? this.recurso.value() : [])
      .filter((p) => normalizar(`${p.nombre} ${p.apellido} ${p.numIdentificacion} ${p.telefono ?? ''}`).includes(texto))
      .sort((a, b) => `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`));
  });
  readonly paginas = computed(() => Math.max(1, Math.ceil(this.filtrados().length / POR_PAGINA)));
  readonly numeros = computed(() => Array.from({ length: this.paginas() }, (_, i) => i + 1));
  readonly visibles = computed(() => {
    const inicio = (this.pagina() - 1) * POR_PAGINA;
    return this.filtrados().slice(inicio, inicio + POR_PAGINA);
  });

  readonly iniciales = inicialesPaciente;

  ultimaConsulta(p: PacienteAsignado): string {
    return p.ultimaConsulta ? fechaCorta(p.ultimaConsulta) : 'Sin consultas';
  }

  buscar(texto: string): void {
    this.busqueda.set(texto);
    this.pagina.set(1);
  }

  irA(pagina: number): void {
    this.pagina.set(Math.min(Math.max(1, pagina), this.paginas()));
  }
}
