import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { EstadoTurno } from '../../../core/models/enums';
import { AgendaFalsa, turnoDePrueba } from '../testing/datos-prueba';
import { Agenda } from './agenda';
import { AgendaRepository } from './data-access/agenda.repository';
import { accionTurno } from './turno-vista';

describe('Agenda', () => {
  let fixture: ComponentFixture<Agenda>;
  let component: Agenda;

  async function crear(filtro: string | null = null) {
    const repo = new AgendaFalsa();
    repo.turnos = [
      turnoDePrueba({ id: 1, fecha: '2026-10-20', estado: EstadoTurno.FINALIZADO }),
      turnoDePrueba({ id: 2, fecha: '2026-10-28', estado: EstadoTurno.RESERVADO }),
      turnoDePrueba({ id: 3, fecha: '2026-10-27', estado: EstadoTurno.EN_CURSO }),
      turnoDePrueba({ id: 4, fecha: '2026-10-22', estado: EstadoTurno.CANCELADO }),
    ];
    await TestBed.configureTestingModule({
      imports: [Agenda],
      providers: [
        provideRouter([]),
        { provide: AgendaRepository, useValue: repo },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(filtro ? { filtro } : {}) } } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(Agenda);
    component = fixture.componentInstance;
    await fixture.whenStable();
  }

  it('pendientes del más próximo al más lejano, pasados del más reciente al más viejo [R11]', async () => {
    await crear();
    component.filtro.set('Pendientes');
    expect(component.turnos().map((t) => t.id)).toEqual([3, 2]);
    component.filtro.set('Pasados');
    expect(component.turnos().map((t) => t.id)).toEqual([4, 1]);
    component.filtro.set('Todos');
    expect(component.turnos().map((t) => t.id)).toEqual([3, 2, 4, 1]);
  });

  it('toma el filtro inicial de la URL', async () => {
    await crear('Pendientes');
    expect(component.filtro()).toBe('Pendientes');
  });

  it('la acción de la fila depende del estado', () => {
    expect(accionTurno(turnoDePrueba({ estado: EstadoTurno.RESERVADO })).texto).toBe('Detalle');
    expect(accionTurno(turnoDePrueba({ estado: EstadoTurno.EN_CURSO })).texto).toBe('Completar informe');
    expect(accionTurno(turnoDePrueba({ estado: EstadoTurno.FINALIZADO })).texto).toBe('Ver informe');
  });
});
