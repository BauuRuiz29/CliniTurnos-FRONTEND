import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminRepository, mensajeDeError } from '../../data-access/admin';

/** Alta (`/especialidades/nueva`) o edición (`/especialidades/:id`) de una especialidad [R21]. Sin ícono: el back no lo guarda. */
@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-especialidad-form',
  templateUrl: './especialidad-form.html',
})
export class EspecialidadForm {
  private readonly repo = inject(AdminRepository);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('especialidadId')) || null;
  readonly guardando = signal(false);
  readonly error = signal('');

  readonly form = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(100)] }),
    descripcion: new FormControl('', { nonNullable: true, validators: Validators.maxLength(225) }), // varchar(225) en la DB
  });

  constructor() {
    if (this.id === null) return;
    this.repo
      .especialidad(this.id)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (e) => this.form.setValue({ nombre: e.nombre, descripcion: e.descripcion }),
        error: () => void this.router.navigate(['/administrador/especialidades']),
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
      .guardarEspecialidad(this.id, { nombre: v.nombre.trim(), descripcion: v.descripcion.trim() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => void this.router.navigate(['/administrador/especialidades']),
        error: (e: unknown) => {
          this.guardando.set(false);
          this.error.set(mensajeDeError(e, 'No pudimos guardar la especialidad. Intentá de nuevo.'));
        },
      });
  }
}
