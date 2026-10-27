import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Pacientes } from './pacientes';

describe('Pacientes', () => {
  let component: Pacientes;
  let fixture: ComponentFixture<Pacientes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pacientes],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Pacientes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('busca por DNI y vuelve a la primera página', () => {
    component.pagina.set(2);
    component.buscar('28.123');
    expect(component.pagina()).toBe(1);
    expect(component.visibles().map((p) => p.nombre)).toEqual(['María López']);
  });
});
