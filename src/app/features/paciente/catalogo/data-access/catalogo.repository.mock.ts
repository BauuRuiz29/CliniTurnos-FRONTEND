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
  { id: 1, nombre: 'Hemograma completo', descripcion: 'Evalúa los componentes de la sangre: glóbulos rojos, glóbulos blancos y plaquetas.', categoria: 'Hematología', preparacion: null },
  { id: 2, nombre: 'Glucemia', descripcion: 'Mide la cantidad de glucosa en sangre.', categoria: 'Bioquímica', preparacion: null },
  { id: 3, nombre: 'Examen de orina completo', descripcion: 'Análisis físico, químico y microscópico de orina.', categoria: 'Orina', preparacion: 'Primera orina de la mañana' },
  { id: 4, nombre: 'TSH', descripcion: 'Evalúa el funcionamiento de la glándula tiroides.', categoria: 'Hormonales', preparacion: null },
  { id: 5, nombre: 'PCR (Proteína C Reactiva)', descripcion: 'Marcador de inflamación en el organismo.', categoria: 'Inmunología', preparacion: null },
  { id: 6, nombre: 'VDRL', descripcion: 'Detección de sífilis.', categoria: 'Serología', preparacion: null },
  { id: 7, nombre: 'Urocultivo', descripcion: 'Detecta infecciones urinarias.', categoria: 'Microbiología', preparacion: 'Antes del antibiótico' },
  { id: 8, nombre: 'Perfil lipídico', descripcion: 'Colesterol total, HDL, LDL y triglicéridos.', categoria: 'Bioquímica', preparacion: 'Ayuno de 12 horas' },
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
