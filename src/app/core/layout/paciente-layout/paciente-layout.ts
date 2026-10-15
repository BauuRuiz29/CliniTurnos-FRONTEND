import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-paciente-layout',
  styleUrl: './paciente-layout.css',
  templateUrl: './paciente-layout.html',
})
export class PacienteLayout {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  cerrarSesion(): void {
    this.auth.logout();
    void this.router.navigate(['/']);
  }
}
