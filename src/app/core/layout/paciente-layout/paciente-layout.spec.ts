import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { Rol } from '../../models/enums';
import { PacienteLayout } from './paciente-layout';

describe('PacienteLayout', () => {
  it('saluda con el usuario de la sesión', async () => {
    const usuario = signal({ id: 1, nombre: 'Ana', apellido: 'López', genero: null, roles: [Rol.PACIENTE] });
    TestBed.configureTestingModule({
      imports: [PacienteLayout],
      providers: [provideRouter([]), { provide: AuthService, useValue: { usuario, logout: vi.fn() } }],
    });
    const fixture = TestBed.createComponent(PacienteLayout);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('h1')?.textContent).toContain('Hola, Ana');
    expect(el.querySelector('.patient-avatar')?.textContent?.trim()).toBe('AL');
    expect(el.querySelector('.patient-user strong')?.textContent?.trim()).toBe('Ana López');
  });
});
