import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService, rolPrincipal } from '../../../core/auth/auth.service';
import { rutaInicio } from '../../../core/auth/inicio-por-rol';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  // Valores que escribe el usuario en los inputs
  login = '';
  password = '';

  // Mensaje si el backend rechaza el login
  readonly errorMessage = signal('');

  private router = inject(Router);
  private auth = inject(AuthService);

  ingresar(): void {
    this.errorMessage.set('');

    // Validación mínima en el front
    if (!this.login.trim() || !this.password) {
      this.errorMessage.set('Completá usuario y contraseña');
      return;
    }

    this.auth.login(this.login.trim(), this.password).subscribe({
      // Tokens guardados y roles cargados desde /users/me/ (lo hace AuthService)
      next: (usuario) => this.router.navigateByUrl(rutaInicio(rolPrincipal(usuario.roles))),
      error: (err: unknown) => this.errorMessage.set(mensajeDeError(err)),
    });
  }

  volverHome(): void {
    this.router.navigate(['/']);
  }

}

// 401: credenciales incorrectas ({ detail }). 400: usuario dado de baja ({ non_field_errors }). 0: back caído.
function mensajeDeError(err: unknown): string {
  if (!(err instanceof HttpErrorResponse)) return 'No pudimos iniciar sesión. Intentá de nuevo.';
  if (err.status === 0) return 'No pudimos conectarnos con el servidor. Intentá más tarde.';
  if (err.status === 401) return 'Usuario o contraseña incorrectos.';
  return err.error?.non_field_errors?.[0] || err.error?.detail || 'No pudimos iniciar sesión. Intentá de nuevo.';
}
