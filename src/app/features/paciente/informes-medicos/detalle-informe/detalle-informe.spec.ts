import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { InformeMedico, InformesRepository } from '../data-access/informes.repository';
import { DetalleInforme } from './detalle-informe';

const base: InformeMedico = {
  id: 1, turnoId: 4, fecha: '2026-10-01', profesional: { id: 3, nombre: 'Dr. Pablo Sánchez' }, especialidad: 'Traumatología',
  lugar: { nombre: 'Clínica Centro', direccion: '' }, diagnostico: 'Tendinitis', planTratamiento: null, indicaciones: 'Reposo',
  adjuntos: [{ id: 1, titulo: 'Orden de kinesiología' }],
};

describe('DetalleInforme', () => {
  function crear(informe: InformeMedico | null) {
    TestBed.configureTestingModule({
      imports: [DetalleInforme],
      providers: [
        provideRouter([]),
        { provide: InformesRepository, useValue: { listar: () => of([]), obtener: () => of(informe) } },
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
});
