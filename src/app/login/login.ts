import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {

  constructor(private router: Router) {}

  ingresar(): void {
    this.router.navigate(['/paciente']);
  }

  volverHome(): void {
    this.router.navigate(['/']);
  }

}