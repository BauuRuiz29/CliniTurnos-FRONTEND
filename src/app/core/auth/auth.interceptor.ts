import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { API_URL } from '../config/tokens';
import { AuthService } from './auth.service';

// Endpoints públicos o de la propia sesión: no llevan token ni se reintentan con refresh.
const SIN_TOKEN = ['/auth/login/', '/auth/refresh/', '/users/registro/'];

/**
 * Agrega el access token a los pedidos a la API. Si el back responde 401 (token vencido),
 * renueva con el refresh una sola vez y reintenta; si no se puede, cierra la sesión y va al login.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const apiUrl = inject(API_URL);

    if (!req.url.startsWith(apiUrl) || SIN_TOKEN.some((p) => req.url.endsWith(p))) return next(req);

    const token = auth.getAccessToken();
    return next(conToken(req, token)).pipe(
        catchError((error: unknown) => {
            if (!(error instanceof HttpErrorResponse) || error.status !== 401 || !token) return throwError(() => error);
            return auth.refrescar().pipe(
                catchError((errorRefresh: unknown) => {
                    auth.logout();
                    void router.navigate(['/login']);
                    return throwError(() => errorRefresh);
                }),
                switchMap((nuevo) => next(conToken(req, nuevo))),
            );
        }),
    );
};

function conToken(req: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
    return token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
}
