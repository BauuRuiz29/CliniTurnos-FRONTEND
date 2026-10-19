import { Component, ElementRef, effect, inject, signal, viewChild } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Genero, TipoDocumento } from '../../../core/models/enums';
import { GENEROS, PATRON_TELEFONO, hoyIso, noFutura } from '../../../shared/utils/formularios';
import { RegistroPaciente, RegistroRepository } from '../data-access/registro.repository';

type Campo = keyof Registro['form']['controls'];

// Tras registrarse, CU01 redirige al login "después de unos segundos".
const REDIRECCION_MS = 3000;

/** Alta de pacientes [R01, CU01]. Los profesionales los crea el administrador [R16]. */
@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrls: ['../login/login.scss', './registro.scss']
})
export class Registro {
  private readonly router = inject(Router);
  private readonly repo = inject(RegistroRepository);
  private readonly popup = viewChild<ElementRef<HTMLDialogElement>>('popup');

  readonly generos = GENEROS;
  readonly tiposDocumento = Object.values(TipoDocumento);
  readonly hoy = hoyIso();

  // Largos máximos tomados del DER (usuarios / pacientes). CU01: todos los campos son requeridos.
  readonly form = inject(NonNullableFormBuilder).group(
    {
      nombre: ['', [Validators.required, Validators.maxLength(50)]],
      apellido: ['', [Validators.required, Validators.maxLength(50)]],
      genero: ['' as Genero | '', Validators.required],
      tipoIdentificacion: [TipoDocumento.DNI as TipoDocumento, Validators.required],
      numIdentificacion: ['', [Validators.required, Validators.maxLength(20)]],
      fechaNacimiento: ['', [Validators.required, noFutura]],
      telefono: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(PATRON_TELEFONO)]],
      correo: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      login: ['', [Validators.required, Validators.maxLength(50)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmarPassword: ['', Validators.required],
      consentimiento: [false, Validators.requiredTrue], // Rnf 14
    },
    { validators: validarRegistro },
  );

  readonly enviando = signal(false);
  readonly registrado = signal(false);
  readonly errorMessage = signal('');

  constructor() {
    // CU01: popup de aviso y redirección al login. El timer se limpia si el usuario se va antes.
    effect((onCleanup) => {
      if (!this.registrado()) return;
      this.popup()?.nativeElement.showModal();
      const redireccion = setTimeout(() => this.irLogin(), REDIRECCION_MS);
      onCleanup(() => clearTimeout(redireccion));
    });

  }

  // El campo se muestra con error solo después de que el usuario lo tocó.  
  invalido(campo: Campo): boolean {
    const control = this.form.controls[campo];
    return control.invalid && control.touched;
  }

  errorDeGrupo(error: 'passwordsDistintas' | 'dniInvalido', campo: Campo): boolean {
    return this.form.hasError(error) && this.form.controls[campo].touched;
  }

  crearCuenta(): void {
    this.errorMessage.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched(); //pa que salten los errores
      return;
    }

    const { confirmarPassword, consentimiento, ...datos } = this.form.getRawValue();
    this.enviando.set(true);
    this.repo.registrar(datos as RegistroPaciente).subscribe({
      next: () => this.registrado.set(true),
      error: (err) => {
        this.enviando.set(false);
        this.errorMessage.set(err?.error?.detail || 'No pudimos crear tu cuenta. Intentá de nuevo.');
      },
    });
  }

  irLogin(): void {
    this.router.navigate(['/login']);
  }

  volverHome(): void {
    this.router.navigate(['/']);
  }
}

function validarRegistro(group: AbstractControl): ValidationErrors | null {
  const v = group.value;
  const errores: ValidationErrors = {};
  if (v.confirmarPassword && v.password !== v.confirmarPassword) errores['passwordsDistintas'] = true;
  if (v.tipoIdentificacion === TipoDocumento.DNI && v.numIdentificacion && !/^\d{7,8}$/.test(v.numIdentificacion)) {
    errores['dniInvalido'] = true;
  }
  return Object.keys(errores).length ? errores : null;
}
