import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-paciente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './paciente.html',
  styleUrl: './paciente.scss'
})
export class PacienteComponent {

  pantallaActual: string = 'inicio';
  pasoReserva: number = 1;
  profesionalSeleccionado: string = 'Dr. Juan García';
  especialidadSeleccionada: string = 'Cardiología';
  fechaSeleccionada: string = 'Viernes 24 de mayo de 2024';
  horaSeleccionada: string = '10:30 hs.';
  turnoSeleccionado = {
  fecha: 'Martes, 17 de septiembre de 2026',
  hora: '10:30 hs',
  profesional: 'Dr. Juan Manuel García',
  especialidad: 'Cardiología',
  consultorio: 'Consultorio 4 - Piso 1',
  lugar: 'Clínica Centro',
  direccion: 'Av. Siempre Viva 123, CABA',
  motivo: 'Control cardiológico',
  observaciones: 'Traer estudios anteriores y medicación que esté tomando actualmente.'
};

  constructor(private router: Router) {}

  cambiarPantalla(pantalla: string): void {

    this.pantallaActual = pantalla;

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

  }

  reservarTurno(): void {

    this.pantallaActual = 'reservar';

    this.pasoReserva = 1;

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

  }

  verLaboratorio(): void {

  this.pantallaActual = 'laboratorio';

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });

  }


  volverEspecialidades(): void {

    this.pantallaActual = 'especialidades';

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

  }

  seleccionarProfesional(nombre: string): void {

    this.profesionalSeleccionado = nombre;

  }

  siguientePaso(): void {

    if (this.pasoReserva < 3) {

      this.pasoReserva++;

    }

  }

  pasoAnterior(): void {

    if (this.pasoReserva > 1) {

      this.pasoReserva--;

    }

  }

  seleccionarHora(hora: string): void {

    this.horaSeleccionada = hora;

  }

  confirmarTurno(): void {
    this.pantallaActual = 'confirmado';
    this.pasoReserva = 1;

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  mostrarConfirmacion(tipo: string): void {
    this.pantallaActual = tipo;

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  volverInicio(): void {
    this.pantallaActual = 'inicio';

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  verDetalleTurno(): void {

  this.pantallaActual = 'detalle-turno';

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });

  }

  volverMisTurnos(): void {

    this.pantallaActual = 'mis-turnos';

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

  }

  reprogramarTurno(): void {

    console.log('Reprogramar turno');

  }

  cancelarTurnoDetalle(): void {

    console.log('Cancelar turno');

  }

  descargarComprobante(): void {

    console.log('Descargar comprobante');

  }

  agregarCalendario(): void {

    console.log('Agregar al calendario');

  }

  cerrarSesion(): void {

    this.router.navigate(['/']);

  }

}