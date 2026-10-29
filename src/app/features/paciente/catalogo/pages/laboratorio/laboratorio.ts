import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogoFacade } from '../../data-access/catalogo.facade';

/** Catálogo de estudios de laboratorio para reservar turno [R20]. Sin categorías ni preparación: el back no las tiene. */
@Component({
  imports: [RouterLink],
  selector: 'app-laboratorio',
  styleUrl: './laboratorio.css',
  templateUrl: './laboratorio.html',
})
export class Laboratorio {
  private readonly facade = inject(CatalogoFacade);
  private readonly recurso = this.facade.tiposEstudio();

  readonly busqueda = signal('');
  readonly cargando = this.recurso.isLoading;
  readonly error = this.recurso.error;
  readonly estudios = computed(() =>
    this.facade.filtrarTiposEstudio(this.recurso.hasValue() ? this.recurso.value() : [], this.busqueda()),
  );
}
