import { Injectable, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Profesional, TipoEstudio } from './catalogo.models';
import { CatalogoRepository } from './catalogo.repository';
import { normalizar } from '../../../../shared/utils/texto';

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

  /** `fecha` vacía = todos; si cambia, se vuelve a pedir [R05]. */
  profesionales(fecha: () => string = () => '') {
    return rxResource({ params: fecha, stream: ({ params }) => this.repo.getProfesionales(params || undefined), defaultValue: [] });
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

  filtrarTiposEstudio(estudios: TipoEstudio[], busqueda: string): TipoEstudio[] {
    const texto = normalizar(busqueda);
    return estudios.filter((e) => normalizar(e.nombre).includes(texto));
  }
}
