import { Routes } from '@angular/router';

export const routes: Routes = [

  {
    path: '',
    loadComponent: () =>
      import('./home/home')
        .then(m => m.HomeComponent)
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./login/login')
        .then(m => m.LoginComponent)
  },

  {
    path: 'paciente',
    loadChildren: () =>
      import('./paciente/paciente.routes')
        .then(m => m.PACIENTE_ROUTES)
  },

  {
    path: 'registro',
    loadComponent: () =>
      import('./registro/registro')
        .then(m => m.RegistroComponent)
  },

  {
    path: '**',
    redirectTo: ''
  }

];