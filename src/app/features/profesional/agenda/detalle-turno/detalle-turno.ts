import { Component, DestroyRef, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { VENTANA_CANCELACION_HORAS } from '../../../../core/config/tokens';
import { EstadoTurno } from '../../../../core/models/enums';
import { dentroDeVentanaCancelacion, puedeTransicionar } from '../../../../core/models/turno-estado';
import { edad, fechaLarga } from '../../../../shared/utils/fechas';
import { AgendaRepository, TurnoProfesional } from '../data-access/agenda.repository';
import { claseEstado, inicialesPaciente, nombrePaciente, textoEstado } from '../turno-vista';

const MENSAJE_ESTADO: Record<EstadoTurno, string> = {
  DISPONIBLE: '',
  BLOQUEADO: '',
  RESERVADO: 'El turno está reservado.',
  EN_CURSO: 'La atención está en curso: falta completar el informe.',
  FINALIZADO: 'La atención finalizó.',
  CANCELADO: 'Este turno fue cancelado.',
  AUSENTE: 'El paciente no se presentó.',
};

/** Detalle del turno: iniciar la atención, reprogramar o cancelar [R11, R12, R13]. */
@Component({
  imports: [RouterLink],
  selector: 'app-profesional-detalle-turno',
  styleUrl: './detalle-turno.css',
  templateUrl: './detalle-turno.html',
})
export class DetalleTurno {
  private readonly repo = inject(AgendaRepository);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogo = viewChild<ElementRef<HTMLDialogElement>>('confirmarCancelacion');
  private readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('turnoId'));

  readonly ventanaHoras = inject(VENTANA_CANCELACION_HORAS);
  readonly turno = signal<TurnoProfesional | null>(null);
  readonly ficha = rxResource({
    params: () => this.turno()?.paciente.id,
    stream: ({ params }) => (params === undefined ? of(null) : this.repo.ficha(params)),
  });
  readonly procesando = signal(false);
  readonly error = signal('');

  readonly reservado = computed(() => this.turno()?.estado === EstadoTurno.RESERVADO);
  readonly enCurso = computed(() => this.turno()?.estado === EstadoTurno.EN_CURSO);
  readonly finalizado = computed(() => this.turno()?.estado === EstadoTurno.FINALIZADO);
  // Cancelar y reprogramar comparten regla: reprogramar es cancelar + reservar otro [AGENTS §4.2, R12].
  readonly modificable = computed(() => {
    const t = this.turno();
    return !!t && puedeTransicionar(t.estado, EstadoTurno.CANCELADO) && dentroDeVentanaCancelacion(t.fecha, t.horaInicio, new Date(), this.ventanaHoras);
  });
  readonly mensaje = computed(() => MENSAJE_ESTADO[this.turno()?.estado ?? EstadoTurno.RESERVADO]);
  readonly fecha = computed(() => (this.turno() ? fechaLarga(this.turno()!.fecha) : ''));
  readonly edad = computed(() => (this.turno() ? edad(this.turno()!.paciente.fechaNacimiento) : 0));
  readonly nombre = computed(() => (this.turno() ? nombrePaciente(this.turno()!.paciente) : ''));
  readonly iniciales = computed(() => (this.turno() ? inicialesPaciente(this.turno()!.paciente) : ''));
  readonly estadoTexto = computed(() => (this.turno() ? textoEstado(this.turno()!.estado) : ''));
  readonly estadoClase = computed(() => (this.turno() ? claseEstado(this.turno()!.estado) : ''));

  constructor() {
    this.repo
      .obtener(this.id)
      .pipe(takeUntilDestroyed())
      .subscribe((turno) => {
        if (!turno) void this.router.navigate(['/profesional/agenda']);
        else this.turno.set(turno);
      });
  }

  /** RESERVADO → EN_CURSO y pasa a cargar el informe [R13]. */
  comenzarConsulta(): void {
    const t = this.turno();
    if (!t || !this.reservado() || this.procesando()) return;
    this.procesando.set(true);
    this.error.set('');
    this.repo
      .iniciar(t.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => void this.router.navigate(['/profesional/turnos', t.id, 'informe']),
        error: () => {
          this.procesando.set(false);
          this.error.set('No pudimos iniciar la consulta. Intentá de nuevo.');
        },
      });
  }

  pedirCancelacion(): void {
    this.error.set('');
    this.dialogo()?.nativeElement.showModal();
  }

  cerrarDialogo(): void {
    this.dialogo()?.nativeElement.close();
  }

  cancelar(): void {
    const t = this.turno();
    if (!t || !this.modificable() || this.procesando()) return;
    this.procesando.set(true);
    this.repo
      .cancelar(t.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        // El back puede liberar la franja: la confirmación recibe el turno ya cancelado por navigation state.
        next: (cancelado) => {
          this.cerrarDialogo();
          void this.router.navigate(['/profesional/turnos', t.id, 'cancelado'], { state: { turno: cancelado } });
        },
        error: () => {
          this.procesando.set(false);
          this.cerrarDialogo();
          this.error.set('No pudimos cancelar el turno. Intentá de nuevo.');
        },
      });
  }
}
