import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { API_URL, ROL_SESION_SIMULADA, SESION_SIMULADA } from '../config/tokens';
import { Rol } from '../models/enums';
import { authInterceptor } from './auth.interceptor';
import { AuthService, rolPrincipal } from './auth.service';
const base64Url = (obj: object) => btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const crearToken = (payload: object) => `${base64Url({ alg: 'HS256' })}.${base64Url(payload)}.firma`;

const API = 'http://api.test/api';
const ME = { id: 3, nombre: 'Juan', apellido: 'García', login: 'jg', genero: 'MASCULINO', roles: ['MEDICO'] };
const vigente = () => crearToken({ exp: Math.floor(Date.now() / 1000) + 3600 });

describe('AuthService', () => {
  let http: HttpTestingController;

  // Node 26 expone un localStorage propio sin métodos: se usa uno en memoria.
  function storageEnMemoria(): Storage {
    const datos = new Map<string, string>();
    return {
      get length() { return datos.size; },
      clear: () => datos.clear(),
      getItem: (k) => datos.get(k) ?? null,
      key: (i) => [...datos.keys()][i] ?? null,
      removeItem: (k) => void datos.delete(k),
      setItem: (k, v) => void datos.set(k, String(v)),
    };
  }

  function configurar(simulada = false) {
    vi.stubGlobal('localStorage', storageEnMemoria());
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: API },
        { provide: SESION_SIMULADA, useValue: simulada },
        { provide: ROL_SESION_SIMULADA, useValue: Rol.PACIENTE },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    return TestBed.inject(AuthService);
  }

  afterEach(() => {
    http?.verify();
    vi.unstubAllGlobals();
  });

  it('login: guarda los tokens y toma los roles de /users/me/ [R02]', async () => {
    const auth = configurar();
    const usuario = firstValueFrom(auth.login('jg', 'clave'));
    const req = http.expectOne(`${API}/auth/login/`);
    expect(req.request.body).toEqual({ login: 'jg', password: 'clave' });
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({ access: 'A1', refresh: 'R1' });
    const me = http.expectOne(`${API}/users/me/`);
    expect(me.request.headers.get('Authorization')).toBe('Bearer A1');
    me.flush(ME);

    expect(await usuario).toEqual({ id: 3, nombre: 'Juan', apellido: 'García', genero: 'MASCULINO', roles: [Rol.MEDICO] });
    expect(auth.getRol()).toBe(Rol.MEDICO);
    expect(auth.getAccessToken()).toBe('A1');
  });

  it('tras un F5 recupera la sesión con el refresh vigente', async () => {
    const auth = configurar();
    localStorage.setItem('access_token', 'A1');
    localStorage.setItem('refresh_token', vigente());
    const sesion = firstValueFrom(auth.sesion());
    http.expectOne(`${API}/users/me/`).flush(ME);
    expect((await sesion)?.roles).toEqual([Rol.MEDICO]);
  });

  it('sin tokens no hay sesión ni pedidos al back', async () => {
    const auth = configurar();
    expect(await firstValueFrom(auth.sesion())).toBeNull();
  });

  it('con 401 renueva el access, guarda el refresh rotado y reintenta', async () => {
    const auth = configurar();
    localStorage.setItem('access_token', 'VIEJO');
    localStorage.setItem('refresh_token', 'R1');
    const respuesta = firstValueFrom(TestBed.inject(HttpClient).get(`${API}/turnos/turnos/`));

    http.expectOne(`${API}/turnos/turnos/`).flush({ detail: 'vencido' }, { status: 401, statusText: 'Unauthorized' });
    const refresh = http.expectOne(`${API}/auth/refresh/`);
    expect(refresh.request.body).toEqual({ refresh: 'R1' });
    refresh.flush({ access: 'NUEVO', refresh: 'R2' });
    const reintento = http.expectOne(`${API}/turnos/turnos/`);
    expect(reintento.request.headers.get('Authorization')).toBe('Bearer NUEVO');
    reintento.flush([]);

    expect(await respuesta).toEqual([]);
    expect(auth.getAccessToken()).toBe('NUEVO');
    expect(localStorage.getItem('refresh_token')).toBe('R2');
  });

  it('si el refresh falla cierra la sesión y va al login', async () => {
    const auth = configurar();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    localStorage.setItem('access_token', 'VIEJO');
    localStorage.setItem('refresh_token', 'R1');
    const respuesta = firstValueFrom(TestBed.inject(HttpClient).get(`${API}/turnos/turnos/`));

    http.expectOne(`${API}/turnos/turnos/`).flush(null, { status: 401, statusText: 'Unauthorized' });
    http.expectOne(`${API}/auth/refresh/`).flush(null, { status: 401, statusText: 'Unauthorized' });

    await expect(respuesta).rejects.toBeTruthy();
    expect(auth.getAccessToken()).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });

  it('sesión simulada: arranca logueada con el rol configurado y no llama al back', async () => {
    const auth = configurar(true);
    expect(auth.getRol()).toBe(Rol.PACIENTE);
    auth.logout();
    expect(auth.isLoggedIn()).toBe(false);
    expect((await firstValueFrom(auth.login('x', 'y'))).roles).toEqual([Rol.PACIENTE]);
  });

  it('con varios roles prioriza ADMIN, después MEDICO', () => {
    expect(rolPrincipal([Rol.PACIENTE, Rol.MEDICO])).toBe(Rol.MEDICO);
    expect(rolPrincipal([Rol.MEDICO, Rol.ADMIN])).toBe(Rol.ADMIN);
    expect(rolPrincipal([])).toBeNull();
  });
});
