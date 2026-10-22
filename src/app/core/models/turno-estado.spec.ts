import { EstadoTurno } from './enums';
import { dentroDeVentanaCancelacion, puedeTransicionar } from './turno-estado';

describe('turno-estado', () => {
  it('solo un turno RESERVADO se puede cancelar', () => {
    expect(puedeTransicionar(EstadoTurno.RESERVADO, EstadoTurno.CANCELADO)).toBe(true);
    expect(puedeTransicionar(EstadoTurno.FINALIZADO, EstadoTurno.CANCELADO)).toBe(false);
    expect(puedeTransicionar(EstadoTurno.CANCELADO, EstadoTurno.CANCELADO)).toBe(false);
  });

  it('respeta la ventana de 24 h [R08]', () => {
    const ahora = new Date(2026, 9, 19, 10, 0);
    expect(dentroDeVentanaCancelacion('2026-10-20', '10:00', ahora, 24)).toBe(true);
    expect(dentroDeVentanaCancelacion('2026-10-20', '09:59', ahora, 24)).toBe(false);
  });
});
