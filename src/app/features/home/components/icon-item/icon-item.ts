import { Component, input } from '@angular/core';

/** Ícono en recuadro + título + texto, en fila. Los saltos de línea del texto se respetan. */
@Component({
  selector: 'app-icon-item',
  template: `
    <span class="icon" aria-hidden="true">{{ icono() }}</span>
    <div>
      <strong>{{ titulo() }}</strong>
      <p>{{ texto() }}</p>
    </div>
  `,
  styles: `
    :host { display: flex; gap: 12px; }
    .icon {
      width: 38px;
      height: 38px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      background: var(--color-primary-light);
      color: var(--color-primary);
    }
    strong { font-size: 0.85rem; }
    p {
      margin: 4px 0 0;
      color: var(--color-text-muted);
      font-size: 0.75rem;
      line-height: 1.5;
      white-space: pre-line;
    }
  `,
})
export class IconItem {
  readonly icono = input.required<string>();
  readonly titulo = input.required<string>();
  readonly texto = input.required<string>();
}
