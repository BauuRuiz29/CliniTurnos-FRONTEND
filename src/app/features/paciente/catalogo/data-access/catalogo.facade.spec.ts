import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CatalogoFacade } from './catalogo.facade';
import { Profesional, TipoEstudio } from './catalogo.models';
import { CatalogoRepository } from './catalogo.repository';
import { CatalogoMockRepository } from './catalogo.repository.mock';

const garcia: Profesional = { id: 1, nombre: 'Juan', apellido: 'García', especialidades: [{ id: 1, nombre: 'Cardiología' }] };
const lopez: Profesional = { id: 2, nombre: 'María', apellido: 'López', especialidades: [{ id: 2, nombre: 'Dermatología' }] };
const fernandez: Profesional = { id: 3, nombre: 'Laura', apellido: 'Fernández', especialidades: [{ id: 5, nombre: 'Pediatría' }, { id: 6, nombre: 'Clínica médica' }] };

const hemograma: TipoEstudio = { id: 1, nombre: 'Hemograma completo', descripcion: '', duracionMin: null };
const glucemia: TipoEstudio = { id: 2, nombre: 'Glucemia', descripcion: '', duracionMin: 10 };

describe('CatalogoFacade', () => {
  let facade: CatalogoFacade;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [{ provide: CatalogoRepository, useClass: CatalogoMockRepository }] });
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

  it('un profesional con varias especialidades aparece en cualquiera de ellas', () => {
    expect(facade.filtrarProfesionales([garcia, fernandez], '', 6)).toEqual([fernandez]);
    expect(facade.filtrarProfesionales([garcia, fernandez], 'pediatria', null)).toEqual([fernandez]);
  });

  it('busca estudios por nombre [R20]', () => {
    expect(facade.filtrarTiposEstudio([hemograma, glucemia], '')).toEqual([hemograma, glucemia]);
    expect(facade.filtrarTiposEstudio([hemograma, glucemia], 'GLUCE')).toEqual([glucemia]);
  });

  it('carga los profesionales desde el repositorio', async () => {
    const recurso = TestBed.runInInjectionContext(() => facade.profesionales());
    await TestBed.inject(ApplicationRef).whenStable();
    expect(recurso.value().length).toBeGreaterThan(0);
  });
});
