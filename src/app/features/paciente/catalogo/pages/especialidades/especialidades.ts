import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogoFacade } from '../../data-access/catalogo.facade';

// Imágenes de /public por especialidad (presentación, no viene del back).
const IMAGENES: Record<string, string> = {
  'Cardiología': 'cardiologia.png',
  'Dermatología': 'dermatologia.png',
  'Ginecología': 'ginecologia.png',
  'Neurología': 'neurologia.png',
  'Traumatología': 'traumatologia.png',
  'Pediatría': 'pediatria.png',
};
const IMAGEN_POR_DEFECTO = 'especialidad.png';

@Component({
  imports: [RouterLink],
  selector: 'app-especialidades',
  styleUrl: './especialidades.css',
  templateUrl: './especialidades.html',
})
export class Especialidades {
  private readonly recurso = inject(CatalogoFacade).especialidades();

  readonly cargando = this.recurso.isLoading;
  readonly error = this.recurso.error;
  readonly especialidades = computed(() => (this.recurso.hasValue() ? this.recurso.value() : []));

  imagen(nombre: string): string {
    return IMAGENES[nombre] ?? IMAGEN_POR_DEFECTO;
  }
}
