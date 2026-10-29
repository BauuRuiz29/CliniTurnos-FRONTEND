import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { ItemSidebar, Sidebar } from '../../../shared/ui/sidebar/sidebar';
import { AuthService } from '../../auth/auth.service';

const MENU_PACIENTE: ItemSidebar[] = [
  { texto: 'Inicio', ruta: 'inicio', icono: 'inicio.png' },
  { texto: 'Mis turnos', ruta: 'turnos', icono: 'calendario.png' },
  { texto: 'Mis datos', ruta: 'mis-datos', icono: 'usuario.png' },
  { texto: 'Profesionales', ruta: 'profesionales', icono: 'profesional.png' },
  { texto: 'Especialidades', ruta: 'especialidades', icono: 'especialidad.png' },
  { texto: 'Informes médicos', ruta: 'informes', icono: 'informe.png' },
  { texto: 'Notificaciones', ruta: 'notificaciones', icono: 'notificacion.png' },
];

@Component({
  imports: [RouterLink, RouterOutlet, Sidebar],
  selector: 'app-paciente-layout',
  styleUrl: './paciente-layout.css',
  templateUrl: './paciente-layout.html',
})
export class PacienteLayout {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly menu = MENU_PACIENTE;
  readonly usuario = this.auth.usuario;
  
  readonly iniciales = computed(() => {
    const u = this.usuario();
    return u ? `${u.nombre.charAt(0)}${u.apellido.charAt(0)}`.toUpperCase() : '';
  }); //pal avatar 

  cerrarSesion(): void {
    this.auth.logout();
    void this.router.navigate(['/']);
  }
}
