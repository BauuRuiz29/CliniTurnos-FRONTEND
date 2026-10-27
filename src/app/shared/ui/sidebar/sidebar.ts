import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface ItemSidebar {
  texto: string;
  /** Relativa a la ruta del shell que usa el sidebar. */
  ruta: string;
  /** Imagen de /public. */
  icono: string;
}

/** Sidebar de las áreas logueadas. Cada shell le pasa su menú [AGENTS §3.3 Strategy]. */
@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-sidebar',
  styleUrl: './sidebar.css',
  templateUrl: './sidebar.html',
})
export class Sidebar {
  readonly items = input.required<ItemSidebar[]>();
  readonly ariaLabel = input.required<string>();
  readonly cerrarSesion = output<void>();
}
