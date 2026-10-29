import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/auth/auth.service';
import { AdminRepository, Conteo } from '../data-access/admin';

/** Resumen general del sistema para el administrador. */
@Component({
  selector: 'app-admin-inicio',
  templateUrl: './inicio.html',
})
export class Inicio {
  private readonly repo = inject(AdminRepository);
  private readonly recurso = rxResource({ stream: () => this.repo.resumen() });

  readonly nombre = inject(AuthService).usuario()?.nombre ?? 'Administrador';
  readonly resumen = this.recurso.value;
  readonly cargando = this.recurso.isLoading;
  readonly error = this.recurso.error;

  porcentaje(c: Conteo, lista: Conteo[]): number {
    const total = lista.reduce((suma, x) => suma + x.cantidad, 0);
    return total ? Math.round((c.cantidad / total) * 100) : 0;
  }
}
