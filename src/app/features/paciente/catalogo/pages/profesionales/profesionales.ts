import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
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
  private readonly especialidades = this.facade.especialidades();
  private readonly especialidadParam = toSignal(
    inject(ActivatedRoute).queryParamMap.pipe(map((q) => Number(q.get('especialidad')))),
  );

  readonly busqueda = signal('');
  readonly cargando = computed(() => this.recurso.isLoading() || this.especialidades.isLoading());
  readonly error = this.recurso.error;
  /** Un id inexistente (o sin parámetro) se toma como "sin filtro". */
  readonly especialidadActiva = computed(
    () =>
      (this.especialidades.hasValue() ? this.especialidades.value() : []).find(
        (e) => e.id === this.especialidadParam(),
      ) ?? null,
  );
  readonly profesionales = computed(() =>
    this.facade.filtrarProfesionales(
      this.recurso.hasValue() ? this.recurso.value() : [],
      this.busqueda(),
      this.especialidadActiva()?.id ?? null,
    ),
  );
}
