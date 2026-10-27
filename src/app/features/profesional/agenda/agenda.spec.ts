import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Agenda } from './agenda';

describe('Agenda', () => {
  let component: Agenda;
  let fixture: ComponentFixture<Agenda>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Agenda],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Agenda);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('filtra pendientes y pasados', () => {
    component.filtro.set('Pendientes');
    expect(component.turnos().every((t) => t.estado === 'Pendiente')).toBe(true);
    component.filtro.set('Pasados');
    expect(component.turnos().every((t) => t.estado === 'Confirmado')).toBe(true);
  });
});
