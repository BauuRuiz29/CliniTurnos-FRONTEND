import { AfterViewInit, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IconItem } from './components/icon-item/icon-item';
import { InfoBanner } from './components/info-banner/info-banner';
import { InfoCard } from './components/info-card/info-card';

interface Bloque {
  icono: string;
  titulo: string;
  texto: string;
}

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
  imports: [IconItem, InfoBanner, InfoCard,RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements AfterViewInit {

  private readonly router = inject(Router);

  //#region datos fijos
  // Links de navegación del header: texto y sección a la que scrollean.
  navLinks = [
    { label: 'Inicio', id: '#inicio' },
    { label: '¿Cómo funciona?', id: '#como-funciona' },
    { label: 'Sobre nosotros', id: '#nosotros' },
    { label: 'Especialidades', id: '#especialidades' },
    { label: 'Para profesionales', id: '#profesionales' },
    { label: 'Contacto', id: '#contacto' }
  ];

  // Sección "¿Quiénes somos?"
  nosotros: Bloque[] = [
    { icono: '♧', titulo: 'Nuestra misión', texto: 'Facilitar el acceso a la salud mediante tecnología innovadora y fácil de usar.' },
    { icono: '♡', titulo: 'Nuestra visión', texto: 'Ser la plataforma líder en gestión de turnos e información médica en Latinoamérica.' },
    { icono: '☆', titulo: 'Nuestros valores', texto: 'Compromiso, confianza, empatía, innovación y mejora continua.' },
    { icono: '♢', titulo: 'Tu salud, nuestro compromiso', texto: 'Cuidamos tus datos y te acompañamos en cada paso.' }
  ];

  // Sección "Especialidades" (vidriera de la landing, no el catálogo real)
  especialidades: Bloque[] = [
    { icono: '♡', titulo: 'Cardiología', texto: 'Prevención, diagnóstico y tratamiento de enfermedades del corazón.' },
    { icono: '♢', titulo: 'Dermatología', texto: 'Cuidado de la piel, cabello y uñas.' },
    { icono: '♙', titulo: 'Pediatría', texto: 'Atención médica integral desde el nacimiento hasta la adolescencia.' },
    { icono: '♧', titulo: 'Clínica médica', texto: 'Evaluación y tratamiento de enfermedades en adultos en general.' },
    { icono: '⌁', titulo: 'Traumatología', texto: 'Diagnóstico y tratamiento de lesiones del sistema musculoesquelético.' },
    { icono: '♀', titulo: 'Ginecología', texto: 'Salud integral de la mujer en todas las etapas de su vida.' },
    { icono: '◉', titulo: 'Oftalmología', texto: 'Diagnóstico y tratamiento de enfermedades oftalmológicas.' },
    { icono: '♧', titulo: 'Otorrinolaringología', texto: 'Tratamiento de afecciones de oído, nariz, garganta y cuello.' },
    { icono: '•••', titulo: 'Y más especialidades', texto: 'Descubrí todas las especialidades disponibles en nuestra plataforma.' }
  ];

  // Sección "Para profesionales"
  beneficiosProfesionales: Bloque[] = [
    { icono: '📅', titulo: 'Agenda inteligente', texto: 'Administrá tus turnos de forma ágil y evitá superposiciones.' },
    { icono: '♙', titulo: 'Gestión de pacientes', texto: 'Accedé al historial, informes y estudios de tus pacientes.' },
    { icono: '▣', titulo: 'Informes digitales', texto: 'Generá y compartí informes médicos de manera segura.' },
    { icono: '◷', titulo: 'Disponible 24/7', texto: 'Accedé a tu agenda e información desde cualquier dispositivo.' }
  ];

  // Sección "Contacto" (\n = salto de línea en pantalla)
  contacto: Bloque[] = [
    { icono: '◉', titulo: 'WhatsApp', texto: '+54 11 1234 5678' },
    { icono: '✉', titulo: 'Email', texto: 'hola@cliniturnos.com' },
    { icono: '☎', titulo: 'Teléfono', texto: '+54 11 1234 5678' },
    { icono: '◷', titulo: 'Horario de atención', texto: 'Lunes a viernes de 8 a 20 hs.\nSábados de 9 a 13 hs.' },
    { icono: '⌖', titulo: 'Ubicación', texto: 'Av. Siempre Viva 1234,\nCórdoba, Argentina.' }
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

  //#endregion

  scrollToSection(event: Event, id: string): void {
    event.preventDefault();
    const section = document.querySelector(id);
    if (section) {
      section.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  ngAfterViewInit(): void {

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      {
        threshold: 0.15
      }
    );

    const sections = document.querySelectorAll('.scroll-section');

    sections.forEach((section) => {
      observer.observe(section);
    });
  }
}
