import { Component, Injector, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { LugarAtencion } from '../../../core/models/lugar-atencion';
import { fechaLarga } from '../../../shared/utils/fechas';

// Lo que mandan reservar-turno y el detalle del turno por navigation state. Sin datos clínicos.
interface TurnoResumen {
  profesional: string;
  especialidad: string;
  fecha: string; // yyyy-MM-dd
  horaInicio: string; // HH:mm
  lugar: LugarAtencion;
}

const PAGINAS_DE_TURNO = ['turno-confirmado', 'turno-reprogramado', 'turno-cancelado'];

type ConfirmationType = 'turno-confirmado' | 'turno-reprogramado' | 'turno-cancelado' | 'informe-disponible' | 'estudio-disponible' | 'correo-enviado';

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
  checks?: string[];
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
        { label: 'Especialidad', value: this.turno.especialidad }, { label: 'Profesional', value: this.turno.profesional },
        { label: 'Fecha', value: fechaLarga(this.turno.fecha) }, { label: 'Hora', value: `${this.turno.horaInicio} hs.` },
        { label: 'Lugar', value: this.turno.lugar.nombre, note: this.turno.lugar.direccion },
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
    'informe-disponible': {
      icon: '▤', iconClass: 'success', title: 'Informe disponible', description: 'Tu informe médico ya está disponible.', cardTitle: 'Detalle del informe',
      details: [
        { label: 'Especialidad', value: 'Traumatología' }, { label: 'Profesional', value: 'Dr. Pablo Sánchez' },
        { label: 'Fecha de consulta', value: '18 de mayo de 2026' }, { label: 'Tipo de informe', value: 'Informe médico' },
      ],
      message: 'Podés descargarlo desde la sección Informes médicos.', messageClass: 'success',
      actions: [{ label: 'Ir a informes médicos', route: '/paciente/informes', variant: 'outline' }, { label: 'Ir al inicio', route: '/paciente/inicio', variant: 'primary' }],
    },
    'estudio-disponible': {
      icon: '⚗', iconClass: 'purple', title: 'Estudio disponible', description: 'El resultado de tu estudio ya está disponible.', cardTitle: 'Detalle del estudio',
      details: [
        { label: 'Estudio', value: 'Hemograma completo' }, { label: 'Fecha', value: '20 de mayo de 2026' },
        { label: 'Laboratorio', value: 'Laboratorio Central' }, { label: 'Estado', value: 'Disponible', badge: true },
      ],
      message: 'Podés consultarlo desde la sección Informes médicos.', messageClass: 'purple',
      actions: [{ label: 'Ir a informes médicos', route: '/paciente/informes', variant: 'outline' }, { label: 'Ir al inicio', route: '/paciente/inicio', variant: 'primary' }],
    },
    'correo-enviado': {
      icon: '✉', iconClass: 'blue', title: 'Confirmación enviada', description: 'Te enviamos la información a tu correo electrónico.', cardTitle: '¿Qué incluye el correo?',
      details: [], checks: ['Detalle del turno', 'Preparación (si corresponde)', 'Indicaciones importantes', 'Datos del lugar de atención'],
      message: 'Correo enviado a: juan.perez@email.com', messageClass: 'blue',
      actions: [{ label: 'Ir al inicio', route: '/paciente/inicio', variant: 'primary' }],
    },
  };

  readonly page = computed(() => this.pages[this.type() as ConfirmationType] ?? this.pages['turno-confirmado']);
}