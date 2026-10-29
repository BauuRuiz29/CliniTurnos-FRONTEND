import { Component, computed, effect, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { fechaLarga } from '../../../../shared/utils/fechas';
import { of } from 'rxjs';
import { AgendaRepository, TurnoProfesional } from '../data-access/agenda.repository';
import { nombrePaciente } from '../turno-vista';

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

/** Resultado de reprogramar (muestra el turno nuevo) o cancelar un turno [R12]. */
@Component({
  imports: [RouterLink],
  selector: 'app-profesional-confirmacion',
  styleUrl: './confirmacion.css',
  templateUrl: './confirmacion.html',
})
export class Confirmacion {
  private readonly repo = inject(AgendaRepository);
  private readonly router = inject(Router);
  private readonly snapshot = inject(ActivatedRoute).snapshot;
  private readonly id = Number(this.snapshot.paramMap.get('turnoId'));

  readonly tipo: TipoConfirmacion = this.snapshot.data['tipo'];
  readonly pagina = PAGINAS[this.tipo];
  // Al cancelar llega por navigation state (sobrevive al F5 vía history.state): el back pudo haber liberado la franja.
  private readonly cancelado: TurnoProfesional | undefined = (this.router.currentNavigation()?.extras.state ?? history.state)?.['turno'];
  readonly turno = rxResource({ stream: () => (this.cancelado ? of(this.cancelado) : this.repo.obtener(this.id)) });
  readonly nombre = computed(() => (this.turno.value() ? nombrePaciente(this.turno.value()!.paciente) : ''));
  readonly fecha = computed(() => (this.turno.value() ? fechaLarga(this.turno.value()!.fecha) : ''));

  constructor() {
    // Sin turno no hay nada que confirmar (entrada directa por URL).
    effect(() => {
      if (this.turno.hasValue() && !this.turno.value()) void this.router.navigate(['/profesional/agenda']);
    });
  }
}
