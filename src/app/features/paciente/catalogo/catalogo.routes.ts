import { Routes } from '@angular/router';

export const CATALOGO_ROUTES: Routes = [
	{
		path: 'profesionales',
		loadComponent: () => import('./pages/profesionales/profesionales').then(m => m.Profesionales),
	},
	{
		path: 'especialidades',
		loadComponent: () => import('./pages/especialidades/especialidades').then(m => m.Especialidades),
	},
	{
		path: 'laboratorio',
		loadComponent: () => import('./pages/laboratorio/laboratorio').then(m => m.Laboratorio),
	},
];
