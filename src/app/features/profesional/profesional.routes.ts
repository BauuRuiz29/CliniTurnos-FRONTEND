import { Routes } from '@angular/router';

export const PROFESIONAL_ROUTES: Routes = [
	{
		path: '',
		loadComponent: () =>
			import('../../core/layout/profesional-layout/profesional-layout')
				.then(m => m.ProfesionalLayout),
		children: [
			{ path: '', pathMatch: 'full', redirectTo: 'inicio' },
			{
				path: 'inicio',
				loadComponent: () => import('./inicio/inicio').then(m => m.Inicio),
			},
			{
				path: 'agenda',
				loadComponent: () => import('./agenda/agenda').then(m => m.Agenda),
			},
			{
				path: 'turnos/:turnoId',
				loadComponent: () => import('./agenda/detalle-turno/detalle-turno').then(m => m.DetalleTurno),
			},
			{
				path: 'turnos/:turnoId/informe',
				loadComponent: () => import('./atencion/completar-informe/completar-informe').then(m => m.CompletarInforme),
			},
			{
				path: 'turnos/:turnoId/reprogramar',
				loadComponent: () => import('./agenda/reprogramar/reprogramar').then(m => m.Reprogramar),
			},
			{
				path: 'turnos/:turnoId/reprogramado',
				data: { tipo: 'reprogramado' },
				loadComponent: () => import('./agenda/confirmacion/confirmacion').then(m => m.Confirmacion),
			},
			{
				path: 'turnos/:turnoId/cancelado',
				data: { tipo: 'cancelado' },
				loadComponent: () => import('./agenda/confirmacion/confirmacion').then(m => m.Confirmacion),
			},
			{
				path: 'perfil',
				loadComponent: () => import('./perfil/perfil').then(m => m.Perfil),
			},
			{
				path: 'pacientes',
				loadComponent: () => import('./pacientes/pacientes').then(m => m.Pacientes),
			},
			{
				path: 'pacientes/:pacienteId',
				loadComponent: () => import('./pacientes/perfil-paciente/perfil-paciente').then(m => m.PerfilPaciente),
			},
			{
				path: 'notificaciones',
				loadComponent: () => import('./notificaciones/notificaciones').then(m => m.Notificaciones),
			},
		],
	},
];
