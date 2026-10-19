import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Profesionales } from './profesionales';

async function crear(queryParams: Record<string, string>): Promise<ComponentFixture<Profesionales>> {
  await TestBed.configureTestingModule({
    imports: [Profesionales],
    providers: [
      provideRouter([]),
      { provide: ActivatedRoute, useValue: { queryParamMap: of(convertToParamMap(queryParams)) } },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(Profesionales);
  await fixture.whenStable();
  return fixture;
}

describe('Profesionales', () => {
  it('sin parámetro muestra todos los profesionales', async () => {
    const { componentInstance } = await crear({});
    expect(componentInstance.especialidadActiva()).toBeNull();
    expect(componentInstance.profesionales().length).toBe(3);
  });

  it('con ?especialidad filtra la lista', async () => {
    const { componentInstance } = await crear({ especialidad: '2' });
    expect(componentInstance.especialidadActiva()?.nombre).toBe('Dermatología');
    expect(componentInstance.profesionales().map((p) => p.apellido)).toEqual(['López']);
  });

  it('un id de especialidad inexistente se toma como sin filtro', async () => {
    const { componentInstance } = await crear({ especialidad: '999' });
    expect(componentInstance.especialidadActiva()).toBeNull();
    expect(componentInstance.profesionales().length).toBe(3);
  });
});
