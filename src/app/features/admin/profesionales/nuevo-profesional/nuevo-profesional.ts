import { Component, DestroyRef, inject, signal } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Genero } from '../../../../core/models/enums';
import { GENEROS } from '../../../../shared/utils/formularios';
import { AdminRepository, mensajeDeError } from '../../data-access/admin';

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
  });

  alternarEspecialidad(id: number): void {
    this.elegidas.update((ids) => {
      const nuevo = new Set(ids);
      if (!nuevo.delete(id)) nuevo.add(id);
      return nuevo;
    });
  }

  guardar(): void {
    if (this.form.invalid || this.guardando()) {
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
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => void this.router.navigate(['/administrador/profesionales']),
        error: (e: unknown) => {
          this.guardando.set(false);
          this.error.set(mensajeDeError(e, 'No pudimos dar de alta al profesional. Intentá de nuevo.'));
        },
      });
  }
}
