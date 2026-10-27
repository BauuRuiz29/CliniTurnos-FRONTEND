import { Rol } from '../models/enums';

// Strategy por rol [AGENTS §3.3]: a dónde va cada usuario después de loguearse.
export const INICIO_POR_ROL: Record<Rol, string> = {
  PACIENTE: '/paciente',
  MEDICO: '/profesional',
  ADMIN: '/administrador',
};

/** Sin rol (sesión inválida o claim faltante) → home pública. */
export function rutaInicio(rol: Rol | null): string {
  return rol === null ? '/' : INICIO_POR_ROL[rol];
}
