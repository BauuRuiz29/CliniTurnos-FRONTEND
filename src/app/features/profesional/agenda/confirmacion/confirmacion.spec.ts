import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { AgendaFalsa, turnoDePrueba } from '../../testing/datos-prueba';
import { AgendaRepository } from '../data-access/agenda.repository';
import { Confirmacion } from './confirmacion';

describe('Confirmacion (profesional)', () => {
  let fixture: ComponentFixture<Confirmacion>;

  beforeEach(async () => {
    const repo = new AgendaFalsa();
    repo.turnos = [turnoDePrueba({ id: 1 })];
    await TestBed.configureTestingModule({
      imports: [Confirmacion],
      providers: [
        provideRouter([]),
        { provide: AgendaRepository, useValue: repo },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ turnoId: '1' }), data: { tipo: 'cancelado' } } } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(Confirmacion);
    await fixture.whenStable();
  });

  it('muestra el turno cancelado', () => {
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Turno cancelado');
    expect(texto).toContain('Marcela Díaz');
  });
});
