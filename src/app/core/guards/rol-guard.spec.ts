import { TestBed } from '@angular/core/testing';
import { PartialMatchRouteSnapshot, Route, Router, UrlTree, provideRouter } from '@angular/router';
import { Observable, firstValueFrom, isObservable, of } from 'rxjs';
import { AuthService, UsuarioSesion } from '../auth/auth.service';
import { Rol } from '../models/enums';
import { rolGuard } from './rol-guard';

describe('rolGuard', () => {
  let usuario: UsuarioSesion | null;

  const ejecutar = async (...roles: Rol[]) => {
    const r = TestBed.runInInjectionContext(() => rolGuard(...roles)({} as Route, [], {} as PartialMatchRouteSnapshot));
    const valor = isObservable(r) ? await firstValueFrom(r as Observable<boolean | UrlTree>) : await r;
    return valor instanceof UrlTree ? TestBed.inject(Router).serializeUrl(valor) : valor;
  };

  beforeEach(() => {
    usuario = { id: 1, nombre: 'Ana', apellido: 'Paz', genero: null, roles: [Rol.PACIENTE] };
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: { sesion: () => of(usuario) } }],
    });
  });

  it('permite el acceso si el usuario tiene el rol', async () => {
    expect(await ejecutar(Rol.PACIENTE)).toBe(true);
  });

  it('redirige a /login si no hay sesión', async () => {
    usuario = null;
    expect(await ejecutar(Rol.PACIENTE)).toBe('/login');
  });

  it('con otro rol manda al inicio de su área', async () => {
    usuario = { ...usuario!, roles: [Rol.MEDICO] };
    expect(await ejecutar(Rol.PACIENTE)).toBe('/profesional');
  });

  it('alcanza con uno de los roles del usuario', async () => {
    usuario = { ...usuario!, roles: [Rol.PACIENTE, Rol.MEDICO] };
    expect(await ejecutar(Rol.MEDICO)).toBe(true);
  });
});
