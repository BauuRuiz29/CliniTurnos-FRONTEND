import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  // Valores que escribe el usuario en los inputs
  login = '';
  password = '';

  // Mensaje si el backend rechaza el login
  errorMessage = '';

  // inject = pedir el “ayudante” sin usar tanto el constructor
  private router = inject(Router);
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  ingresar(): void {
    this.errorMessage = '';
    this.cdr.detectChanges(); // limpia el error en pantalla al toque

    // Validación mínima en el front
    if (!this.login.trim() || !this.password) {
      this.errorMessage = 'Completá usuario y contraseña';
      return;
    }

    // Llamada al backend
    this.auth.login(this.login.trim(), this.password).subscribe({
      // Si el backend responde OK (200)
      next: () => {
        // Token ya quedó guardado en localStorage (lo hace AuthService)
        this.router.navigate(['/paciente']);
      },
      // Si falla (401, 400, red, etc.)
      error: (err) => {
        console.error(err); // lo ves en F12 → Console
        this.errorMessage =
          err?.error?.detail ||
          err?.error?.non_field_errors?.[0] ||
          'Usuario o contraseña incorrectos';
        this.cdr.detectChanges(); // ← muestra el error sin tocar el input
      },
    });
  }

  //constructor(private router: Router) {}

  //ingresar(): void {
  //  this.router.navigate(['/paciente']);
  //}

  volverHome(): void {
    this.router.navigate(['/']);
  }

}