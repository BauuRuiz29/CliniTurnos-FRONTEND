import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';

export const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: '**', redirectTo: '' } // Ruta comodín para redirigir si no coincide ninguna
];