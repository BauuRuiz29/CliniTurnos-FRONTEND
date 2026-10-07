//esto es para hacer "variables globales" que se usan en varias partes del proyecto
//se hace así por si el dia de mañana cambia, se cambia desde acá en vez de cambiarlo en cada lugar (ademas queda mas legible)

//el injectionToken es para que se tokenize el valor fijo
//por ej, tenes dos variables globales q son "24", el token hace q ese 24 sean dos 24 distintos
import { InjectionToken } from '@angular/core';
import { Rol } from '../models/enums';

/** Horas mínimas de anticipación para cancelar o reprogramar un turno [R08, R12]. */
export const VENTANA_CANCELACION_HORAS = new InjectionToken<number>('VENTANA_CANCELACION_HORAS', {
  providedIn: 'root',
  factory: () => 24, 
});

/**
 * Rol de la sesión simulada. El login devuelve solo `access` y `refresh`;
 * hasta que el back exponga el rol del usuario, se toma de acá.
 */
export const ROL_SESION_SIMULADA = new InjectionToken<Rol>('ROL_SESION_SIMULADA', {
  providedIn: 'root',
  factory: () => Rol.PACIENTE,
});
