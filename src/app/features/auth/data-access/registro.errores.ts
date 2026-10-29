import type { RegistroPaciente } from './registro.repository';

/** El back rechazó los datos: mensajes por campo del formulario (y generales, sin campo). */
export class RegistroInvalidoError extends Error {
  constructor(
    readonly campos: Partial<Record<keyof RegistroPaciente, string>>,
    readonly generales: string[],
  ) {
    super('Datos de registro inválidos');
  }
}
