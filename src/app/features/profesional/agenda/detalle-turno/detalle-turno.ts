import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TURNOS, iniciales } from '../../data-access/datos-prototipo';

/** Detalle del turno: desde acá se inicia la atención, se reprograma o se cancela [R12, R13]. */
@Component({
  imports: [RouterLink],
  selector: 'app-profesional-detalle-turno',
  styleUrl: './detalle-turno.css',
  templateUrl: './detalle-turno.html',
})
export class DetalleTurno {
  private readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('turnoId'));
  readonly turno = TURNOS.find((t) => t.id === this.id);
  readonly iniciales = iniciales(this.turno?.nombre ?? '');

  constructor() {
    if (!this.turno) void inject(Router).navigate(['/profesional/agenda']);
  }
}
