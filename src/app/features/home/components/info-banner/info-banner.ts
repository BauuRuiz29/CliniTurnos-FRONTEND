import { Component, input } from '@angular/core';

/** Franja celeste con ícono, título y texto. Un botón opcional se proyecta a la derecha. */
@Component({
  selector: 'app-info-banner',
  template: `
    <span class="icon" aria-hidden="true">{{ icono() }}</span>
    <div>
      <strong>{{ titulo() }}</strong>
      <p>{{ texto() }}</p>
    </div>
    <div class="acciones"><ng-content /></div>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 18px 22px;
      border-radius: var(--radius-md);
      background: var(--color-primary-light);
    }
    .icon { font-size: 28px; color: var(--color-primary); }
    p { margin: 4px 0 0; color: var(--color-text-muted); font-size: 0.78rem; }
    .acciones { margin-left: auto; }
  `,
})
export class InfoBanner {
  readonly icono = input.required<string>();
  readonly titulo = input.required<string>();
  readonly texto = input.required<string>();
}
