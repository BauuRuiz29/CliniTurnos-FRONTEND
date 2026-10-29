import { Component, ViewEncapsulation, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ItemSidebar, Sidebar } from '../../../shared/ui/sidebar/sidebar';
import { AuthService } from '../../auth/auth.service';

const MENU_ADMIN: ItemSidebar[] = [
  { texto: 'Inicio', ruta: 'inicio', icono: 'inicio.png' },
  { texto: 'Profesionales', ruta: 'profesionales', icono: 'profesional.png' },
  { texto: 'Especialidades', ruta: 'especialidades', icono: 'especialidad.png' },
  { texto: 'Usuarios', ruta: 'usuarios', icono: 'usuario.png' },
];

/* Layout del área admin: reutiliza la base de estilos del área profesional, cambian los items. */
@Component({
  encapsulation: ViewEncapsulation.None,
  imports: [RouterOutlet, Sidebar],
  selector: 'app-admin-layout',
  styleUrls: ['../profesional-layout/profesional-layout.css', './admin-layout.css'],
  templateUrl: './admin-layout.html',
})
export class AdminLayout {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly menu = MENU_ADMIN;

  cerrarSesion(): void {
    this.auth.logout();
    void this.router.navigate(['/']);
  }
}
