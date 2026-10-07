import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogoFacade } from '../../data-access/catalogo.facade';

@Component({
  imports: [RouterLink],
  selector: 'app-profesionales',
  styleUrl: './profesionales.css',
  templateUrl: './profesionales.html',
})
export class Profesionales {
  private readonly facade = inject(CatalogoFacade);
  private readonly recurso = this.facade.profesionales();

  readonly busqueda = signal('');
  readonly cargando = this.recurso.isLoading;
  readonly error = this.recurso.error;
  readonly profesionales = computed(() =>
    this.facade.filtrarProfesionales(this.recurso.hasValue() ? this.recurso.value() : [], this.busqueda()),
  );
}
