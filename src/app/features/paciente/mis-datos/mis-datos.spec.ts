import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { DatosPaciente, DatosPacienteEditables, MisDatosRepository } from './data-access/mis-datos.repository';
import { ObraSocial, ObrasSocialesRepository } from './data-access/obras-sociales.repository';
import { MisDatos } from './mis-datos';

const DATOS: DatosPaciente = {
  nombre: 'Juan',
  apellido: 'Pérez',
  genero: 'MASCULINO',
  tipoIdentificacion: 'DNI',
  numIdentificacion: '30123456',
  fechaNacimiento: '1990-05-10',
  telefono: '+54 11 1234 5678',
  correo: 'juan@email.com',
  login: 'juanperez',
  obraSocialId: 1,
  grupoSanguineo: null,
  contactoEmergenciaNombre: null,
  contactoEmergenciaNumero: null,
  alergias: [{ id: 1, descripcion: 'Penicilina', severidad: 'GRAVE' }],
  medicaciones: [{ id: 2, medicamento: 'Enalapril', dosis: '10 mg', frecuencia: null }],
};

class RepoFalso implements MisDatosRepository {
  guardados: DatosPacienteEditables[] = [];
  obtener(): Observable<DatosPaciente> {
    return of(DATOS);
  }
  guardar(datos: DatosPacienteEditables): Observable<DatosPaciente> {
    this.guardados.push(datos);
    return of({ ...DATOS, ...datos });
  }
}

const OBRAS_SOCIALES: ObraSocial[] = [
  { id: 1, nombre: 'OSDE 210' },
  { id: 2, nombre: 'Galeno' },
];

describe('MisDatos', () => {
  let component: MisDatos;
  let fixture: ComponentFixture<MisDatos>;
  let repo: RepoFalso;

  beforeEach(async () => {
    repo = new RepoFalso();
    await TestBed.configureTestingModule({
      imports: [MisDatos],
      providers: [
        { provide: MisDatosRepository, useValue: repo },
        { provide: ObrasSocialesRepository, useValue: { listar: () => of(OBRAS_SOCIALES) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MisDatos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('carga los datos con el formulario bloqueado [CU03]', () => {
    expect(component.form.getRawValue().nombre).toBe('Juan');
    expect(component.form.disabled).toBe(true);
  });

  it('al editar habilita todo menos usuario y documento', () => {
    component.editar();
    expect(component.form.controls.nombre.enabled).toBe(true);
    expect(component.form.controls.login.disabled).toBe(true);
    expect(component.form.controls.numIdentificacion.disabled).toBe(true);
  });

  it('no guarda si hay errores', () => {
    component.editar();
    component.form.patchValue({ correo: 'no-es-mail' });
    component.guardar();
    expect(repo.guardados).toEqual([]);
  });

  it('guarda solo los editables y manda los opcionales vacíos como null', () => {
    component.editar();
    component.form.patchValue({ telefono: '11 5555 5555', contactoEmergenciaNombre: 'Ana Pérez' });
    component.guardar();

    const guardado = repo.guardados[0];
    expect(guardado).not.toHaveProperty('login');
    expect(guardado).not.toHaveProperty('numIdentificacion');
    expect(guardado.telefono).toBe('11 5555 5555');
    expect(guardado.contactoEmergenciaNombre).toBe('Ana Pérez');
    expect(guardado.contactoEmergenciaNumero).toBeNull();
    expect(component.guardado()).toBe(true);
    expect(component.form.disabled).toBe(true);
  });

  it('cancelar descarta los cambios', () => {
    component.editar();
    component.form.patchValue({ nombre: 'Otro' });
    component.cancelar();
    expect(component.form.getRawValue().nombre).toBe('Juan');
    expect(component.editando()).toBe(false);
  });

  describe('alergias y medicación [R03]', () => {
    it('se muestran de solo lectura, también al editar', () => {
      component.editar();
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      const alergia = el.querySelector<HTMLInputElement>('#alergia-0')!;
      expect(alergia.value).toBe('Penicilina');
      expect(alergia.disabled).toBe(true);
      expect(el.querySelector<HTMLInputElement>('#severidad-0')!.value).toBe('Grave');
      expect(el.querySelector<HTMLInputElement>('#medicamento-0')!.value).toBe('Enalapril');
      expect(el.querySelector<HTMLInputElement>('#frecuencia-0')!.value).toBe('—');
    });

    it('no se mandan al guardar', () => {
      component.editar();
      component.guardar();
      expect(repo.guardados[0]).not.toHaveProperty('alergias');
      expect(repo.guardados[0]).not.toHaveProperty('medicaciones');
    });
  });

  describe('obra social', () => {
    it('carga la obra social bloqueada y ofrece Particular más el catálogo', () => {
      fixture.detectChanges();
      expect(component.form.controls.obraSocialId.value).toBe(1);
      expect(component.form.controls.obraSocialId.disabled).toBe(true);
      const opciones = [...fixture.nativeElement.querySelectorAll('#obraSocialId option')].map((o: HTMLOptionElement) => o.textContent!.trim());
      expect(opciones).toEqual(['Particular', 'OSDE 210', 'Galeno']);
    });

    it('guarda la obra social elegida', () => {
      component.editar();
      component.form.patchValue({ obraSocialId: 2 });
      component.guardar();
      expect(repo.guardados[0].obraSocialId).toBe(2);
    });

    it('Particular se guarda como null', () => {
      component.editar();
      component.form.patchValue({ obraSocialId: null });
      component.guardar();
      expect(repo.guardados[0].obraSocialId).toBeNull();
      expect(component.form.controls.obraSocialId.value).toBeNull();
    });
  });
});
