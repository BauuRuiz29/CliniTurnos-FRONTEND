import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { ROL_SESION_SIMULADA } from './config/tokens';
import { Rol } from './models/enums';
import { decodificarJwt, jwtVencido } from './jwt';

export interface LoginResponse {
    access: string;
    refresh: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private http = inject(HttpClient);
    private readonly rolSimulado = inject(ROL_SESION_SIMULADA);
    private readonly tokenKey = 'access_token';
    private readonly refreshKey = 'refresh_token';

    // Sesión simulada (environment.sesionSimulada): arranca logueada, vive solo en memoria.
    private readonly sesionSimulada = environment.sesionSimulada;
    private readonly simuladaActiva = signal(true);

    // Ajustá la ruta si en el back es /token/
    login(login: string, password: string): Observable<LoginResponse> {
        if (this.sesionSimulada) {
            this.simuladaActiva.set(true);
            return of({ access: '', refresh: '' });
        }

        return this.http
        .post<LoginResponse>(`${environment.apiUrl}/auth/login/`, {
            login,
            password,
        })
        .pipe(
            tap((res) => {
            localStorage.setItem(this.tokenKey, res.access);
            localStorage.setItem(this.refreshKey, res.refresh);
            })
        );
    }

    logout(): void {
        this.simuladaActiva.set(false);
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.refreshKey);
    }

    getAccessToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    isLoggedIn(): boolean {
        if (this.sesionSimulada) return this.simuladaActiva();

        const token = this.getAccessToken();
        if (!token) return false;
        const payload = decodificarJwt(token);
        return payload !== null && !jwtVencido(payload);
    }

    getRol(): Rol | null {
        if (!this.isLoggedIn()) return null;
        if (this.sesionSimulada) return this.rolSimulado;

        return decodificarJwt(this.getAccessToken() ?? '')?.rol ?? null;
    }
}
