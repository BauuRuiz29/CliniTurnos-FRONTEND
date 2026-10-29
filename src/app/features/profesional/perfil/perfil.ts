import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Genero } from '../../../core/models/enums';
import { GENEROS } from '../../../shared/utils/formularios';
import { Disponibilidad } from '../disponibilidad/disponibilidad';
import { PerfilRepository } from './data-access/perfil.repository';

// "Contacto" no está: del back solo llega el correo, que se muestra en "Mis datos".
type PestanaPerfil = 'Mis datos' | 'Disponibilidad';

/**
 * Perfil del profesional: datos y disponibilidad horaria [R22].
 * Los datos son de solo lectura: no hay requerimiento de edición para el profesional.
 */
@Component({
  imports: [Disponibilidad],
  selector: 'app-perfil',
  styleUrl: './perfil.css',
  templateUrl: './perfil.html',
})
export class Perfil {
  private readonly repo = inject(PerfilRepository);

  readonly pestanas: PestanaPerfil[] = ['Mis datos', 'Disponibilidad'];
  readonly pestana = signal<PestanaPerfil>('Mis datos');
  readonly perfil = rxResource({ stream: () => this.repo.obtener() });

  genero(valor: Genero | null): string {
    return valor ? (GENEROS.find((g) => g.valor === valor)?.texto ?? valor) : '-';
  }
}
