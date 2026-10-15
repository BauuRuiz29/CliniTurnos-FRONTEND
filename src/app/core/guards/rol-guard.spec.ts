import { TestBed } from '@angular/core/testing';
import { PartialMatchRouteSnapshot, Route, Router, UrlTree, provideRouter } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Rol } from '../models/enums';
import { rolGuard } from './rol-guard';

describe('rolGuard', () => {
  let logueado: boolean;
  let rol: Rol | null;

  const ejecutar = (...roles: Rol[]) =>
    TestBed.runInInjectionContext(() => rolGuard(...roles)({} as Route, [], {} as PartialMatchRouteSnapshot));

  beforeEach(() => {
    logueado = true;
    rol = Rol.PACIENTE;
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { isLoggedIn: () => logueado, getRol: () => rol } },
      ],
    });
  });

  it('permite el acceso si el rol está permitido', () => {
    expect(ejecutar(Rol.PACIENTE)).toBe(true);
  });

  it('redirige a /login si no hay sesión', () => {
    logueado = false;
    const resultado = ejecutar(Rol.PACIENTE) as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(resultado)).toBe('/login');
  });

  it('redirige a / si el rol no está permitido', () => {
    rol = Rol.MEDICO;
    const resultado = ejecutar(Rol.PACIENTE) as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(resultado)).toBe('/');
  });
});
