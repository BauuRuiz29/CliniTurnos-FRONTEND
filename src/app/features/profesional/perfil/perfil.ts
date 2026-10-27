import { Component, signal } from '@angular/core';
import { PROFESIONAL } from '../data-access/datos-prototipo';
import { Disponibilidad } from '../disponibilidad/disponibilidad';

type PestanaPerfil = 'Mis datos' | 'Contacto' | 'Disponibilidad';

/** Perfil del profesional: datos, contacto y disponibilidad horaria [R22]. TODO Fase B: edición. */
@Component({
  imports: [Disponibilidad],
  selector: 'app-perfil',
  styleUrl: './perfil.css',
  templateUrl: './perfil.html',
})
export class Perfil {
  readonly pestanas: PestanaPerfil[] = ['Mis datos', 'Contacto', 'Disponibilidad'];
  readonly pestana = signal<PestanaPerfil>('Mis datos');
  readonly profesional = PROFESIONAL;
}
