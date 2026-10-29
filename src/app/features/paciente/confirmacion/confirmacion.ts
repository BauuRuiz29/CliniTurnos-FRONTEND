import { Component, Injector, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { fechaLarga } from '../../../shared/utils/fechas';

// Lo que mandan reservar-turno y el detalle del turno por navigation state. Sin datos clínicos.
interface TurnoResumen {
  profesional: string;
  especialidad: string | null;
  fecha: string; // yyyy-MM-dd
  horaInicio: string; // HH:mm
  estudio?: string; // solo en turnos de estudio: no tienen profesional [R20]
}

const PAGINAS_DE_TURNO = ['turno-confirmado', 'turno-reprogramado', 'turno-cancelado'];

type ConfirmationType = 'turno-confirmado' | 'turno-reprogramado' | 'turno-cancelado';

interface ConfirmationDetail {
  label: string;
  value: string;
  note?: string;
  badge?: boolean;
}

interface ConfirmationPage {
  icon: string;
  iconClass: string;
  title: string;
  description: string;
  cardTitle: string;
  details: ConfirmationDetail[];
  message: string;
  messageClass: string;
  actions: { label: string; route: string; variant: 'primary' | 'outline' }[];
}

@Component({
  selector: 'app-confirmacion',
  imports: [RouterLink],
  styleUrl: './confirmacion.css',
  templateUrl: './confirmacion.html',
})
export class Confirmacion {
  private readonly route = inject(ActivatedRoute);
  readonly type = toSignal(this.route.paramMap.pipe(map(params => params.get('type') ?? 'turno-confirmado')), {
    initialValue: 'turno-confirmado',
    injector: inject(Injector),
  });

  private readonly router = inject(Router);
  // Por navigation state (sobrevive al F5 vía history.state).
  private readonly turno: TurnoResumen | undefined = (this.router.currentNavigation()?.extras.state ?? history.state)?.['turno'];
  private readonly detallesTurno: ConfirmationDetail[] = this.turno
    ? [
        ...(this.turno.especialidad ? [{ label: 'Especialidad', value: this.turno.especialidad }] : []),
        this.turno.estudio ? { label: 'Estudio', value: this.turno.estudio } : { label: 'Profesional', value: this.turno.profesional },
        { label: 'Fecha', value: fechaLarga(this.turno.fecha) }, { label: 'Hora', value: `${this.turno.horaInicio} hs.` },
      ]
    : [];

  constructor() {
    // Sin turno no hay nada que confirmar (entrada directa por URL).
    if (!this.turno && PAGINAS_DE_TURNO.includes(this.type())) void this.router.navigate(['/paciente/turnos']);
  }

  private readonly pages: Record<ConfirmationType, ConfirmationPage> = {
    'turno-confirmado': {
      icon: '✓', iconClass: 'success', title: 'Turno confirmado', description: '¡Tu turno fue reservado con éxito!', cardTitle: 'Detalle del turno',
      details: this.detallesTurno,
      message: 'Te enviamos los detalles a tu correo electrónico.', messageClass: 'success',
      actions: [{ label: 'Ver mis turnos', route: '/paciente/turnos', variant: 'outline' }, { label: 'Ir al inicio', route: '/paciente/inicio', variant: 'primary' }],
    },
    'turno-reprogramado': {
      icon: '◷', iconClass: 'blue', title: 'Turno reprogramado', description: 'El turno fue reprogramado correctamente.', cardTitle: 'Nuevo detalle del turno',
      details: this.detallesTurno,
      message: 'Te enviamos los nuevos detalles a tu correo electrónico.', messageClass: 'info',
      actions: [{ label: 'Ver mis turnos', route: '/paciente/turnos', variant: 'outline' }, { label: 'Ir al inicio', route: '/paciente/inicio', variant: 'primary' }],
    },
    'turno-cancelado': {
      icon: '×', iconClass: 'warning', title: 'Turno cancelado', description: 'El turno fue cancelado correctamente.', cardTitle: 'Detalle del turno cancelado',
      details: this.detallesTurno,
      message: 'Podés reservar un nuevo turno cuando lo necesites.', messageClass: 'warning',
      actions: [{ label: 'Reservar nuevo turno', route: '/paciente/especialidades', variant: 'outline' }, { label: 'Ir al inicio', route: '/paciente/inicio', variant: 'primary' }],
    },
  };

  readonly page = computed(() => this.pages[this.type() as ConfirmationType] ?? this.pages['turno-confirmado']);
}