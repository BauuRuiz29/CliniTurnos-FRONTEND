import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService, UsuarioSesion } from '../../../core/auth/auth.service';
import { Rol } from '../../../core/models/enums';
import { Login } from './login';

describe('Login', () => {
  const usuario = (roles: Rol[]): UsuarioSesion => ({ id: 1, nombre: 'Ana', apellido: 'Paz', genero: null, roles });

  function crear(login: AuthService['login']) {
    const auth = { login: vi.fn(login), logout: vi.fn() };
    TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const component = TestBed.createComponent(Login).componentInstance;
    component.login = 'ana';
    component.password = 'clave';
    return { component, auth, navigate };
  }

  it('redirige al área según el rol que devuelve el back [R02]', () => {
    const { component, navigate } = crear(() => of(usuario([Rol.MEDICO])));
    component.ingresar();
    expect(navigate).toHaveBeenCalledWith('/profesional');
  });

  it('sin rol asignado no entra: cierra la sesión y avisa', () => {
    const { component, auth, navigate } = crear(() => of(usuario([])));
    component.ingresar();
    expect(navigate).not.toHaveBeenCalled();
    expect(auth.logout).toHaveBeenCalled();
    expect(component.errorMessage()).toContain('no tiene un rol asignado');
  });

  it('con credenciales incorrectas muestra el error', () => {
    const { component } = crear(() => throwError(() => new HttpErrorResponse({ status: 401 })));
    component.ingresar();
    expect(component.errorMessage()).toBe('Usuario o contraseña incorrectos.');
  });
});
