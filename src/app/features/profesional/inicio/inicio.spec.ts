import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService, UsuarioSesion } from '../../../core/auth/auth.service';
import { EstadoTurno, Genero, Rol } from '../../../core/models/enums';
import { isoLocal } from '../../../shared/utils/calendario';
import { AgendaRepository } from '../agenda/data-access/agenda.repository';
import { AgendaFalsa, turnoDePrueba } from '../testing/datos-prueba';
import { Inicio } from './inicio';

describe('Inicio (profesional)', () => {
  it('resume el día: turnos, pendientes e informes por completar', async () => {
    const hoy = isoLocal(new Date());
    const repo = new AgendaFalsa();
    repo.turnos = [
      turnoDePrueba({ id: 1, fecha: hoy, horaInicio: '11:00', estado: EstadoTurno.RESERVADO }),
      turnoDePrueba({ id: 2, fecha: hoy, horaInicio: '09:00', estado: EstadoTurno.EN_CURSO }),
      turnoDePrueba({ id: 3, fecha: hoy, horaInicio: '08:00', estado: EstadoTurno.FINALIZADO }),
      turnoDePrueba({ id: 4, fecha: hoy, horaInicio: '10:00', estado: EstadoTurno.CANCELADO }),
      turnoDePrueba({ id: 5, fecha: '2026-01-05', estado: EstadoTurno.EN_CURSO }),
    ];
    TestBed.configureTestingModule({ imports: [Inicio], providers: [provideRouter([]), { provide: AgendaRepository, useValue: repo }] });
    const fixture = TestBed.createComponent(Inicio);
    await fixture.whenStable();
    const c = fixture.componentInstance;

    expect(c.turnosHoy()).toBe(3);
    expect(c.pendientesHoy()).toBe(1);
    expect(c.informesPendientes()).toBe(2);
    expect(c.proximos().map((t) => t.id)).toEqual([2, 1]);
  });

  it('saluda con el usuario de la sesión y el título según el género', async () => {
    const usuario = signal<UsuarioSesion | null>({ id: 1, nombre: 'Laura', apellido: 'Gómez', genero: Genero.FEMENINO, roles: [Rol.MEDICO] });
    TestBed.configureTestingModule({
      imports: [Inicio],
      providers: [provideRouter([]), { provide: AgendaRepository, useValue: new AgendaFalsa() }, { provide: AuthService, useValue: { usuario } }],
    });
    const fixture = TestBed.createComponent(Inicio);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('h1')?.textContent).toContain('¡Hola, Dra. Laura Gómez!');

    usuario.update((u) => u && { ...u, genero: Genero.NO_BINARIO });
    expect(fixture.componentInstance.saludo()).toBe('Laura Gómez');
  });
});
