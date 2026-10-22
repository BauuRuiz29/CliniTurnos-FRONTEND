import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogoFacade } from '../../data-access/catalogo.facade';

interface IconoCategoria {
  icon: string;
  width: number;
  iconClass: string;
}

// Presentación por categoría (íconos de /public y colores del CSS).
const ICONOS_ESTUDIO: Record<string, IconoCategoria> = {
  'Hematología': { icon: 'hematologia.png', width: 30, iconClass: 'laboratory-study__icon--red' },
  'Bioquímica': { icon: 'bioquimica.png', width: 30, iconClass: 'laboratory-study__icon--purple' },
  'Orina': { icon: 'orina.png', width: 25, iconClass: 'laboratory-study__icon--orange' },
  'Hormonales': { icon: 'tsh.png', width: 25, iconClass: 'laboratory-study__icon--pink' },
  'Inmunología': { icon: 'pcr.png', width: 25, iconClass: 'laboratory-study__icon--green' },
  'Serología': { icon: 'vdrl.png', width: 25, iconClass: 'laboratory-study__icon--blue' },
  'Microbiología': { icon: 'urocultivo.png', width: 30, iconClass: 'laboratory-study__icon--cyan' },
};
const ICONO_POR_DEFECTO: IconoCategoria = { icon: '', width: 0, iconClass: 'laboratory-study__icon--gray' };

@Component({
  imports: [RouterLink],
  selector: 'app-laboratorio',
  styleUrl: './laboratorio.css',
  templateUrl: './laboratorio.html',
})
export class Laboratorio {
  private readonly facade = inject(CatalogoFacade);
  private readonly recurso = this.facade.tiposEstudio();

  /** `categoria` null = "Todos los estudios". */
  readonly categories: { name: string; categoria: string | null; icon: string; width: number }[] = [
    { name: 'Todos los estudios', categoria: null, icon: 'estudios.png', width: 20 },
    { name: 'Hematología', categoria: 'Hematología', icon: 'gota.png', width: 15 },
    { name: 'Bioquímica', categoria: 'Bioquímica', icon: 'tubo.png', width: 15 },
    { name: 'Orina', categoria: 'Orina', icon: 'orinas.png', width: 15 },
    { name: 'Hormonales', categoria: 'Hormonales', icon: 'hormonas.png', width: 20 },
    { name: 'Inmunología', categoria: 'Inmunología', icon: 'inmuno.png', width: 20 },
    { name: 'Serología', categoria: 'Serología', icon: 'serologia.png', width: 20 },
    { name: 'Microbiología', categoria: 'Microbiología', icon: 'microbiologia.png', width: 20 },
    { name: 'Otros', categoria: 'Otros', icon: 'otros.png', width: 25 },
  ];

  readonly busqueda = signal('');
  readonly categoriaSeleccionada = signal<string | null>(null);
  readonly cargando = this.recurso.isLoading;
  readonly error = this.recurso.error;
  readonly studies = computed(() =>
    this.facade.filtrarTiposEstudio(
      this.recurso.hasValue() ? this.recurso.value() : [],
      this.busqueda(),
      this.categoriaSeleccionada(),
    ),
  );

  icono(categoria: string): IconoCategoria {
    return ICONOS_ESTUDIO[categoria] ?? ICONO_POR_DEFECTO;
  }
}
