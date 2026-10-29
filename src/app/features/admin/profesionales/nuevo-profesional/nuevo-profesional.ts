import { Component, DestroyRef, inject, signal } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormArray, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import type { DiaSemana } from '../../../../core/models/disponibilidad';
import { Genero } from '../../../../core/models/enums';
import { GENEROS } from '../../../../shared/utils/formularios';
import { AdminRepository, mensajeDeError } from '../../data-access/admin';

// Días de atención: lunes a viernes (son los únicos que genera el back).
const DIAS: { valor: DiaSemana; texto: string }[] = [
  { valor: 'LUNES', texto: 'Lunes' },
  { valor: 'MARTES', texto: 'Martes' },
  { valor: 'MIERCOLES', texto: 'Miércoles' },
  { valor: 'JUEVES', texto: 'Jueves' },
  { valor: 'VIERNES', texto: 'Viernes' },
];

function desdeAntesDeHasta(grupo: AbstractControl): ValidationErrors | null {
  const { horaDesde, horaHasta } = grupo.value as { horaDesde: string; horaHasta: string };
  return horaDesde && horaHasta && horaDesde >= horaHasta ? { rango: true } : null;
}

function nuevoHorario() {
  return new FormGroup(
    {
      diaSemana: new FormControl<DiaSemana>('LUNES', { nonNullable: true }),
      horaDesde: new FormControl('08:00', { nonNullable: true, validators: Validators.required }),
      horaHasta: new FormControl('12:00', { nonNullable: true, validators: Validators.required }),
      duracionTurnosMin: new FormControl(30, { nonNullable: true, validators: [Validators.required, Validators.min(5)] }),
    },
    { validators: desdeAntesDeHasta },
  );
}

/**
 * Alta de profesional [R16]. Solo los campos que guarda el back (el boceto pide más: DNI, contacto, etc.).
 * El usuario y la contraseña son los que el profesional usa para ingresar.
 */
@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-nuevo-profesional',
  templateUrl: './nuevo-profesional.html',
})
export class NuevoProfesional {
  private readonly repo = inject(AdminRepository);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly recursoEspecialidades = rxResource({ stream: () => this.repo.especialidades(), defaultValue: [] });

  readonly generos = GENEROS;
  readonly dias = DIAS;
  readonly especialidades = this.recursoEspecialidades.value;
  readonly elegidas = signal<ReadonlySet<number>>(new Set());
  readonly guardando = signal(false);
  readonly error = signal('');

  readonly form = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(50)] }),
    apellido: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(50)] }),
    genero: new FormControl<Genero | null>(null, Validators.required),
    numeroMatricula: new FormControl('', { nonNullable: true, validators: Validators.maxLength(50) }),
    tipoMatricula: new FormControl<'NACIONAL' | 'PROVINCIAL'>('NACIONAL', { nonNullable: true }),
    login: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(50)] }),
    // El back además rechaza contraseñas comunes, solo numéricas o parecidas al usuario.
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
    // R22: con estos horarios se generan sus turnos disponibles.
    horarios: new FormArray([nuevoHorario()]),
  });

  get horarios() {
    return this.form.controls.horarios;
  }

  agregarHorario(): void {
    this.horarios.push(nuevoHorario());
  }

  alternarEspecialidad(id: number): void {
    this.elegidas.update((ids) => {
      const nuevo = new Set(ids);
      if (!nuevo.delete(id)) nuevo.add(id);
      return nuevo;
    });
  }

  guardar(): void {
    if (this.form.invalid || this.form.disabled || this.guardando()) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.guardando.set(true);
    this.error.set('');
    this.repo
      .altaProfesional({
        nombre: v.nombre.trim(),
        apellido: v.apellido.trim(),
        genero: v.genero!,
        login: v.login.trim(),
        password: v.password,
        especialidadIds: [...this.elegidas()],
        numeroMatricula: v.numeroMatricula.trim() || null,
        tipoMatricula: v.numeroMatricula.trim() ? v.tipoMatricula : null,
        horarios: v.horarios,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (disponibilidadOk) => {
          if (disponibilidadOk) {
            void this.router.navigate(['/administrador/profesionales']);
            return;
          }
          // El profesional ya existe: el formulario queda bloqueado para no repetir el alta.
          this.guardando.set(false);
          this.form.disable();
          this.error.set('El profesional se creó, pero no pudimos cargar su disponibilidad ni generar sus turnos.');
        },
        error: (e: unknown) => {
          this.guardando.set(false);
          this.error.set(mensajeDeError(e, 'No pudimos dar de alta al profesional. Intentá de nuevo.'));
        },
      });
  }
}
