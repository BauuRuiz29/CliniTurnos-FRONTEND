import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { PacienteAsignado, PacientesRepository } from './data-access/pacientes.repository';
import { Pacientes } from './pacientes';

const paciente = (id: number, nombre: string, apellido: string, dni: string): PacienteAsignado => ({
  id, nombre, apellido, numIdentificacion: dni, telefono: null, ultimaConsulta: null,
});

describe('Pacientes', () => {
  let component: Pacientes;

  beforeEach(async () => {
    const lista = [
      paciente(1, 'Marcela', 'Díaz', '23.998.657'),
      paciente(2, 'Ana', 'Álvarez', '44.976.577'),
      ...Array.from({ length: 5 }, (_, i) => paciente(10 + i, 'Paciente', `Zeta ${i}`, `1${i}`)),
    ];
    TestBed.configureTestingModule({
      imports: [Pacientes],
      providers: [provideRouter([]), { provide: PacientesRepository, useValue: { listar: () => of(lista) } }],
    });
    const fixture = TestBed.createComponent(Pacientes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('pagina de a 5, ordenado por apellido', () => {
    expect(component.paginas()).toBe(2);
    expect(component.visibles()[0].apellido).toBe('Álvarez');
    component.irA(2);
    expect(component.visibles().length).toBe(2);
    component.irA(9);
    expect(component.pagina()).toBe(2);
  });

  it('busca sin importar tildes y vuelve a la primera página', () => {
    component.irA(2);
    component.buscar('alvarez');
    expect(component.pagina()).toBe(1);
    expect(component.visibles().map((p) => p.id)).toEqual([2]);
  });
});
