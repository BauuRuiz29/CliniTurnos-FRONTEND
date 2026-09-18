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
    loadComponent: () =>
      import('./paciente/paciente')
        .then(m => m.PacienteComponent)
  },

  {
    path: '**',
    redirectTo: ''
  }

];