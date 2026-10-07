import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { Rol } from '../models/enums';

/**
 * Permite entrar a la ruta solo si hay sesión y el rol está entre los permitidos [Rnf 01].
 * Usa `canMatch` para que el chunk lazy del área ni siquiera se descargue si no corresponde.
 * Sin sesión → /login. Con otro rol → /.
 */
export function rolGuard(...rolesPermitidos: Rol[]): CanMatchFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isLoggedIn()) {
      return router.createUrlTree(['/login']);
    }

    const rol = auth.getRol();
    return rol !== null && rolesPermitidos.includes(rol) ? true : router.createUrlTree(['/']);
  };
}
