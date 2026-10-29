import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ProfesionalApi } from '../../data-access/profesional-api';
import type { PerfilProfesional, PerfilRepository } from './perfil.repository';

/** Perfil del profesional contra la API (/profesionales/profesionales/ + /users/me/). */
@Injectable()
export class PerfilHttpRepository implements PerfilRepository {
  private readonly api = inject(ProfesionalApi);

  obtener(): Observable<PerfilProfesional> {
    return this.api.miProfesional().pipe(
      map(({ profesional: p, genero }) => ({
        nombre: p.usuario.nombre,
        apellido: p.usuario.apellido,
        foto: p.usuario.foto,
        genero,
        especialidades: p.especialidades.map((e) => e.especialidad.nombre),
        matriculas: p.matriculas
          .filter((m) => m.activa)
          .map((m) => [m.numero_matricula, capitalizar(m.tipo_matricula), m.jurisdiccion].filter(Boolean).join(' · ')),
        correo: p.usuario.login,
      })),
    );
  }
}

// "NACIONAL" → "Nacional".
function capitalizar(texto: string): string {
  return texto.charAt(0) + texto.slice(1).toLowerCase();
}
