import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { normalizar } from '../../../shared/utils/texto';
import { AdminRepository, ProfesionalAdmin } from '../data-access/admin';

/** Profesionales del centro, con alta, baja y reactivación [R16]. */
@Component({
  imports: [RouterLink],
  selector: 'app-admin-profesionales',
  templateUrl: './profesionales.html',
})
export class Profesionales {
  private readonly repo = inject(AdminRepository);
  private readonly destroyRef = inject(DestroyRef);
  private readonly recurso = rxResource({ stream: () => this.repo.profesionales(), defaultValue: [] });

  readonly busqueda = signal('');
  readonly cargando = this.recurso.isLoading;
  readonly error = this.recurso.error;
  readonly procesando = signal<number | null>(null);
  readonly errorAccion = signal('');

  readonly visibles = computed(() => {
    const texto = normalizar(this.busqueda());
    return (this.recurso.hasValue() ? this.recurso.value() : []).filter((p) =>
      normalizar(`${p.nombre} ${p.especialidades.join(' ')}`).includes(texto),
    );
  });

  cambiarEstado(p: ProfesionalAdmin): void {
    this.procesando.set(p.id);
    this.errorAccion.set('');
    this.repo
      .cambiarEstadoProfesional(p.id, !p.activo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.procesando.set(null);
          this.recurso.reload();
        },
        error: () => {
          this.procesando.set(null);
          this.errorAccion.set(`No pudimos ${p.activo ? 'dar de baja' : 'reactivar'} a ${p.nombre}. Intentá de nuevo.`);
        },
      });
  }
}
