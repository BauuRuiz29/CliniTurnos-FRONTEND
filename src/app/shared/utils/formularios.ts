import { formatDate } from '@angular/common';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { Genero } from '../../core/models/enums';

export const GENEROS: { valor: Genero; texto: string }[] = [
  { valor: Genero.FEMENINO, texto: 'Femenino' },
  { valor: Genero.MASCULINO, texto: 'Masculino' },
  { valor: Genero.NO_BINARIO, texto: 'No binario' },
  { valor: Genero.PREFIERO_NO_DECIRLO, texto: 'Prefiero no decirlo' },
];

export const PATRON_TELEFONO = /^[0-9+()\s-]{6,}$/;

export function hoyIso(): string {
  return formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
}

export function noFutura(control: AbstractControl<string>): ValidationErrors | null {
  return control.value && control.value > hoyIso() ? { fechaFutura: true } : null;
}
