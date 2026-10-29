import { TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { Bloqueo, DisponibilidadRepository, HorarioProfesional, NuevoBloqueo } from './data-access/disponibilidad.repository';
import { Disponibilidad } from './disponibilidad';

class DisponibilidadFalsa implements DisponibilidadRepository {
  lista: HorarioProfesional[] = [
    { id: 1, diaSemana: 'LUNES', horaDesde: '09:00', horaHasta: '10:00', duracionTurnosMin: 30, activo: true },
    { id: 2, diaSemana: 'LUNES', horaDesde: '08:00', horaHasta: '09:00', duracionTurnosMin: 30, activo: false },
    { id: 3, diaSemana: 'MARTES', horaDesde: '08:00', horaHasta: '09:00', duracionTurnosMin: 30, activo: true },
  ];
  bloqueados: NuevoBloqueo[] = [];
  horarios(): Observable<HorarioProfesional[]> {
    return of(this.lista);
  }
  cambiarActivo(id: number, activo: boolean): Observable<HorarioProfesional> {
    return of({ ...this.lista.find((h) => h.id === id)!, activo });
  }
  bloqueos(): Observable<Bloqueo[]> {
    return of([]);
  }
  bloquear(b: NuevoBloqueo): Observable<Bloqueo> {
    this.bloqueados.push(b);
    return of({ ...b, id: 10 });
  }
  desbloquear(): Observable<void> {
    return of(undefined);
  }
}

describe('Disponibilidad', () => {
  let repo: DisponibilidadFalsa;
  let component: Disponibilidad;

  beforeEach(async () => {
    repo = new DisponibilidadFalsa();
    TestBed.configureTestingModule({ imports: [Disponibilidad], providers: [{ provide: DisponibilidadRepository, useValue: repo }] });
    const fixture = TestBed.createComponent(Disponibilidad);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('muestra los horarios del día elegido, ordenados', () => {
    expect(component.horariosDelDia().map((h) => h.id)).toEqual([2, 1]);
    component.dia.set('MARTES');
    expect(component.horariosDelDia().map((h) => h.id)).toEqual([3]);
  });

  it('activa y desactiva un horario [R22]', () => {
    component.alternar(component.horariosDelDia()[0]);
    expect(component.horariosDelDia()[0].activo).toBe(true);
  });

  it('no bloquea si "hasta" no es posterior a "desde"', () => {
    component.form.setValue({ fechaDesde: '2999-01-02T10:00', fechaHasta: '2999-01-02T09:00', motivo: '' });
    component.bloquear(new Event('submit') as SubmitEvent);
    expect(repo.bloqueados).toEqual([]);
    expect(component.errorRango).toContain('posterior');
  });

  it('bloquea un rango válido y lo suma a la lista', () => {
    component.form.setValue({ fechaDesde: '2999-01-02T08:00', fechaHasta: '2999-01-02T12:00', motivo: ' Congreso ' });
    component.bloquear(new Event('submit') as SubmitEvent);
    expect(repo.bloqueados).toEqual([{ fechaDesde: '2999-01-02T08:00', fechaHasta: '2999-01-02T12:00', motivo: 'Congreso' }]);
    expect(component.bloqueos()?.length).toBe(1);
  });
});
