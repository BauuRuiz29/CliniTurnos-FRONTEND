import { formatDate } from '@angular/common';
import { EstadoTurno } from '../../core/models/enums';
import { fechaLarga } from './fechas';
import type { DiaSemana, Disponibilidad, Slot } from '../../core/models/disponibilidad';

//para pedir turnos 
export const VENTANA_DIAS = 30;

/** Índice = Date.getDay(). Qué días atiende lo define horarios_medico, no el calendario. */
export const DIAS_SEMANA: DiaSemana[] = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

export interface DiaCalendario {
  fecha: string; // yyyy-MM-dd
  numero: number;
  etiqueta: string; // fecha completa, para aria-label y el resumen
  habilitado: boolean;
}

export interface HorarioSlot {
  slot: Slot;
  habilitado: boolean;
}

export function isoLocal(fecha: Date): string {
  return formatDate(fecha, 'yyyy-MM-dd', 'en-US');
}

export function sumarDias(fecha: Date, dias: number): Date {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + dias);
}

export function tituloMes(anio: number, mes: number): string {
  const texto = new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(new Date(anio, mes, 1));
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** Celdas del mes empezando en lunes; `null` = hueco antes del día 1. */
export function armarMes(anio: number, mes: number, ahora: Date, disp: Disponibilidad): (DiaCalendario | null)[] {
  const hueco = (new Date(anio, mes, 1).getDay() + 6) % 7;
  const cantidad = new Date(anio, mes + 1, 0).getDate();
  const desde = isoLocal(ahora);
  const hasta = isoLocal(sumarDias(ahora, VENTANA_DIAS));

  const dias = Array.from({ length: cantidad }, (_, i): DiaCalendario => {
    const d = new Date(anio, mes, i + 1);
    const fecha = isoLocal(d);
    const dia = DIAS_SEMANA[d.getDay()];
    const habilitado =
      fecha >= desde &&
      fecha <= hasta &&
      disp.horarios.some((h) => h.diaSemana === dia) &&
      horariosDelDia(fecha, ahora, disp).some((h) => h.habilitado);
    return { fecha, numero: i + 1, etiqueta: fechaLarga(fecha), habilitado };
  });
  return [...Array<null>(hueco).fill(null), ...dias];
}

/** Slots del día ordenados; solo se puede elegir un DISPONIBLE, futuro y fuera de todo bloqueo. */
export function horariosDelDia(fecha: string, ahora: Date, disp: Disponibilidad): HorarioSlot[] {
  const ya = formatDate(ahora, "yyyy-MM-dd'T'HH:mm", 'en-US');
  return disp.slots
    .filter((s) => s.fecha === fecha)
    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
    .map((slot) => {
      const inicio = `${slot.fecha}T${slot.horaInicio}`;
      const fin = `${slot.fecha}T${slot.horaFin}`;
      const bloqueado = disp.bloqueos.some((b) => inicio < b.fechaHasta && fin > b.fechaDesde);
      return { slot, habilitado: slot.estado === EstadoTurno.DISPONIBLE && !bloqueado && inicio > ya };
    });
}
