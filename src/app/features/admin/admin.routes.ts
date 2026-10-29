import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
	{
		path: '',
		loadComponent: () =>
			import('../../core/layout/admin-layout/admin-layout')
				.then(m => m.AdminLayout),
		children: [
			{ path: '', pathMatch: 'full', redirectTo: 'inicio' },
			{
				path: 'inicio',
				loadComponent: () => import('./inicio/inicio').then(m => m.Inicio),
			},
			{
				path: 'profesionales',
				loadComponent: () => import('./profesionales/profesionales').then(m => m.Profesionales),
			},
			{
				path: 'profesionales/nuevo',
				loadComponent: () => import('./profesionales/nuevo-profesional/nuevo-profesional').then(m => m.NuevoProfesional),
			},
			{
				path: 'especialidades',
				loadComponent: () => import('./especialidades/especialidades').then(m => m.Especialidades),
			},
			{
				path: 'especialidades/nueva',
				loadComponent: () => import('./especialidades/especialidad-form/especialidad-form').then(m => m.EspecialidadForm),
			},
			{
				path: 'especialidades/:especialidadId',
				loadComponent: () => import('./especialidades/especialidad-form/especialidad-form').then(m => m.EspecialidadForm),
			},
			{
				path: 'usuarios',
				loadComponent: () => import('./usuarios/usuarios').then(m => m.Usuarios),
			},
		],
	},
];
