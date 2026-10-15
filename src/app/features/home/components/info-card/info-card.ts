import { Component, input } from '@angular/core';

/** Tarjeta centrada con ícono, título y texto. */
@Component({
  selector: 'app-info-card',
  template: `
    <span class="icon" aria-hidden="true">{{ icono() }}</span>
    <h3>{{ titulo() }}</h3>
    <p>{{ texto() }}</p>
  `,
  styles: `
    :host {
      display: block;
      padding: 22px;
      text-align: center;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: #fff;
      transition: transform var(--transition-base), box-shadow var(--transition-base);
    }
    :host:hover { transform: translateY(-4px); box-shadow: var(--shadow-card); }
    .icon { font-size: 28px; color: var(--color-primary); }
    h3 { font-size: 0.9rem; margin: 12px 0 8px; }
    p { margin: 0; color: var(--color-text-muted); font-size: 0.78rem; line-height: 1.5; }
  `,
})
export class InfoCard {
  readonly icono = input.required<string>();
  readonly titulo = input.required<string>();
  readonly texto = input.required<string>();
}
