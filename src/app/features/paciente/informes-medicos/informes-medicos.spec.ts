import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { InformesMockRepository } from './data-access/informes.repository.mock';
import { InformeMedico, InformesRepository } from './data-access/informes.repository';
import { InformesMedicos } from './informes-medicos';

const informe = (id: number, fecha: string, adjuntos: InformeMedico['adjuntos'] = []): InformeMedico => ({
  id, turnoId: id, fecha, profesional: 'Juan García', especialidad: 'Cardiología', diagnostico: 'HTA', planTratamiento: null, indicaciones: null, adjuntos,
});

const ADJUNTO = { id: 7, titulo: 'ecg.pdf', url: 'http://api.test/media/ecg.pdf' };

describe('InformesMedicos', () => {
  let descargar: ReturnType<typeof vi.fn>;

  async function crear(listar: () => Observable<InformeMedico[]>) {
    descargar = vi.fn(() => of(new Blob(['x'])));
    TestBed.configureTestingModule({
      imports: [InformesMedicos],
      providers: [provideRouter([]), { provide: InformesRepository, useValue: { listar, obtener: () => of(null), descargar } }],
    });
    const fixture = TestBed.createComponent(InformesMedicos);
    await fixture.whenStable();
    return fixture;
  }

  it('lista los informes, el más reciente primero [R10]', async () => {
    const fixture = await crear(() => of([informe(1, '2026-01-10'), informe(2, '2026-03-05')]));
    const el: HTMLElement = fixture.nativeElement;
    const titulos = [...el.querySelectorAll('.report strong')].map((s) => s.textContent);
    expect(titulos).toEqual(['Informe - 05/03/2026', 'Informe - 10/01/2026']);
  });

  it('Descargar aparece solo con adjuntos: con uno lo descarga, con varios lleva al detalle', async () => {
    const fixture = await crear(() => of([informe(1, '2026-01-10'), informe(2, '2026-02-10', [ADJUNTO]), informe(3, '2026-03-10', [ADJUNTO, { ...ADJUNTO, id: 8 }])]));
    const botones = [...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('.report button')].map((b) => b.textContent!.trim());
    expect(botones).toEqual(['Ver detalles', 'Descargar (2)', 'Ver detalles', 'Descargar', 'Ver detalles']);

    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:x');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    fixture.componentInstance.descargar(ADJUNTO);
    expect(descargar).toHaveBeenCalledWith(ADJUNTO);
    expect((click.mock.contexts[0] as HTMLAnchorElement).download).toBe('ecg.pdf');
    vi.restoreAllMocks();
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
