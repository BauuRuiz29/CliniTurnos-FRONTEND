import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService, rolPrincipal } from '../auth/auth.service';
import { rutaInicio } from '../auth/inicio-por-rol';
import { Rol } from '../models/enums';

/**
 * Permite entrar a la ruta solo si hay sesión y el usuario tiene alguno de los roles permitidos [Rnf 01].
 * Usa `canMatch` para que el chunk lazy del área ni siquiera se descargue si no corresponde.
 * Tras un F5 recupera la sesión con /users/me/. Sin sesión → /login. Con otro rol → el inicio de su área.
 */
export function rolGuard(...rolesPermitidos: Rol[]): CanMatchFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    return auth.sesion().pipe(
      map((usuario) => {
        if (!usuario) return router.createUrlTree(['/login']);
        if (usuario.roles.some((r) => rolesPermitidos.includes(r))) return true;
        return router.parseUrl(rutaInicio(rolPrincipal(usuario.roles)));
      }),
    );
  };
}
