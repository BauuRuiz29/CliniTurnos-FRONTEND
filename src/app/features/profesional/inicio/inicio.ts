import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PROFESIONAL, RESUMEN_HOY, TURNOS } from '../data-access/datos-prototipo';

@Component({
  imports: [RouterLink],
  selector: 'app-profesional-inicio',
  styleUrl: './inicio.css',
  templateUrl: './inicio.html',
})
export class Inicio {
  readonly profesional = PROFESIONAL;
  readonly resumen = RESUMEN_HOY;
  readonly pendientes = TURNOS.filter((t) => t.estado === 'Pendiente').length;
  readonly proximos = TURNOS.slice(0, 3);
}
