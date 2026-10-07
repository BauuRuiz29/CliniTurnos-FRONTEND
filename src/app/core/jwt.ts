import { Rol } from './models/enums';

// TODO: confirmar con el back el nombre del claim del rol.
const CLAIM_ROL = 'rol';

export interface JwtPayload {
    /** Vencimiento en segundos desde epoch (estándar JWT). */
    exp?: number;
    rol?: Rol;
}

/**
 * Lee el payload del JWT. NO verifica la firma: eso es responsabilidad del back,
 * que rechaza cualquier token adulterado. El front solo lo usa para UX (rol, vencimiento).
 */
export function decodificarJwt(token: string): JwtPayload | null {
    const partes = token.split('.');
    if (partes.length !== 3) return null;

    try {
        const base64 = partes[1].replace(/-/g, '+').replace(/_/g, '/');
        const json = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
                .join(''),
        );
        const crudo = JSON.parse(json) as Record<string, unknown>; //otras cosas
        const rol = crudo[CLAIM_ROL];
        return {
            exp: typeof crudo['exp'] === 'number' ? crudo['exp'] : undefined,
            rol: esRol(rol) ? rol : undefined,
        };
    } catch {
        return null;
    }
}

export function jwtVencido(payload: JwtPayload, ahoraMs = Date.now()): boolean {
    return payload.exp !== undefined && payload.exp * 1000 <= ahoraMs;
}

function esRol(valor: unknown): valor is Rol {
    return Object.values(Rol).includes(valor as Rol);
}
