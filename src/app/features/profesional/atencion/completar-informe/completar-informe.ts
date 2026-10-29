import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, forkJoin, switchMap } from 'rxjs';
import { EstadoTurno } from '../../../../core/models/enums';
import { guardarArchivo } from '../../../../shared/utils/archivos';
import { fechaLarga } from '../../../../shared/utils/fechas';
import { AgendaRepository, TurnoProfesional } from '../../agenda/data-access/agenda.repository';
import { nombrePaciente } from '../../agenda/turno-vista';
import { AdjuntoInforme, AtencionRepository, InformeConsulta, informeCompleto } from '../data-access/atencion.repository';

// Columnas varchar(1000) de `consultas`.
const MAX_CAMPO = 1000;
const DURACION_TOAST_MS = 2600;

/**
 * Informe médico del turno [R13]. Con la atención en curso se puede guardar el informe (cierra la consulta:
 * EN_CURSO → FINALIZADO) o cerrar el turno sin informe y cargarlo después. Queda de solo lectura
 * recién cuando tiene diagnóstico [R14].
 */
@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-completar-informe',
  styleUrl: './completar-informe.css',
  templateUrl: './completar-informe.html',
})
export class CompletarInforme {
  private readonly agenda = inject(AgendaRepository);
  private readonly atencion = inject(AtencionRepository);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly turnoId = Number(inject(ActivatedRoute).snapshot.paramMap.get('turnoId'));

  readonly turno = signal<TurnoProfesional | null>(null);
  readonly informe = signal<InformeConsulta | null>(null);
  readonly guardando = signal(false);
  readonly subiendo = signal(false);
  readonly error = signal('');
  readonly mensaje = signal('');
  // TODO: los estudios solicitados todavía no se guardan (pendiente definir el flujo de Estudio).
  readonly estudios = signal<string[]>([]);
  readonly nuevoEstudio = new FormControl('', { nonNullable: true });

