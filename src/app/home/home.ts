import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface Step {
  number: number;
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent {

  // Links de navegación. Se recorren con *ngFor en el header.
  navLinks: string[] = [
    'Inicio',
    '¿Cómo funciona?',
    'Especialidades',
    'Para profesionales',
    'Sobre nosotros',
    'Contacto'
  ];

  // Tarjetas de la sección "Todo lo que necesitás en un solo lugar"
  features: Feature[] = [
    {
      icon: 'calendar',
      title: 'Reservá tu turno',
      description: 'Encontrá profesionales, elegí el horario que mejor te convenga y reservá tu turno online.'
    },
    {
      icon: 'document',
      title: 'Consultá tus informes',
      description: 'Accedé a tus estudios e informes médicos de forma rápida y segura.'
    },
    {
      icon: 'bell',
      title: 'Recordatorios automáticos',
      description: 'Recibí recordatorios de tus turnos para que no te olvides de tu consulta.'
    },
    {
      icon: 'shield',
      title: 'Tus datos protegidos',
      description: 'Protegemos tu información personal y médica con los más altos estándares de seguridad.'
    }
  ];

  // Pasos de la sección "¿Cómo funciona CliniTurnos?"
  steps: Step[] = [
    {
      number: 1,
      icon: 'user',
      title: 'Creá tu cuenta',
      description: 'Registrate en pocos pasos y completá tus datos.'
    },
    {
      number: 2,
      icon: 'calendar',
      title: 'Elegí tu turno',
      description: 'Buscá al profesional o especialidad y seleccioná el mejor horario.'
    },
    {
      number: 3,
      icon: 'check',
      title: 'Confirmá tu reserva',
      description: 'Recibí la confirmación y recordatorios automáticos.'
    },
    {
      number: 4,
      icon: 'file',
      title: 'Accedé a tus informes',
      description: 'Consultá y descargá tus informes cuando estén disponibles.'
    }
  ];

  onReservarTurno(): void {
    // Navegar al flujo de reserva de turno.
    // this.router.navigate(['/reservar-turno']);
    console.log('Ir a Reservar turno');
  }

  onSoyProfesional(): void {
    // Navegar a la sección/registro para profesionales.
    // this.router.navigate(['/para-profesionales']);
    console.log('Ir a Soy profesional');
  }

  onIniciarSesion(): void {
    // this.router.navigate(['/login']);
    console.log('Ir a Iniciar sesión');
  }

  onRegistrarse(): void {
    // this.router.navigate(['/registro']);
    console.log('Ir a Registrarse');
  }
}
