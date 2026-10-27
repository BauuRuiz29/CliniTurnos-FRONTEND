import { Routes } from '@angular/router';
import { rolGuard } from './core/guards/rol-guard';
import { Rol } from './core/models/enums';

export const routes: Routes = [

  {
    path: '',
    loadComponent: () =>
      import('./features/home/home')
        .then(m => m.Home)
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login')
        .then(m => m.Login)
  },

  {
    path: 'paciente',
    canMatch: [rolGuard(Rol.PACIENTE)],
    loadChildren: () =>
      import('./features/paciente/paciente.routes')
        .then(m => m.PACIENTE_ROUTES)
  },

  {
    path: 'registro',
    loadComponent: () =>
      import('./features/auth/registro/registro')
        .then(m => m.Registro)
  },

  {
    path: 'profesional',
    canMatch: [rolGuard(Rol.MEDICO)],
    loadChildren: () =>
      import('./features/profesional/profesional.routes')
        .then(m => m.PROFESIONAL_ROUTES)
  },

  {
  path: 'administrador',
    loadComponent: () =>
      import('./features/administrador/administrador')
        .then(m => m.AdministradorComponent)
  },

  {
  path: 'administrador-formularios',
    loadComponent: () =>
      import('./features/administrador-formularios/administrador-formularios')
        .then(m => m.AdministradorFormulariosComponent)
  },

  {
    path: '**',
    redirectTo: ''
  }

];