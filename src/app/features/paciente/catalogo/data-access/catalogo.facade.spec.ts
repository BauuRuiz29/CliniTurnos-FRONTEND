import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CatalogoFacade } from './catalogo.facade';
import { Profesional, TipoEstudio } from './catalogo.models';

const garcia: Profesional = { id: 1, titulo: 'Dr.', nombre: 'Juan', apellido: 'García', especialidadId: 1, especialidad: 'Cardiología' };
const lopez: Profesional = { id: 2, titulo: 'Dra.', nombre: 'María', apellido: 'López', especialidadId: 2, especialidad: 'Dermatología' };

const hemograma: TipoEstudio = { id: 1, nombre: 'Hemograma completo', descripcion: '', categoria: 'Hematología', preparacion: null };
const glucemia: TipoEstudio = { id: 2, nombre: 'Glucemia', descripcion: '', categoria: 'Bioquímica', preparacion: null };

describe('CatalogoFacade', () => {
  let facade: CatalogoFacade;

  beforeEach(() => {
    facade = TestBed.inject(CatalogoFacade);
  });

  it('busca profesionales por nombre o especialidad, sin importar tildes ni mayúsculas', () => {
    expect(facade.filtrarProfesionales([garcia, lopez], 'garcia', null)).toEqual([garcia]);
    expect(facade.filtrarProfesionales([garcia, lopez], 'DERMATOLOGIA', null)).toEqual([lopez]);
    expect(facade.filtrarProfesionales([garcia, lopez], '  ', null)).toEqual([garcia, lopez]);
  });

  it('filtra profesionales por especialidad y lo combina con la búsqueda', () => {
    expect(facade.filtrarProfesionales([garcia, lopez], '', 2)).toEqual([lopez]);
    expect(facade.filtrarProfesionales([garcia, lopez], 'garcia', 2)).toEqual([]);
  });

  it('filtra estudios por categoría y por nombre', () => {
    expect(facade.filtrarTiposEstudio([hemograma, glucemia], '', null)).toEqual([hemograma, glucemia]);
    expect(facade.filtrarTiposEstudio([hemograma, glucemia], '', 'Bioquímica')).toEqual([glucemia]);
    expect(facade.filtrarTiposEstudio([hemograma, glucemia], 'hemo', 'Bioquímica')).toEqual([]);
  });

  it('carga los profesionales desde el repositorio', async () => {
    const recurso = TestBed.runInInjectionContext(() => facade.profesionales());
    await TestBed.inject(ApplicationRef).whenStable();
    expect(recurso.value().length).toBeGreaterThan(0);
  });
});