  readonly form = new FormGroup({
    diagnostico: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(MAX_CAMPO)] }),
    planTratamiento: new FormControl('', { nonNullable: true, validators: Validators.maxLength(MAX_CAMPO) }),
    indicaciones: new FormControl('', { nonNullable: true, validators: Validators.maxLength(MAX_CAMPO) }),
  });

  readonly soloLectura = computed(() => {
    const i = this.informe();
    return !!i && i.finalizada && informeCompleto(i);
  });
  /** Turno cerrado con el informe sin cargar. */
  readonly pendiente = computed(() => {
    const i = this.informe();
    return !!i && i.finalizada && !informeCompleto(i);
  });
  readonly descargando = signal<number | null>(null);
  readonly nombre = computed(() => (this.turno() ? nombrePaciente(this.turno()!.paciente) : ''));
  readonly fecha = computed(() => (this.turno() ? fechaLarga(this.turno()!.fecha) : ''));

  private timeoutToast?: ReturnType<typeof setTimeout>;

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.timeoutToast));
    forkJoin([this.agenda.obtener(this.turnoId), this.atencion.obtener(this.turnoId)])
      .pipe(takeUntilDestroyed())
      .subscribe(([turno, informe]) => {
        // Sin atención iniciada no hay informe: se vuelve al detalle para comenzar la consulta.
        const valido = turno && informe && (turno.estado === EstadoTurno.EN_CURSO || turno.estado === EstadoTurno.FINALIZADO);
        if (!valido) {
          void this.router.navigate(turno ? ['/profesional/turnos', turno.id] : ['/profesional/agenda']);
          return;
        }
        this.turno.set(turno);
        this.mostrar(informe);
      });
  }

  invalido(campo: 'diagnostico' | 'planTratamiento' | 'indicaciones'): boolean {
    const control = this.form.controls[campo];
    return control.invalid && (control.touched || control.dirty);
  }

  agregarEstudio(): void {
    const estudio = this.nuevoEstudio.value.trim();
    if (!estudio) return;
    this.estudios.update((lista) => (lista.includes(estudio) ? lista : [...lista, estudio]));
    this.nuevoEstudio.reset();
  }

  descargar(adjunto: AdjuntoInforme): void {
    this.descargando.set(adjunto.id);
    this.atencion
      .descargar(adjunto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (archivo) => {
          this.descargando.set(null);
          guardarArchivo(archivo, adjunto.titulo);
        },
        error: () => {
          this.descargando.set(null);
          this.error.set('No pudimos descargar el archivo.');
        },
      });
  }

  quitarEstudio(estudio: string): void {
    this.estudios.update((lista) => lista.filter((e) => e !== estudio));
  }

  adjuntar(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    const informe = this.informe();
    if (!archivo || !informe || this.soloLectura()) return;
    this.subiendo.set(true);
    this.atencion
      .adjuntar(informe.id, archivo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (adjunto) => {
          this.subiendo.set(false);
          input.value = '';
          this.informe.update((i) => i && { ...i, adjuntos: [...i.adjuntos, adjunto] });
        },
        error: () => {
          this.subiendo.set(false);
          this.error.set('No pudimos adjuntar el archivo.');
        },
      });
  }

  quitarAdjunto(adjuntoId: number): void {
    const informe = this.informe();
    if (!informe || this.soloLectura()) return;
    this.atencion
      .quitarAdjunto(informe.id, adjuntoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.informe.update((i) => i && { ...i, adjuntos: i.adjuntos.filter((a) => a.id !== adjuntoId) }));
  }

  guardar(evento: SubmitEvent): void {
    evento.preventDefault();
    const informe = this.informe();
    if (!informe || this.soloLectura() || this.guardando()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // Con la consulta abierta, guardar el informe también la cierra; si ya estaba cerrada, solo se completa.
    const guardado = this.atencion.guardar(informe.id, this.datos());
    this.procesar(informe.finalizada ? guardado : guardado.pipe(switchMap(() => this.atencion.cerrar(informe.id))), 'Informe guardado. La consulta quedó finalizada.');
  }

  /** Cierra el turno sin diagnóstico: el informe queda pendiente y se completa después. */
  cerrarSinInforme(): void {
    const informe = this.informe();
    if (!informe || informe.finalizada || this.guardando()) return;
    if (this.form.invalid && !this.soloFaltaDiagnostico()) {
      this.form.markAllAsTouched();
      return;
    }
    // Lo que ya se haya escrito se guarda igual.
    const cerrado = this.atencion.guardar(informe.id, this.datos()).pipe(switchMap(() => this.atencion.cerrar(informe.id)));
    this.procesar(cerrado, 'Turno cerrado. El informe quedó pendiente para cargarlo después.');
  }

  private procesar(pedido: Observable<InformeConsulta>, aviso: string): void {
    this.guardando.set(true);
    this.error.set('');
    pedido.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (resultado) => {
        this.guardando.set(false);
        this.turno.update((t) => t && { ...t, estado: EstadoTurno.FINALIZADO, informePendiente: !informeCompleto(resultado) });
        this.mostrar(resultado);
        this.avisar(aviso);
      },
      error: () => {
        this.guardando.set(false);
        this.error.set('No pudimos guardar el informe. Intentá de nuevo.');
      },
    });
  }

  private datos() {
    const { diagnostico, planTratamiento, indicaciones } = this.form.getRawValue();
    return { diagnostico: diagnostico.trim(), planTratamiento: planTratamiento.trim(), indicaciones: indicaciones.trim() };
  }

  // Cerrar sin informe no exige diagnóstico, pero sí respeta los largos máximos.
  private soloFaltaDiagnostico(): boolean {
    const { diagnostico, planTratamiento, indicaciones } = this.form.controls;
    return !diagnostico.hasError('maxlength') && planTratamiento.valid && indicaciones.valid;
  }

  private mostrar(informe: InformeConsulta): void {
    this.informe.set(informe);
    this.form.setValue({
      diagnostico: informe.diagnostico ?? '',
      planTratamiento: informe.planTratamiento ?? '',
      indicaciones: informe.indicaciones ?? '',
    });
    if (informe.finalizada && informeCompleto(informe)) this.form.disable();
  }

  private avisar(texto: string): void {
    clearTimeout(this.timeoutToast);
    this.mensaje.set(texto);
    this.timeoutToast = setTimeout(() => this.mensaje.set(''), DURACION_TOAST_MS);
  }
}
