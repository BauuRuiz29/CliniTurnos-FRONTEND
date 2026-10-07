import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reservar-turno',
  templateUrl: './reservar-turno.html',
})
export class ReservarTurno {
  private readonly router = inject(Router);

  readonly step = signal(1);
  readonly selectedProfessional = signal('Dr. Juan García');
  readonly selectedSpecialty = signal('Cardiología');
  readonly selectedHour = signal('10:30 hs.');
  readonly calendarDays = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28];
  readonly hours = ['08:00 hs.', '08:30 hs.', '09:00 hs.', '09:30 hs.', '10:00 hs.', '10:30 hs.', '11:00 hs.', '11:30 hs.', '12:00 hs.'];

  selectProfessional(name: string, specialty: string): void {
    this.selectedProfessional.set(name);
    this.selectedSpecialty.set(specialty);
  }

  nextStep(): void {
    this.step.update(current => Math.min(current + 1, 3));
  }

  previousStep(): void {
    this.step.update(current => Math.max(current - 1, 1));
  }

  confirmAppointment(): void {
    void this.router.navigate(['/paciente/confirmacion/turno-confirmado']);
  }
}