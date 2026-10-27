import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Disponibilidad } from './disponibilidad';

describe('Disponibilidad', () => {
  let component: Disponibilidad;
  let fixture: ComponentFixture<Disponibilidad>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Disponibilidad],
    }).compileComponents();

    fixture = TestBed.createComponent(Disponibilidad);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('muestra solo los horarios del día elegido', () => {
    component.dia.set('Lunes');
    expect(component.horariosDelDia()).toEqual([]);
    component.dia.set('Martes');
    expect(component.horariosDelDia().length).toBeGreaterThan(0);
  });

  it('activa y desactiva un horario', () => {
    const [primero] = component.horariosDelDia();
    component.alternar(primero);
    expect(component.horariosDelDia()[0].activo).toBe(!primero.activo);
  });
});
