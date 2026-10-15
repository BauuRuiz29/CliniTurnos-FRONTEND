import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.html',
  styleUrl: './registro.scss'
})
export class Registro {

  private readonly router = inject(Router);

  pasoRegistro = 1;

  siguientePaso(): void {
    if (this.pasoRegistro < 4) {
      this.pasoRegistro++;
    }
  }

  pasoAnterior(): void {
    if (this.pasoRegistro > 1) {
      this.pasoRegistro--;
    }
  }

  crearCuenta(): void {
    this.router.navigate(['/login']);
  }

  irLogin(): void {
    this.router.navigate(['/login']);
  }

  volverHome(): void {
    this.router.navigate(['/']);
  }
}
