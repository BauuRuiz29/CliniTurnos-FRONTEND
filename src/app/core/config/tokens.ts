//esto es para hacer "variables globales" que se usan en varias partes del proyecto
//se hace así por si el dia de mañana cambia, se cambia desde acá en vez de cambiarlo en cada lugar (ademas queda mas legible)

//el injectionToken es para que se tokenize el valor fijo
//por ej, tenes dos variables globales q son "24", el token hace q ese 24 sean dos 24 distintos
import { InjectionToken } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Rol } from '../models/enums';

/** Horas mínimas de anticipación para cancelar o reprogramar un turno [R08, R12]. */
export const VENTANA_CANCELACION_HORAS = new InjectionToken<number>('VENTANA_CANCELACION_HORAS', {
  providedIn: 'root',
  factory: () => 24, 
});

/** URL base de la API (sin barra final). */
export const API_URL = new InjectionToken<string>('API_URL', {
  providedIn: 'root',
  factory: () => environment.apiUrl,
});

/** true = no se llama al back para la sesión: se usa un usuario simulado con ROL_SESION_SIMULADA. */
export const SESION_SIMULADA = new InjectionToken<boolean>('SESION_SIMULADA', {
  providedIn: 'root',
  factory: () => environment.sesionSimulada,
});

/** Rol del usuario de la sesión simulada (solo si SESION_SIMULADA es true). */
export const ROL_SESION_SIMULADA = new InjectionToken<Rol>('ROL_SESION_SIMULADA', {
  providedIn: 'root',
  factory: () => Rol.MEDICO,
});
