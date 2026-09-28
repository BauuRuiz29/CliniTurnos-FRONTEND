import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [],
  templateUrl: './registro.html',
  styleUrl: './registro.scss'
})
export class RegistroComponent {

  pasoRegistro = 1;

  constructor(private router: Router) {}

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