import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Genero, TipoDocumento } from '../../../core/models/enums';
import { GENEROS, PATRON_TELEFONO, hoyIso, noFutura } from '../../../shared/utils/formularios';
import { DatosPaciente, DatosPacienteEditables, MisDatosRepository, textoSeveridad } from './data-access/mis-datos.repository';
import { ObrasSocialesRepository } from './data-access/obras-sociales.repository';

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
  private readonly original = signal<DatosPaciente | null>(null);

  readonly generos = GENEROS;
  readonly gruposSanguineos = GRUPOS_SANGUINEOS;
  readonly textoSeveridad = textoSeveridad;
  // De la historia clínica: el paciente las ve pero no las edita (las cargan médicos o admin).
  readonly alergias = computed(() => this.original()?.alergias ?? []);
  readonly medicaciones = computed(() => this.original()?.medicaciones ?? []);
  readonly hoy = hoyIso();
  readonly obrasSociales = toSignal(inject(ObrasSocialesRepository).listar(), { initialValue: [] });

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
    obraSocialId: [null as number | null],
    grupoSanguineo: [''],
    contactoEmergenciaNombre: ['', Validators.maxLength(50)],
    contactoEmergenciaNumero: ['', [Validators.maxLength(50), Validators.pattern(PATRON_TELEFONO)]],
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
        this.original.set(datos);
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
    } as DatosPacienteEditables;

    this.guardando.set(true);
    this.repo.guardar(cambios).subscribe({
      next: (datos) => {
        this.original.set(datos);
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
    const o = this.original()!;
    this.form.reset({
      ...o,
      grupoSanguineo: o.grupoSanguineo ?? '',
      contactoEmergenciaNombre: o.contactoEmergenciaNombre ?? '',
      contactoEmergenciaNumero: o.contactoEmergenciaNumero ?? '',
    });
    this.form.disable();
    this.editando.set(false);
  }
}
