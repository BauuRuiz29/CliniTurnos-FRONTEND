import { EstadoTurno } from '../../core/models/enums';
import { armarMes, horariosDelDia } from './calendario';
import { Disponibilidad, HorarioMedico, Slot } from '../../core/models/disponibilidad';

// Lunes 19/10/2026, 09:00.
const AHORA = new Date(2026, 9, 19, 9, 0);

const horario = (diaSemana: HorarioMedico['diaSemana']): HorarioMedico => ({ diaSemana, horaDesde: '08:00', horaHasta: '10:00', duracionTurnosMin: 30 });
let id = 1;
const slot = (fecha: string, horaInicio: string, estado: EstadoTurno = EstadoTurno.DISPONIBLE): Slot => {
  const [h, m] = horaInicio.split(':').map(Number);
  const fin = h * 60 + m + 30;
  return { turnoId: id++, fecha, horaInicio, horaFin: `${String(Math.floor(fin / 60)).padStart(2, '0')}:${String(fin % 60).padStart(2, '0')}`, estado };
};

function disp(parcial: Partial<Disponibilidad>): Disponibilidad {
  return { horarios: (['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'] as const).map(horario), bloqueos: [], slots: [], ...parcial };
}

function dia(celdas: ReturnType<typeof armarMes>, fecha: string) {
  return celdas.find((c) => c?.fecha === fecha)!;
}

describe('calendario', () => {
  it('empieza en lunes: octubre 2026 arranca jueves, con 3 huecos', () => {
    const celdas = armarMes(2026, 9, AHORA, disp({}));
    expect(celdas.slice(0, 3)).toEqual([null, null, null]);
    expect(celdas[3]?.numero).toBe(1);
    expect(celdas.filter((c) => c).length).toBe(31);
    expect(dia(celdas, '2026-10-20').etiqueta).toBe('martes, 20 de octubre de 2026');
  });

  it('habilita un día de semana con slots disponibles', () => {
    expect(dia(armarMes(2026, 9, AHORA, disp({ slots: [slot('2026-10-20', '08:00')] })), '2026-10-20').habilitado).toBe(true);
  });

  it('deshabilita sábado y domingo si no hay horarios_medico para esos días', () => {
    const celdas = armarMes(2026, 9, AHORA, disp({ slots: [slot('2026-10-24', '08:00'), slot('2026-10-25', '08:00')] }));
    expect(dia(celdas, '2026-10-24').habilitado).toBe(false);
    expect(dia(celdas, '2026-10-25').habilitado).toBe(false);
  });

  it('habilita el sábado si el profesional tiene horario ese día', () => {
    const celdas = armarMes(2026, 9, AHORA, disp({ horarios: [horario('SABADO')], slots: [slot('2026-10-24', '08:00')] }));
    expect(dia(celdas, '2026-10-24').habilitado).toBe(true);
  });

  it('deshabilita un día que el profesional no atiende', () => {
    const celdas = armarMes(2026, 9, AHORA, disp({ horarios: [horario('LUNES')], slots: [slot('2026-10-20', '08:00')] }));
    expect(dia(celdas, '2026-10-20').habilitado).toBe(false);
  });

  it('deshabilita un día bloqueado entero', () => {
    const celdas = armarMes(2026, 9, AHORA, disp({
      slots: [slot('2026-10-21', '08:00'), slot('2026-10-21', '09:00')],
      bloqueos: [{ fechaDesde: '2026-10-21T00:00', fechaHasta: '2026-10-21T23:59', motivo: 'Congreso' }],
    }));
    expect(dia(celdas, '2026-10-21').habilitado).toBe(false);
  });

  it('un bloqueo de horas deshabilita solo esos slots', () => {
    const d = disp({
      slots: [slot('2026-10-22', '08:00'), slot('2026-10-22', '09:00')],
      bloqueos: [{ fechaDesde: '2026-10-22T08:00', fechaHasta: '2026-10-22T09:00', motivo: null }],
    });
    expect(horariosDelDia('2026-10-22', AHORA, d).map((h) => h.habilitado)).toEqual([false, true]);
    expect(dia(armarMes(2026, 9, AHORA, d), '2026-10-22').habilitado).toBe(true);
  });

  it('deshabilita un día sin slots DISPONIBLE (todos reservados o bloqueados)', () => {
    const celdas = armarMes(2026, 9, AHORA, disp({
      slots: [slot('2026-10-23', '08:00', EstadoTurno.RESERVADO), slot('2026-10-23', '08:30', EstadoTurno.BLOQUEADO)],
    }));
    expect(dia(celdas, '2026-10-23').habilitado).toBe(false);
    expect(dia(celdas, '2026-10-26').habilitado).toBe(false); // sin slots generados
  });

  it('deshabilita días pasados, fuera de la ventana de 30 días y slots de hoy que ya pasaron', () => {
    const d = disp({ slots: [slot('2026-10-16', '08:00'), slot('2026-11-20', '08:00'), slot('2026-10-19', '08:30'), slot('2026-10-19', '09:30')] });
    expect(dia(armarMes(2026, 9, AHORA, d), '2026-10-16').habilitado).toBe(false);
    expect(dia(armarMes(2026, 10, AHORA, d), '2026-11-20').habilitado).toBe(false);
    expect(horariosDelDia('2026-10-19', AHORA, d).map((h) => h.habilitado)).toEqual([false, true]);
  });
});
