import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, finalize, map, of, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { API_URL, ROL_SESION_SIMULADA, SESION_SIMULADA } from '../config/tokens';
import { Genero, Rol } from '../models/enums';
import { decodificarJwt, jwtVencido } from './jwt';

interface TokensDto {
    access: string;
    refresh?: string; // con ROTATE_REFRESH_TOKENS el refresh también devuelve uno nuevo
}

// Respuesta de GET /users/me/ (solo lo que usa la sesión).
interface MeDto {
    id: number;
    nombre: string;
    apellido: string;
    genero: Genero | null;
    roles: string[];
}

/** Usuario logueado. El JWT no trae el rol: sale de /users/me/. */
export interface UsuarioSesion {
    id: number;
    nombre: string;
    apellido: string;
    genero: Genero | null;
    roles: Rol[];
}

// Si un usuario tiene varios roles, define a qué área entra.
const PRIORIDAD_ROLES: Rol[] = [Rol.ADMIN, Rol.MEDICO, Rol.PACIENTE];

export function rolPrincipal(roles: readonly Rol[]): Rol | null {
    return PRIORIDAD_ROLES.find((r) => roles.includes(r)) ?? null;
}

/**
 * Sesión del usuario [R02]. Los tokens se guardan en localStorage; los datos del usuario
 * viven solo en memoria y se vuelven a pedir a /users/me/ al recargar.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = inject(API_URL);
    private readonly simulada = inject(SESION_SIMULADA);
    private readonly rolSimulado = inject(ROL_SESION_SIMULADA);
    private readonly tokenKey = 'access_token';
    private readonly refreshKey = 'refresh_token';

    private readonly usuarioActual = signal<UsuarioSesion | null>(null);
    private refrescando: Observable<string> | null = null;

    readonly usuario = this.usuarioActual.asReadonly();
    readonly rol = computed(() => rolPrincipal(this.usuarioActual()?.roles ?? []));

    constructor() {
        // Sesión simulada: arranca logueada, sin back.
        if (this.simulada) this.usuarioActual.set(this.usuarioSimulado());
    }

    login(login: string, password: string): Observable<UsuarioSesion> {
        if (this.simulada) {
            this.usuarioActual.set(this.usuarioSimulado());
            return of(this.usuarioSimulado());
        }
        return this.http.post<TokensDto>(`${this.apiUrl}/auth/login/`, { login, password }).pipe(
            tap((tokens) => this.guardarTokens(tokens)),
            switchMap(() => this.cargarUsuario()),
        );
    }

    logout(): void {
        this.usuarioActual.set(null);
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.refreshKey);
    }

    /**
     * Usuario de la sesión, pidiéndolo al back si hay tokens pero todavía no se cargó (por ejemplo, tras un F5).
     * null si no hay sesión válida.
     */
    sesion(): Observable<UsuarioSesion | null> {
        const actual = this.usuarioActual();
        if (actual) return of(actual);
        if (this.simulada || !this.haySesionRenovable()) return of(null);
        return this.cargarUsuario().pipe(
            catchError(() => {
                this.logout();
                return of(null);
            }),
        );
    }

    /** POST /auth/refresh/. Comparte el pedido si varias llamadas reciben 401 a la vez. */
    refrescar(): Observable<string> {
        const refresh = localStorage.getItem(this.refreshKey);
        if (!refresh) return throwError(() => new Error('Sin refresh token'));
        this.refrescando ??= this.http.post<TokensDto>(`${this.apiUrl}/auth/refresh/`, { refresh }).pipe(
            tap((tokens) => this.guardarTokens(tokens)),
            map((tokens) => tokens.access),
            finalize(() => (this.refrescando = null)),
            shareReplay(1),
        );
        return this.refrescando;
    }

    getAccessToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    isLoggedIn(): boolean {
        return this.usuarioActual() !== null;
    }

    getRol(): Rol | null {
        return this.rol();
    }

    private cargarUsuario(): Observable<UsuarioSesion> {
        return this.http.get<MeDto>(`${this.apiUrl}/users/me/`).pipe(
            map(aUsuarioSesion),
            tap((u) => this.usuarioActual.set(u)),
        );
    }

    private guardarTokens(tokens: TokensDto): void {
        localStorage.setItem(this.tokenKey, tokens.access);
        if (tokens.refresh) localStorage.setItem(this.refreshKey, tokens.refresh);
    }

    // Con el access vencido igual sirve si el refresh sigue vigente (el interceptor lo renueva).
    private haySesionRenovable(): boolean {
        const refresh = decodificarJwt(localStorage.getItem(this.refreshKey) ?? '');
        return refresh !== null && !jwtVencido(refresh);
    }

    private usuarioSimulado(): UsuarioSesion {
        return { id: 0, nombre: 'Usuario', apellido: 'Simulado', genero: null, roles: [this.rolSimulado] };
    }
}

function aUsuarioSesion(dto: MeDto): UsuarioSesion {
    return {
        id: dto.id,
        nombre: dto.nombre,
        apellido: dto.apellido,
        genero: dto.genero ?? null,
        roles: dto.roles.filter((r): r is Rol => (Object.values(Rol) as string[]).includes(r)),
    };
}
