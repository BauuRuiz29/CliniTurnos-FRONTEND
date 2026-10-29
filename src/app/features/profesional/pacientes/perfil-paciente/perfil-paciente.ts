import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Alergia, Medicacion, SEVERIDADES } from '../../../../core/models/historia-clinica';
import { edad, fechaCorta } from '../../../../shared/utils/fechas';
import { AlergiaEditable, MedicacionEditable, PacientesRepository, HistoriaPaciente } from '../data-access/pacientes.repository';

/**
 * Perfil del paciente visto por el profesional [R14]. Los datos personales son de solo lectura:
 * el médico solo carga alergias y medicación habitual de la historia clínica [R03].
 */
@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-perfil-paciente',
  styleUrl: './perfil-paciente.css',
  templateUrl: './perfil-paciente.html',
})
export class PerfilPaciente {
  private readonly repo = inject(PacientesRepository);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly pacienteId = Number(inject(ActivatedRoute).snapshot.paramMap.get('pacienteId'));

  readonly severidades = SEVERIDADES;
  readonly edad = edad;
  readonly fechaCorta = fechaCorta;
  readonly perfil = signal<HistoriaPaciente | null>(null);
  // Largos máximos del DER (alergias / medicaciones_habituales).
  readonly form = this.fb.group({
    alergias: this.fb.array<ReturnType<PerfilPaciente['alergia']>>([]),
    medicaciones: this.fb.array<ReturnType<PerfilPaciente['medicacion']>>([]),
  });

  readonly cargando = signal(true);
  readonly editando = signal(false);
  readonly guardando = signal(false);
  readonly guardado = signal(false);
  readonly errorMessage = signal('');

  constructor() {
    this.repo.perfil(this.pacienteId).subscribe({
      next: (perfil) => {
        this.perfil.set(perfil);
        this.restaurar();
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.errorMessage.set('No pudimos cargar los datos del paciente. Intentá de nuevo más tarde.');
      },
    });
  }

  get alergias() {
    return this.form.controls.alergias;
  }

  get medicaciones() {
    return this.form.controls.medicaciones;
  }

  editar(): void {
    this.guardado.set(false);
    this.errorMessage.set('');
    this.form.enable();
    this.editando.set(true);
  }

  cancelar(): void {
    this.errorMessage.set('');
    this.restaurar();
  }

  agregarAlergia(): void {
    this.alergias.push(this.alergia());
  }

  agregarMedicacion(): void {
    this.medicaciones.push(this.medicacion());
  }

  guardar(): void {
    this.errorMessage.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const texto = (v: string) => v.trim() || null;
    const alergias: AlergiaEditable[] = this.alergias.getRawValue().map((a) => ({
      id: a.id,
      descripcion: a.descripcion.trim(),
      severidad: a.severidad || null,
    }));
    const medicaciones: MedicacionEditable[] = this.medicaciones.getRawValue().map((m) => ({
      id: m.id,
      medicamento: m.medicamento.trim(),
      dosis: texto(m.dosis),
      frecuencia: texto(m.frecuencia),
    }));

    this.guardando.set(true);
    this.repo.guardarHistoria(this.perfil()!, alergias, medicaciones).subscribe({
      next: (perfil) => {
        this.perfil.set(perfil);
        this.guardando.set(false);
        this.restaurar();
        this.guardado.set(true);
      },
      error: () => {
        this.guardando.set(false);
        this.errorMessage.set('No pudimos guardar los cambios. Intentá de nuevo.');
      },
    });
  }

  private alergia(a?: Alergia) {
    return this.fb.group({
      id: [a?.id ?? (null as number | null)],
      descripcion: [a?.descripcion ?? '', [Validators.required, Validators.maxLength(100)]],
      severidad: [a?.severidad ?? ''],
    });
  }

  private medicacion(m?: Medicacion) {
    return this.fb.group({
      id: [m?.id ?? (null as number | null)],
      medicamento: [m?.medicamento ?? '', [Validators.required, Validators.maxLength(100)]],
      dosis: [m?.dosis ?? '', Validators.maxLength(50)],
      frecuencia: [m?.frecuencia ?? '', Validators.maxLength(50)],
    });
  }

  private restaurar(): void {
    const p = this.perfil()!;
    this.alergias.clear();
    p.alergias.forEach((a) => this.alergias.push(this.alergia(a)));
    this.medicaciones.clear();
    p.medicaciones.forEach((m) => this.medicaciones.push(this.medicacion(m)));
    this.form.disable();
    this.editando.set(false);
  }
}
