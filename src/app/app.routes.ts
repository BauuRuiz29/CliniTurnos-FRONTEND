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
    path: '**',
    redirectTo: ''
  }

];