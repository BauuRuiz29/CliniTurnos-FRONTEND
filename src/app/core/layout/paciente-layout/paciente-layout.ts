import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-paciente-layout',
  styleUrl: './paciente-layout.css',
  templateUrl: './paciente-layout.html',
})
export class PacienteLayout {
  private readonly router = inject(Router);

  cerrarSesion(): void {
    void this.router.navigate(['/']);
  }
}
