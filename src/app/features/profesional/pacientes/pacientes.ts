import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PACIENTES, TURNOS } from '../data-access/datos-prototipo';

const POR_PAGINA = 5;

/** Pacientes asignados al profesional [R14, Rnf 01]. */
@Component({
  imports: [RouterLink],
  selector: 'app-pacientes',
  styleUrl: './pacientes.css',
  templateUrl: './pacientes.html',
})
export class Pacientes {
  readonly busqueda = signal('');
  readonly pagina = signal(1);

  readonly filtrados = computed(() => {
    const texto = this.busqueda().toLowerCase().trim();
    return PACIENTES.filter((p) => `${p.nombre} ${p.dni} ${p.telefono}`.toLowerCase().includes(texto));
  });
  readonly visibles = computed(() => {
    const inicio = (this.pagina() - 1) * POR_PAGINA;
    return this.filtrados().slice(inicio, inicio + POR_PAGINA);
  });

  // TODO Fase B: "Ver perfil" no tiene prototipo; por ahora abre el turno del paciente.
  turnoDe(dni: string): number {
    return TURNOS.find((t) => t.dni === dni)?.id ?? 1;
  }

  buscar(texto: string): void {
    this.busqueda.set(texto);
    this.pagina.set(1);
  }
}
