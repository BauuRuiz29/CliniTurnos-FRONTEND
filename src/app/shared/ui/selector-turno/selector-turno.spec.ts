import { TestBed } from '@angular/core/testing';
import { EstadoTurno } from '../../../core/models/enums';
import type { Disponibilidad, Slot } from '../../../core/models/disponibilidad';
import { DIAS_SEMANA, isoLocal, sumarDias } from '../../utils/calendario';
import { SelectorTurno } from './selector-turno';

// Mañana: siempre cae dentro de la ventana; el horario se arma para ese día de la semana.
const manana = sumarDias(new Date(), 1);
const FECHA = isoLocal(manana);

const libre: Slot = { turnoId: 10, fecha: FECHA, horaInicio: '08:00', horaFin: '08:30', estado: EstadoTurno.DISPONIBLE };
const ocupado: Slot = { turnoId: 11, fecha: FECHA, horaInicio: '08:30', horaFin: '09:00', estado: EstadoTurno.RESERVADO };

const DISPONIBILIDAD: Disponibilidad = {
  horarios: [{ diaSemana: DIAS_SEMANA[manana.getDay()], horaDesde: '08:00', horaHasta: '09:00', duracionTurnosMin: 30 }],
  bloqueos: [],
  slots: [libre, ocupado],
};

describe('SelectorTurno', () => {
  function crear(slot: Slot | null = null) {
    const fixture = TestBed.createComponent(SelectorTurno);
    fixture.componentRef.setInput('disponibilidad', DISPONIBILIDAD);
    fixture.componentRef.setInput('slot', slot);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  it('muestra los horarios del día y no deja elegir uno ocupado', () => {
    const c = crear();
    c.mes.set({ anio: manana.getFullYear(), mes: manana.getMonth() });
    c.elegirDia(c.dias().find((d) => d?.fecha === FECHA)!);
    expect(c.horarios().map((h) => h.habilitado)).toEqual([true, false]);

    c.elegirHorario(c.horarios()[1]);
    expect(c.slot()).toBeNull();
    c.elegirHorario(c.horarios()[0]);
    expect(c.slot()).toEqual(libre);
  });

  it('elegir otro día borra el horario elegido', () => {
    const c = crear(libre);
    c.elegirDia(c.dias().find((d) => d?.fecha === FECHA)!);
    expect(c.slot()).toBeNull();
  });

  it('si llega con una franja elegida abre en ese mes y ese día (al volver de la confirmación)', () => {
    const c = crear(libre);
    expect(c.mes()).toEqual({ anio: manana.getFullYear(), mes: manana.getMonth() });
    expect(c.fecha()).toBe(FECHA);
    expect(c.horarios().length).toBe(2);
  });
});
