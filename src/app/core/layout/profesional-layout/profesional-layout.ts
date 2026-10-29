import { Component, ViewEncapsulation, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ItemSidebar, Sidebar } from '../../../shared/ui/sidebar/sidebar';
import { AuthService } from '../../auth/auth.service';

// modulos sidebar de profesional
const MENU_PROFESIONAL: ItemSidebar[] = [
  { texto: 'Inicio', ruta: 'inicio', icono: 'inicio.png' },
  { texto: 'Agenda', ruta: 'agenda', icono: 'calendario.png' },
  { texto: 'Mi perfil', ruta: 'perfil', icono: 'profesional.png' },
  { texto: 'Pacientes', ruta: 'pacientes', icono: 'usuario.png' },
  { texto: 'Notificaciones', ruta: 'notificaciones', icono: 'notificacion.png' },
];

/* Layout del área profesional con los mismos estilos q los otros, noma cambian los items */
@Component({
  encapsulation: ViewEncapsulation.None,
  imports: [RouterOutlet, Sidebar],
  selector: 'app-profesional-layout',
  styleUrl: './profesional-layout.css',
  templateUrl: './profesional-layout.html',
})
export class ProfesionalLayout {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly menu = MENU_PROFESIONAL;

  cerrarSesion(): void {
    this.auth.logout();
    void this.router.navigate(['/']);
  }
}
