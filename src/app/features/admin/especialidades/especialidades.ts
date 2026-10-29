import { Component, DestroyRef, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { normalizar } from '../../../shared/utils/texto';
import { AdminRepository, EspecialidadAdmin } from '../data-access/admin';

/** ABM de especialidades [R21]. */
@Component({
  imports: [RouterLink],
  selector: 'app-admin-especialidades',
  templateUrl: './especialidades.html',
})
export class Especialidades {
  private readonly repo = inject(AdminRepository);
  private readonly destroyRef = inject(DestroyRef);
  private readonly recurso = rxResource({ stream: () => this.repo.especialidades(), defaultValue: [] });
  private readonly dialogo = viewChild<ElementRef<HTMLDialogElement>>('confirmarBorrado');

  readonly busqueda = signal('');
  readonly cargando = this.recurso.isLoading;
  readonly error = this.recurso.error;
  readonly aBorrar = signal<EspecialidadAdmin | null>(null);
  readonly borrando = signal(false);
  readonly errorAccion = signal('');

  readonly visibles = computed(() => {
    const texto = normalizar(this.busqueda());
    return (this.recurso.hasValue() ? this.recurso.value() : []).filter((e) => normalizar(e.nombre).includes(texto));
  });

  pedirBorrado(e: EspecialidadAdmin): void {
    this.aBorrar.set(e);
    this.errorAccion.set('');
    this.dialogo()?.nativeElement.showModal();
  }

  cerrarDialogo(): void {
    this.dialogo()?.nativeElement.close();
  }

  borrar(): void {
    const e = this.aBorrar();
    if (!e || this.borrando()) return;
    this.borrando.set(true);
    this.repo
      .borrarEspecialidad(e.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.borrando.set(false);
          this.cerrarDialogo();
          this.recurso.reload();
        },
        error: () => {
          this.borrando.set(false);
          this.cerrarDialogo();
          this.errorAccion.set(`No pudimos eliminar ${e.nombre}. Intentá de nuevo.`);
        },
      });
  }
}
