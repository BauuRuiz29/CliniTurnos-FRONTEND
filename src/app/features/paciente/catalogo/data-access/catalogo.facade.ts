import { Injectable, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Profesional, TipoEstudio } from './catalogo.models';
import { CatalogoRepository } from './catalogo.repository';

/**
 * Única puerta de entrada de las páginas del catálogo.
 * Los métodos que devuelven recursos se llaman al crear la página (contexto de inyección):
 * el recurso vive lo que vive la página, así cada visita trae datos frescos.
 */
@Injectable({ providedIn: 'root' })
export class CatalogoFacade {
  private readonly repo = inject(CatalogoRepository);

  especialidades() {
    return rxResource({ stream: () => this.repo.getEspecialidades(), defaultValue: [] });
  }

  profesionales() {
    return rxResource({ stream: () => this.repo.getProfesionales(), defaultValue: [] });
  }

  tiposEstudio() {
    return rxResource({ stream: () => this.repo.getTiposEstudio(), defaultValue: [] });
  }

  /** `especialidadId` null = todas. */
  filtrarProfesionales(profesionales: Profesional[], busqueda: string, especialidadId: number | null): Profesional[] {
    const texto = normalizar(busqueda);
    return profesionales.filter(
      (p) =>
        (especialidadId === null || p.especialidades.some((e) => e.id === especialidadId)) &&
        normalizar(`${p.nombre} ${p.apellido} ${p.especialidades.map((e) => e.nombre).join(' ')}`).includes(texto),
    );
  }

  /** `categoria` null = todas. */
  filtrarTiposEstudio(estudios: TipoEstudio[], busqueda: string, categoria: string | null): TipoEstudio[] {
    const texto = normalizar(busqueda);
    return estudios.filter(
      (e) => (categoria === null || e.categoria === categoria) && normalizar(e.nombre).includes(texto),
    );
  }
}

//para obviar mayus, espacios, tildes, blablabla
function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}
