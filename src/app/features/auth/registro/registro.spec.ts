import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Registro } from './registro';

const DATOS_VALIDOS = {
  nombre: 'Juan',
  apellido: 'Pérez',
  genero: 'MASCULINO' as const,
  tipoIdentificacion: 'DNI' as const,
  numIdentificacion: '30123456',
  fechaNacimiento: '1990-05-10',
  telefono: '+54 11 1234 5678',
  correo: 'juan@email.com',
  login: 'juanperez',
  password: 'secreta123',
  confirmarPassword: 'secreta123',
  consentimiento: true,
};

describe('Registro', () => {
  let component: Registro;
  let fixture: ComponentFixture<Registro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Registro],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Registro);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('es válido con todos los datos completos', () => {
    component.form.setValue(DATOS_VALIDOS);
    expect(component.form.valid).toBe(true);
  });

  it('exige consentimiento explícito [Rnf 14]', () => {
    component.form.setValue({ ...DATOS_VALIDOS, consentimiento: false });
    expect(component.form.valid).toBe(false);
  });

  it('rechaza contraseñas distintas', () => {
    component.form.setValue({ ...DATOS_VALIDOS, confirmarPassword: 'otra12345' });
    expect(component.form.hasError('passwordsDistintas')).toBe(true);
  });

  it('valida el formato de DNI pero no el de pasaporte', () => {
    component.form.setValue({ ...DATOS_VALIDOS, numIdentificacion: 'AB12345' });
    expect(component.form.hasError('dniInvalido')).toBe(true);

    component.form.patchValue({ tipoIdentificacion: 'PASAPORTE' });
    expect(component.form.hasError('dniInvalido')).toBe(false);
  });

  it('rechaza fechas de nacimiento futuras', () => {
    component.form.setValue({ ...DATOS_VALIDOS, fechaNacimiento: '2999-01-01' });
    expect(component.form.controls.fechaNacimiento.hasError('fechaFutura')).toBe(true);
  });
});
