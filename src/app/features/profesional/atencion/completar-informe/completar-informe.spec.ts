import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { Observable, of } from 'rxjs';
import { EstadoTurno } from '../../../../core/models/enums';
import { AgendaRepository } from '../../agenda/data-access/agenda.repository';
import { AgendaFalsa, turnoDePrueba } from '../../testing/datos-prueba';
import { AdjuntoInforme, AtencionRepository, DatosInforme, InformeConsulta } from '../data-access/atencion.repository';
import { CompletarInforme } from './completar-informe';

class AtencionFalsa implements AtencionRepository {
  informe: InformeConsulta | null = { id: 9, turnoId: 1, diagnostico: null, planTratamiento: null, indicaciones: null, finalizada: false, adjuntos: [] };
  llamadas: string[] = [];
  guardados: DatosInforme[] = [];
  obtener(): Observable<InformeConsulta | null> {
    return of(this.informe);
  }
  guardar(_: number, datos: DatosInforme): Observable<InformeConsulta> {
    this.llamadas.push('guardar');
    this.guardados.push(datos);
    this.informe = { ...this.informe!, ...datos };
    return of(this.informe);
  }
  cerrar(): Observable<InformeConsulta> {
    this.llamadas.push('cerrar');
    this.informe = { ...this.informe!, finalizada: true };
    return of(this.informe);
  }
  adjuntar(_: number, archivo: File): Observable<AdjuntoInforme> {
    return of({ id: 1, titulo: archivo.name, url: null });
  }
  quitarAdjunto(): Observable<void> {
    return of(undefined);
  }
  descargar(): Observable<Blob> {
    this.llamadas.push('descargar');
    return of(new Blob(['x']));
  }
}

describe('CompletarInforme', () => {
  let agenda: AgendaFalsa;
  let atencion: AtencionFalsa;
  let navigate: ReturnType<typeof vi.fn>;

  async function crear() {
    TestBed.configureTestingModule({
      imports: [CompletarInforme],
      providers: [
        provideRouter([]),
        { provide: AgendaRepository, useValue: agenda },
        { provide: AtencionRepository, useValue: atencion },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ turnoId: '1' }) } } },
      ],
    });
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true) as never;
    const fixture = TestBed.createComponent(CompletarInforme);
    await fixture.whenStable();
    return fixture.componentInstance;
  }

  const enviar = (c: CompletarInforme) => c.guardar(new Event('submit') as SubmitEvent);

  beforeEach(() => {
    agenda = new AgendaFalsa();
    agenda.turnos = [turnoDePrueba({ id: 1, estado: EstadoTurno.EN_CURSO, consultaId: 9 })];
    atencion = new AtencionFalsa();
  });

  it('sin atención iniciada vuelve al detalle del turno', async () => {
    agenda.turnos = [turnoDePrueba({ id: 1, estado: EstadoTurno.RESERVADO })];
    atencion.informe = null;
    await crear();
    expect(navigate).toHaveBeenCalledWith(['/profesional/turnos', 1]);
  });

  it('no guarda el informe sin diagnóstico', async () => {
    const c = await crear();
    enviar(c);
    expect(atencion.llamadas).toEqual([]);
    expect(c.invalido('diagnostico')).toBe(true);
  });

  it('guardar con la atención en curso guarda y cierra; queda de solo lectura [R13]', async () => {
    const c = await crear();
    c.form.setValue({ diagnostico: '  HTA estadio 1  ', planTratamiento: 'Enalapril', indicaciones: '' });
    enviar(c);
    expect(atencion.llamadas).toEqual(['guardar', 'cerrar']);
    expect(atencion.guardados).toEqual([{ diagnostico: 'HTA estadio 1', planTratamiento: 'Enalapril', indicaciones: '' }]);
    expect(c.soloLectura()).toBe(true);
    expect(c.form.disabled).toBe(true);
    expect(c.turno()?.estado).toBe(EstadoTurno.FINALIZADO);
  });

  it('cerrar sin informe cierra el turno sin pedir diagnóstico y deja el informe pendiente', async () => {
    const c = await crear();
    c.form.patchValue({ indicaciones: 'Reposo' });
    c.cerrarSinInforme();
    expect(atencion.llamadas).toEqual(['guardar', 'cerrar']);
    expect(c.turno()).toEqual(expect.objectContaining({ estado: EstadoTurno.FINALIZADO, informePendiente: true }));
    expect(c.pendiente()).toBe(true);
    expect(c.soloLectura()).toBe(false);
    expect(c.form.enabled).toBe(true);
  });

  it('un informe pendiente se completa después sin volver a cerrar la consulta', async () => {
    agenda.turnos = [turnoDePrueba({ id: 1, estado: EstadoTurno.FINALIZADO, consultaId: 9, informePendiente: true })];
    atencion.informe = { ...atencion.informe!, finalizada: true };
    const c = await crear();
    expect(c.pendiente()).toBe(true);
    c.form.patchValue({ diagnostico: 'HTA' });
    enviar(c);
    expect(atencion.llamadas).toEqual(['guardar']);
    expect(c.soloLectura()).toBe(true);
  });

  it('un informe con diagnóstico se abre de solo lectura [R14]', async () => {
    agenda.turnos = [turnoDePrueba({ id: 1, estado: EstadoTurno.FINALIZADO, consultaId: 9 })];
    atencion.informe = { ...atencion.informe!, diagnostico: 'HTA', finalizada: true };
    const c = await crear();
    expect(c.soloLectura()).toBe(true);
    expect(c.form.controls.diagnostico.value).toBe('HTA');
  });

  it('agrega estudios desde el campo de texto, sin repetir', async () => {
    const c = await crear();
    c.nuevoEstudio.setValue('  Hemograma ');
    c.agregarEstudio();
    c.nuevoEstudio.setValue('Hemograma');
    c.agregarEstudio();
    expect(c.estudios()).toEqual(['Hemograma']);
    expect(c.nuevoEstudio.value).toBe('');
  });

  it('descarga un adjunto con su nombre', async () => {
    const c = await crear();
    const crearUrl = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:x');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    c.descargar({ id: 4, titulo: 'ecg.pdf', url: 'http://api.test/media/ecg.pdf' });
    expect(atencion.llamadas).toEqual(['descargar']);
    expect(crearUrl).toHaveBeenCalled();
    expect((click.mock.contexts[0] as HTMLAnchorElement).download).toBe('ecg.pdf');
    vi.restoreAllMocks();
  });
});
