import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { DatosPaciente, DatosPacienteEditables, MisDatosRepository } from './data-access/mis-datos.repository';
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

describe('MisDatos', () => {
  let component: MisDatos;
  let fixture: ComponentFixture<MisDatos>;
  let repo: RepoFalso;

  beforeEach(async () => {
    repo = new RepoFalso();
    await TestBed.configureTestingModule({
      imports: [MisDatos],
      providers: [{ provide: MisDatosRepository, useValue: repo }],
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
    it('carga las filas bloqueadas', () => {
      expect(component.form.controls.alergias.length).toBe(1);
      expect(component.form.controls.medicaciones.getRawValue()[0].medicamento).toBe('Enalapril');
      expect(component.form.controls.alergias.disabled).toBe(true);
    });

    it('agrega y quita filas', () => {
      component.editar();
      component.agregarAlergia();
      component.agregarMedicacion();
      expect(component.form.controls.alergias.length).toBe(2);
      expect(component.form.controls.medicaciones.at(1).enabled).toBe(true);

      component.quitar(component.form.controls.alergias, 0);
      expect(component.form.controls.alergias.getRawValue()[0].descripcion).toBe('');
    });

    it('no guarda una fila nueva vacía', () => {
      component.editar();
      component.agregarAlergia();
      component.guardar();
      expect(repo.guardados).toEqual([]);
    });

    it('guarda las listas completas, sin id las nuevas y opcionales vacíos como null', () => {
      component.editar();
      component.quitar(component.form.controls.medicaciones, 0);
      component.agregarMedicacion();
      component.form.controls.medicaciones.at(0).patchValue({ medicamento: ' Ibuprofeno ', dosis: '400 mg' });
      component.agregarAlergia();
      component.form.controls.alergias.at(1).patchValue({ descripcion: 'Maní' });
      component.guardar();

      const guardado = repo.guardados[0];
      expect(guardado.alergias).toEqual([
        { id: 1, descripcion: 'Penicilina', severidad: 'GRAVE' },
        { id: undefined, descripcion: 'Maní', severidad: null },
      ]);
      expect(guardado.medicaciones).toEqual([{ id: undefined, medicamento: 'Ibuprofeno', dosis: '400 mg', frecuencia: null }]);
      expect(component.form.controls.medicaciones.length).toBe(1);
      expect(component.form.disabled).toBe(true);
    });

    it('cancelar vuelve a las filas originales', () => {
      component.editar();
      component.quitar(component.form.controls.alergias, 0);
      component.agregarMedicacion();
      component.cancelar();
      expect(component.form.controls.alergias.getRawValue()[0].descripcion).toBe('Penicilina');
      expect(component.form.controls.medicaciones.length).toBe(1);
    });
  });
});
