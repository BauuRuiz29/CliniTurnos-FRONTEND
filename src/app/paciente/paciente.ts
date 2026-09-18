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

    alert('¡Turno confirmado correctamente!');

    this.pantallaActual = 'mis-turnos';

    this.pasoReserva = 1;

  }


  cerrarSesion(): void {

    this.router.navigate(['/']);

  }

}