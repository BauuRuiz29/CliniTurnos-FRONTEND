import { Component, inject, signal } from '@angular/core';
import { FormArray, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Genero, TipoDocumento } from '../../../core/models/enums';
import { GENEROS, PATRON_TELEFONO, hoyIso, noFutura } from '../../../shared/utils/formularios';
import {
  Alergia,
  DatosPaciente,
  DatosPacienteEditables,
  Medicacion,
  MisDatosRepository,
  SEVERIDADES,
  Severidad,
} from './data-access/mis-datos.repository';

type Campo = keyof MisDatos['form']['controls'];

const GRUPOS_SANGUINEOS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Identifican la cuenta y la historia clínica: se muestran pero no se editan.
const CAMPOS_FIJOS = ['login', 'tipoIdentificacion', 'numIdentificacion'] as const;

/** Consulta y edición de los datos del paciente [R03, CU03]. */
@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-mis-datos',
  styleUrl: './mis-datos.css',
  templateUrl: './mis-datos.html',
})
export class MisDatos {
  private readonly repo = inject(MisDatosRepository);
  private readonly fb = inject(NonNullableFormBuilder);
  private original?: DatosPaciente;

  readonly generos = GENEROS;
  readonly gruposSanguineos = GRUPOS_SANGUINEOS;
  readonly severidades = SEVERIDADES;
  readonly hoy = hoyIso();

  // Mismas reglas que el registro; largos máximos del DER (usuarios / pacientes).
  readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(50)]],
    apellido: ['', [Validators.required, Validators.maxLength(50)]],
    genero: ['' as Genero | '', Validators.required],
    tipoIdentificacion: [TipoDocumento.DNI as TipoDocumento],
    numIdentificacion: [''],
    fechaNacimiento: ['', [Validators.required, noFutura]],
    telefono: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(PATRON_TELEFONO)]],
    correo: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    login: [''],
    grupoSanguineo: [''],
    contactoEmergenciaNombre: ['', Validators.maxLength(50)],
    contactoEmergenciaNumero: ['', [Validators.maxLength(50), Validators.pattern(PATRON_TELEFONO)]],
    alergias: this.fb.array<ReturnType<MisDatos['filaAlergia']>>([]),
    medicaciones: this.fb.array<ReturnType<MisDatos['filaMedicacion']>>([]),
  });

  readonly cargando = signal(true);
  readonly editando = signal(false);
  readonly guardando = signal(false);
  readonly guardado = signal(false);
  readonly errorMessage = signal('');

  constructor() {
    this.form.disable();
    this.repo.obtener().subscribe({
      next: (datos) => {
        this.original = datos;
        this.restaurar();
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.errorMessage.set('No pudimos cargar tus datos. Intentá de nuevo más tarde.');
      },
    });
  }

  invalido(campo: Campo): boolean {
    const control = this.form.controls[campo];
    return control.invalid && control.touched;
  }

  // CU03: "Editar datos" habilita el formulario.
  editar(): void {
    this.guardado.set(false);
    this.errorMessage.set('');
    this.form.enable();
    CAMPOS_FIJOS.forEach((campo) => this.form.controls[campo].disable());
    this.editando.set(true);
  }

  agregarAlergia(): void {
    this.form.controls.alergias.push(this.filaAlergia());
  }

  agregarMedicacion(): void {
    this.form.controls.medicaciones.push(this.filaMedicacion());
  }

  quitar(lista: FormArray, i: number): void {
    lista.removeAt(i);
  }

  cancelar(): void {
    this.errorMessage.set('');
    this.restaurar();
  }

  guardar(): void {
    this.errorMessage.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // form.value excluye los campos deshabilitados (los fijos). Los opcionales vacíos van como null, igual que en la base.
    const v = this.form.value;
    const cambios = {
      ...v,
      grupoSanguineo: v.grupoSanguineo || null,
      contactoEmergenciaNombre: v.contactoEmergenciaNombre?.trim() || null,
      contactoEmergenciaNumero: v.contactoEmergenciaNumero?.trim() || null,
      alergias: v.alergias!.map((a) => ({ id: a.id ?? undefined, descripcion: a.descripcion!.trim(), severidad: a.severidad || null })),
      medicaciones: v.medicaciones!.map((m) => ({
        id: m.id ?? undefined,
        medicamento: m.medicamento!.trim(),
        dosis: m.dosis?.trim() || null,
        frecuencia: m.frecuencia?.trim() || null,
      })),
    } as DatosPacienteEditables;

    this.guardando.set(true);
    this.repo.guardar(cambios).subscribe({
      next: (datos) => {
        this.original = datos;
        this.guardando.set(false);
        this.restaurar();
        this.guardado.set(true);
      },
      error: (err) => {
        this.guardando.set(false);
        this.errorMessage.set(err?.error?.detail || 'No pudimos guardar los cambios. Intentá de nuevo.');
      },
    });
  }

  private restaurar(): void {
    const o = this.original!;
    // reset no cambia el largo de los FormArray: se rearman con las filas originales.
    const { alergias, medicaciones } = this.form.controls;
    alergias.clear();
    o.alergias.forEach((a) => alergias.push(this.filaAlergia(a)));
    medicaciones.clear();
    o.medicaciones.forEach((m) => medicaciones.push(this.filaMedicacion(m)));
    this.form.reset({
      ...o,
      grupoSanguineo: o.grupoSanguineo ?? '',
      contactoEmergenciaNombre: o.contactoEmergenciaNombre ?? '',
      contactoEmergenciaNumero: o.contactoEmergenciaNumero ?? '',
      alergias: o.alergias.map((a) => ({ ...a, severidad: a.severidad ?? '' })),
      medicaciones: o.medicaciones.map((m) => ({ ...m, dosis: m.dosis ?? '', frecuencia: m.frecuencia ?? '' })),
    });
    this.form.disable();
    this.editando.set(false);
  }

  // Largos máximos del DER (alergias / medicaciones_habituales).
  private filaAlergia(a?: Alergia) {
    return this.fb.group({
      id: [a?.id],
      descripcion: [a?.descripcion ?? '', [Validators.required, Validators.maxLength(100)]],
      severidad: [(a?.severidad ?? '') as Severidad | ''],
    });
  }

  private filaMedicacion(m?: Medicacion) {
    return this.fb.group({
      id: [m?.id],
      medicamento: [m?.medicamento ?? '', [Validators.required, Validators.maxLength(100)]],
      dosis: [m?.dosis ?? '', Validators.maxLength(50)],
      frecuencia: [m?.frecuencia ?? '', Validators.maxLength(50)],
    });
  }
}
