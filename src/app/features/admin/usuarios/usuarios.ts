import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/auth/auth.service';
import { Rol } from '../../../core/models/enums';
import { normalizar } from '../../../shared/utils/texto';
import { AdminRepository, UsuarioAdmin } from '../data-access/admin';

const ROL_TEXTO: Record<Rol, string> = { ADMIN: 'Administrador', MEDICO: 'Profesional', PACIENTE: 'Paciente' };

/**
 * Usuarios del sistema con activar/desactivar. Sin alta: los pacientes se registran solos
 * y los profesionales se dan de alta en Profesionales [R01, R16].
 */
@Component({
  selector: 'app-admin-usuarios',
  templateUrl: './usuarios.html',
})
export class Usuarios {
  private readonly repo = inject(AdminRepository);
  private readonly destroyRef = inject(DestroyRef);
  private readonly recurso = rxResource({ stream: () => this.repo.usuarios(), defaultValue: [] });
  // Desactivarse a uno mismo lo dejaría sin poder volver a ingresar.
  readonly miId = inject(AuthService).usuario()?.id ?? null;

  readonly busqueda = signal('');
  readonly cargando = this.recurso.isLoading;
  readonly error = this.recurso.error;
  readonly procesando = signal<number | null>(null);
  readonly errorAccion = signal('');

  readonly visibles = computed(() => {
    const texto = normalizar(this.busqueda());
    return (this.recurso.hasValue() ? this.recurso.value() : []).filter((u) =>
      normalizar(`${u.nombre} ${u.login} ${this.roles(u)}`).includes(texto),
    );
  });

  roles(u: UsuarioAdmin): string {
    return u.roles.map((r) => ROL_TEXTO[r] ?? r).join(' · ') || '-';
  }

  cambiarEstado(u: UsuarioAdmin): void {
    this.procesando.set(u.id);
    this.errorAccion.set('');
    this.repo
      .cambiarEstadoUsuario(u.id, !u.activo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.procesando.set(null);
          this.recurso.reload();
        },
        error: () => {
          this.procesando.set(null);
          this.errorAccion.set(`No pudimos ${u.activo ? 'desactivar' : 'activar'} a ${u.nombre}. Intentá de nuevo.`);
        },
      });
  }
}
