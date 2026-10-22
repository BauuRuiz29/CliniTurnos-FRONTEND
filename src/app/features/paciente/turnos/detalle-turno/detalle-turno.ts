import { Component, DestroyRef, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { VENTANA_CANCELACION_HORAS } from '../../../../core/config/tokens';
import { EstadoTurno } from '../../../../core/models/enums';
import { dentroDeVentanaCancelacion, puedeTransicionar } from '../../../../core/models/turno-estado';
import { fechaLarga } from '../../../../shared/utils/fechas';
import { ESTADO_TURNO_TEXTO, TurnoPaciente, TurnosRepository } from '../data-access/turnos.repository';

const MENSAJE_ESTADO: Record<EstadoTurno, string> = {
  DISPONIBLE: '',
  BLOQUEADO: '',
  RESERVADO: 'Tu turno está reservado. Te esperamos.',
  EN_CURSO: 'Tu atención está en curso.',
  FINALIZADO: 'La atención finalizó. Si el profesional cargó el informe, ya podés verlo.',
  CANCELADO: 'Este turno fue cancelado.',
  AUSENTE: 'No te presentaste a este turno.',
};

/** Detalle de un turno del paciente, con cancelar y reprogramar [R07, R08, R10]. */
@Component({
  imports: [RouterLink],
  selector: 'app-detalle-turno',
  styleUrls: ['../../detalle.css', './detalle-turno.css'],
  templateUrl: './detalle-turno.html',
})
export class DetalleTurno {
  private readonly repo = inject(TurnosRepository);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogo = viewChild<ElementRef<HTMLDialogElement>>('confirmarCancelacion');

  readonly ventanaHoras = inject(VENTANA_CANCELACION_HORAS);
  readonly turno = signal<TurnoPaciente | null>(null);
  readonly cancelando = signal(false);
  readonly error = signal('');

  readonly estadoTexto = computed(() => ESTADO_TURNO_TEXTO[this.turno()?.estado ?? EstadoTurno.RESERVADO]);
  readonly mensaje = computed(() => MENSAJE_ESTADO[this.turno()?.estado ?? EstadoTurno.RESERVADO]);
  readonly fecha = computed(() => (this.turno() ? fechaLarga(this.turno()!.fecha) : ''));
  readonly reservado = computed(() => this.turno()?.estado === EstadoTurno.RESERVADO);
  readonly finalizado = computed(() => this.turno()?.estado === EstadoTurno.FINALIZADO);
  // Cancelar y reprogramar comparten regla: reprogramar es cancelar + reservar otro [AGENTS §4.2].
  readonly modificable = computed(() => {
    const t = this.turno();
    return !!t && puedeTransicionar(t.estado, EstadoTurno.CANCELADO) && dentroDeVentanaCancelacion(t.fecha, t.horaInicio, new Date(), this.ventanaHoras);
  });

  constructor() {
    inject(ActivatedRoute).paramMap.pipe(takeUntilDestroyed()).subscribe((params) => this.cargar(Number(params.get('turnoId'))));
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
    if (!t || !this.modificable() || this.cancelando()) return;

    this.cancelando.set(true);
    this.repo
      .cancelar(t.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cancelado) => {
          this.cerrarDialogo();
          void this.router.navigate(['/paciente/confirmacion/turno-cancelado'], { state: { turno: resumen(cancelado) } });
        },
        error: () => {
          this.cancelando.set(false);
          this.cerrarDialogo();
          this.error.set('No pudimos cancelar el turno. Intentá de nuevo.');
        },
      });
  }

  reprogramar(): void {
    const t = this.turno();
    if (!t || !this.modificable()) return;
    void this.router.navigate(['/paciente/reservar-turno', t.profesional.id], { queryParams: { reprograma: t.id } });
  }

  private cargar(id: number): void {
    this.repo
      .obtener(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((turno) => {
        if (!turno) {
          void this.router.navigate(['/paciente/turnos']);
          return;
        }
        this.turno.set(turno);
      });
  }
}

// Forma que espera la pantalla de confirmación.
function resumen(t: TurnoPaciente) {
  return { profesional: t.profesional.nombre, especialidad: t.especialidad, fecha: t.fecha, horaInicio: t.horaInicio, lugar: t.lugar };
}
