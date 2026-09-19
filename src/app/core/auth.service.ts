import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginResponse {
    access: string;
    refresh: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private http = inject(HttpClient);
    private readonly tokenKey = 'access_token';
    private readonly refreshKey = 'refresh_token';

    // Ajustá la ruta si en el back es /token/
    login(login: string, password: string): Observable<LoginResponse> {
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
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.refreshKey);
    }

    getAccessToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    isLoggedIn(): boolean {
        return !!this.getAccessToken();
    }
}