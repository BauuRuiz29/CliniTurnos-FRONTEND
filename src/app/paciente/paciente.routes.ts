import { Routes } from '@angular/router';

export const PACIENTE_ROUTES: Routes = [
	{
		path: '',
		loadComponent: () =>
			import('./paciente-layout/paciente-layout')
				.then(m => m.PacienteLayout),
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
				path: 'especialidades',
				loadComponent: () => import('./especialidades/especialidades').then(m => m.Especialidades),
			},
			{
				path: 'laboratorio',
				loadComponent: () => import('./laboratorio/laboratorio').then(m => m.Laboratorio),
			},
			{
				path: 'reservar-turno',
				loadComponent: () => import('./reservar-turno/reservar-turno').then(m => m.ReservarTurno),
			},
			{
				path: 'turnos',
				loadComponent: () => import('./turnos/turnos').then(m => m.Turnos),
			},
			{
				path: 'turnos/detalle',
				loadComponent: () => import('./turnos/detalle-turno/detalle-turno').then(m => m.DetalleTurno),
			},
			{
				path: 'informes',
				loadComponent: () => import('./informes-medicos/informes-medicos').then(m => m.InformesMedicos),
			},
			{
				path: 'mis-datos',
				loadComponent: () => import('./mis-datos/mis-datos').then(m => m.MisDatos),
			},
			{
				path: 'confirmacion/:type',
				loadComponent: () => import('./confirmacion/confirmacion').then(m => m.Confirmacion),
			},
		],
	},
];
