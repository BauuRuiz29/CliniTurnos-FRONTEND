import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { InformesMockRepository } from './data-access/informes.repository.mock';
import { InformeMedico, InformesRepository } from './data-access/informes.repository';
import { InformesMedicos } from './informes-medicos';

const informe = (id: number, fecha: string): InformeMedico => ({
  id, turnoId: id, fecha, profesional: { id: 1, nombre: 'Dr. Juan García' }, especialidad: 'Cardiología',
  lugar: { nombre: 'Clínica Centro', direccion: '' }, diagnostico: null, planTratamiento: null, indicaciones: null, adjuntos: [],
});

describe('InformesMedicos', () => {
  async function crear(listar: () => Observable<InformeMedico[]>) {
    TestBed.configureTestingModule({
      imports: [InformesMedicos],
      providers: [provideRouter([]), { provide: InformesRepository, useValue: { listar, obtener: () => of(null) } }],
    });
    const fixture = TestBed.createComponent(InformesMedicos);
    await fixture.whenStable();
    return fixture;
  }

  it('lista los informes, el más reciente primero, con Descargar deshabilitado [R10]', async () => {
    const fixture = await crear(() => of([informe(1, '2026-01-10'), informe(2, '2026-03-05')]));
    const el: HTMLElement = fixture.nativeElement;
    const titulos = [...el.querySelectorAll('.report strong')].map((s) => s.textContent);
    expect(titulos).toEqual(['Informe - 05/03/2026', 'Informe - 10/01/2026']);
    expect([...el.querySelectorAll<HTMLButtonElement>('.report button')].filter((b) => b.disabled)).toHaveLength(2);
  });

  it('muestra vacío y error', async () => {
    expect((await crear(() => of([]))).nativeElement.textContent).toContain('Todavía no tenés informes');
    TestBed.resetTestingModule();
    expect((await crear(() => throwError(() => new Error()))).nativeElement.textContent).toContain('No pudimos cargar');
  });
});

describe('InformesMockRepository', () => {
  it('obtiene por id y devuelve null si no existe', async () => {
    const repo = new InformesMockRepository();
    const lista = await new Promise<InformeMedico[]>((r) => repo.listar().subscribe(r));
    expect(lista.length).toBeGreaterThan(0);
    expect(await new Promise((r) => repo.obtener(lista[0].id).subscribe(r))).toEqual(lista[0]);
    expect(await new Promise((r) => repo.obtener(999).subscribe(r))).toBeNull();
  });
});
