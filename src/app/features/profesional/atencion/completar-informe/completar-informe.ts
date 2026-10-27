import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

const DURACION_TOAST_MS = 2600;

/** Informe médico del turno en curso [R13]. TODO Fase B: formulario reactivo + guardar/finalizar consulta. */
@Component({
  imports: [RouterLink],
  selector: 'app-completar-informe',
  styleUrl: './completar-informe.css',
  templateUrl: './completar-informe.html',
})
export class CompletarInforme {
  readonly turnoId = inject(ActivatedRoute).snapshot.paramMap.get('turnoId');

  readonly diagnostico = signal('Hipertensión arterial estadio 1.');
  readonly tratamiento = signal('Enalapril 10mg cada 24 hs.\nDieta hiposódica.\nControl en 30 días.');
  readonly indicaciones = signal('- Controlar presión arterial en casa.\n- Realizar actividad física moderada.');
  readonly estudios = signal(['Hemograma completo', 'Glucemia', 'Colesterol total']);
  readonly archivo = signal('ECG_21052024.pdf');
  readonly mensaje = signal('');

  private timeoutToast?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timeoutToast));
  }

  agregarEstudio(): void {
    const estudio = window.prompt('Nombre del estudio solicitado:')?.trim();
    if (estudio) this.estudios.update((lista) => [...lista, estudio]);
  }

  quitarEstudio(estudio: string): void {
    this.estudios.update((lista) => lista.filter((e) => e !== estudio));
  }

  seleccionarArchivo(evento: Event): void {
    const archivo = (evento.target as HTMLInputElement).files?.[0];
    if (archivo) this.archivo.set(archivo.name);
  }

  guardar(evento: SubmitEvent): void {
    evento.preventDefault();
    this.mostrarMensaje('Informe guardado en esta demostración.');
  }

  private mostrarMensaje(texto: string): void {
    clearTimeout(this.timeoutToast);
    this.mensaje.set(texto);
    this.timeoutToast = setTimeout(() => this.mensaje.set(''), DURACION_TOAST_MS);
  }
}
