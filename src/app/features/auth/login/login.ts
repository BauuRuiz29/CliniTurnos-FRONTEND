import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
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
      // Token ya quedó guardado en localStorage (lo hace AuthService)
      next: () => this.router.navigate(['/paciente']),
      // Si falla (401, 400, red, etc.)
      error: (err) => {
        this.errorMessage.set(
          err?.error?.detail ||
          err?.error?.non_field_errors?.[0] ||
          'Usuario o contraseña incorrectos'
        );
      },
    });
  }

  volverHome(): void {
    this.router.navigate(['/']);
  }

}
