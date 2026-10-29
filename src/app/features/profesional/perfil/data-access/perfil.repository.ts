import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Genero } from '../../../../core/models/enums';
import { PerfilHttpRepository } from './perfil.repository.http';

// `usuarios` + `profesional_especialidades` + `matriculas`: lo que el back tiene del profesional.
export interface PerfilProfesional {
  nombre: string;
  apellido: string;
  foto: string | null; // URL
  genero: Genero | null;
  especialidades: string[];
  matriculas: string[]; // solo las activas, ej.: "MN 123456 · Nacional · Nación"
  correo: string; // usuarios.login
}

/** Datos del profesional logueado (solo lectura: no hay requerimiento de edición). */
@Injectable({ providedIn: 'root', useClass: PerfilHttpRepository })
export abstract class PerfilRepository {
  abstract obtener(): Observable<PerfilProfesional>;
}
