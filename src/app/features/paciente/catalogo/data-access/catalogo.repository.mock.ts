import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { Especialidad, Profesional, TipoEstudio } from './catalogo.models';
import type { CatalogoRepository } from './catalogo.repository';

//#region DATOS FORZAOS
//TO-DO: dsp implementar con el backend
const DEMORA_MS = 200;

const ESPECIALIDADES: Especialidad[] = [
  { id: 1, nombre: 'Cardiología', descripcion: 'Diagnóstico y tratamiento de enfermedades del corazón.' },
  { id: 2, nombre: 'Dermatología', descripcion: 'Tratamiento de enfermedades de la piel.' },
  { id: 3, nombre: 'Ginecología', descripcion: 'Salud femenina durante todas las etapas.' },
  { id: 4, nombre: 'Neurología', descripcion: 'Evaluación y tratamiento de enfermedades neurológicas.' },
  { id: 5, nombre: 'Traumatología', descripcion: 'Lesiones y enfermedades del sistema musculoesquelético.' },
  { id: 6, nombre: 'Pediatría', descripcion: 'Atención médica integral de niños y adolescentes.' },
];

const PROFESIONALES: Profesional[] = [
  { id: 1, nombre: 'Juan', apellido: 'García', especialidades: [{ id: 1, nombre: 'Cardiología' }] },
  { id: 2, nombre: 'María', apellido: 'López', especialidades: [{ id: 2, nombre: 'Dermatología' }] },
  { id: 3, nombre: 'Pablo', apellido: 'Sánchez', especialidades: [{ id: 5, nombre: 'Traumatología' }] },
];

const TIPOS_ESTUDIO: TipoEstudio[] = [
  { id: 1, nombre: 'Hemograma completo', descripcion: 'Evalúa los componentes de la sangre, como glóbulos rojos, blancos y plaquetas.', duracionMin: 15 },
  { id: 2, nombre: 'Glucemia', descripcion: 'Mide el nivel de glucosa en sangre para detectar alteraciones metabólicas.', duracionMin: 10 },
  { id: 3, nombre: 'Examen de orina completo', descripcion: 'Analiza la composición de la orina para detectar infecciones o enfermedades.', duracionMin: 10 },
  { id: 4, nombre: 'TSH', descripcion: 'Evalúa el funcionamiento de la glándula tiroides mediante la hormona TSH.', duracionMin: 15 },
  { id: 5, nombre: 'Urocultivo', descripcion: 'Identifica bacterias causantes de infecciones urinarias.', duracionMin: 10 },
];
//#endregion

@Injectable()
export class CatalogoMockRepository implements CatalogoRepository {
  getEspecialidades(): Observable<Especialidad[]> {
    return of(ESPECIALIDADES).pipe(delay(DEMORA_MS));
  }

  getProfesionales(): Observable<Profesional[]> {
    return of(PROFESIONALES).pipe(delay(DEMORA_MS));
  }

  getTiposEstudio(): Observable<TipoEstudio[]> {
    return of(TIPOS_ESTUDIO).pipe(delay(DEMORA_MS));
  }
}
