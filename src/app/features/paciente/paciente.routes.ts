import { Routes } from '@angular/router';

export const PACIENTE_ROUTES: Routes = [
	{
		path: '',
		loadComponent: () =>
			import('../../core/layout/paciente-layout/paciente-layout')
				.then(m => m.PacienteLayout),
		children: [
			{ path: '', pathMatch: 'full', redirectTo: 'inicio' },
			{
				path: 'inicio',
				loadComponent: () => import('./inicio/inicio').then(m => m.Inicio),
			},
			{ path: 'reservar-turno', pathMatch: 'full', redirectTo: 'especialidades' },
			{
				path: 'reservar-turno/:profesionalId',
				loadComponent: () => import('./reservar-turno/reservar-turno').then(m => m.ReservarTurno),
			},
			{
				path: 'turnos',
				loadComponent: () => import('./turnos/turnos').then(m => m.Turnos),
			},
			{
				path: 'turnos/:turnoId',
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
			// Catálogo [profesionales, especialidades, laboratorio]: va último porque su path es ''.
			{
				path: '',
				loadChildren: () => import('./catalogo/catalogo.routes').then(m => m.CATALOGO_ROUTES),
			},
		],
	},
];
