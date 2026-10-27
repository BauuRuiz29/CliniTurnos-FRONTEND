import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TURNOS } from '../../data-access/datos-prototipo';

type TipoConfirmacion = 'reprogramado' | 'cancelado';

interface PaginaConfirmacion {
  icono: string;
  titulo: string;
  descripcion: string;
  tituloDetalle: string;
  mensaje: string;
}

// Textos del prototipo.
const PAGINAS: Record<TipoConfirmacion, PaginaConfirmacion> = {
  reprogramado: {
    icono: '◷',
    titulo: 'Turno reprogramado',
    descripcion: 'El turno fue reprogramado',
    tituloDetalle: 'Nuevo detalle del turno',
    mensaje: 'Te enviamos los nuevos detalles a tu correo electrónico.',
  },
  cancelado: {
    icono: '×',
    titulo: 'Turno cancelado',
    descripcion: 'El turno fue cancelado',
    tituloDetalle: 'Detalle del turno cancelado',
    mensaje: 'Podés reservar un nuevo turno cuando lo necesites.',
  },
};

/** Resultado de reprogramar o cancelar un turno [R12]. */
@Component({
  imports: [RouterLink],
  selector: 'app-profesional-confirmacion',
  styleUrl: './confirmacion.css',
  templateUrl: './confirmacion.html',
})
export class Confirmacion {
  private readonly snapshot = inject(ActivatedRoute).snapshot;
  readonly tipo: TipoConfirmacion = this.snapshot.data['tipo'];
  readonly pagina = PAGINAS[this.tipo];
  readonly turno = TURNOS.find((t) => t.id === Number(this.snapshot.paramMap.get('turnoId')));

  constructor() {
    if (!this.turno) void inject(Router).navigate(['/profesional/agenda']);
  }
}
