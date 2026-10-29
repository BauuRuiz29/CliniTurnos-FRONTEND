import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { InformeMedico, InformesRepository } from '../data-access/informes.repository';
import { DetalleInforme } from './detalle-informe';

const base: InformeMedico = {
  id: 1, turnoId: 4, fecha: '2026-10-01', profesional: 'Pablo Sánchez', especialidad: 'Traumatología',
  diagnostico: 'Tendinitis', planTratamiento: null, indicaciones: 'Reposo',
  adjuntos: [{ id: 1, titulo: 'Orden de kinesiología', url: 'http://api.test/media/orden.pdf' }],
};

describe('DetalleInforme', () => {
  function crear(informe: InformeMedico | null) {
    TestBed.configureTestingModule({
      imports: [DetalleInforme],
      providers: [
        provideRouter([]),
        { provide: InformesRepository, useValue: { listar: () => of([]), obtener: () => of(informe), descargar: () => of(new Blob(['x'])) } },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ informeId: '1' })) } },
      ],
    });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(DetalleInforme);
    fixture.detectChanges();
    return { el: fixture.nativeElement as HTMLElement, navigate };
  }

  it('redirige a informes si no existe', () => {
    expect(crear(null).navigate).toHaveBeenCalledWith(['/paciente/informes']);
  });

  it('muestra diagnóstico, plan, indicaciones y adjuntos [R10]', () => {
    const texto = crear(base).el.textContent;
    expect(texto).toContain('Tendinitis');
    expect(texto).toContain('Sin datos');
    expect(texto).toContain('Reposo');
    expect(texto).toContain('Orden de kinesiología');
  });

  it('cada adjunto se puede descargar y, si es uno solo, también desde Acciones', () => {
    const { el } = crear(base);
    expect(el.querySelector('button.adjunto')?.getAttribute('aria-label')).toBe('Descargar Orden de kinesiología');
    const accion = [...el.querySelectorAll<HTMLButtonElement>('.detail-action')].find((b) => b.textContent?.includes('Descargar'));
    expect(accion?.disabled).toBe(false);
  });

  it('sin adjuntos avisa que no hay archivos', () => {
    expect(crear({ ...base, adjuntos: [] }).el.textContent).toContain('no tiene archivos adjuntos');
  });
});
