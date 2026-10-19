import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import type { DatosPaciente, DatosPacienteEditables, Medicacion, MisDatosRepository } from './mis-datos.repository';

// Datos ficticios en memoria hasta conectar el back.
@Injectable()
export class MisDatosMockRepository implements MisDatosRepository {
  private sigId = 10;

  private datos: Omit<DatosPaciente, 'medicaciones'> = {
    nombre: 'Juan',
    apellido: 'Pérez',
    genero: 'MASCULINO',
    tipoIdentificacion: 'DNI',
    numIdentificacion: '30123456',
    fechaNacimiento: '1990-05-10',
    telefono: '+54 11 1234 5678',
    correo: 'juan@cliniturnos.com',
    login: 'juanperez',
    grupoSanguineo: null,
    contactoEmergenciaNombre: null,
    contactoEmergenciaNumero: null,
    alergias: [{ id: 1, descripcion: 'Penicilina', severidad: 'GRAVE' }],
  };

  private medicaciones: (Medicacion & { activo: boolean })[] = [
    { id: 2, medicamento: 'Enalapril', dosis: '10 mg', frecuencia: 'Cada 12 h', activo: true },
    { id: 3, medicamento: 'Amoxicilina', dosis: '500 mg', frecuencia: 'Cada 8 h', activo: false },
  ];

  obtener(): Observable<DatosPaciente> {
    return of(this.actual()).pipe(delay(300));
  }

  guardar(cambios: DatosPacienteEditables): Observable<DatosPaciente> {
    const { medicaciones, ...resto } = cambios;
    this.datos = { ...this.datos, ...resto, alergias: resto.alergias.map((a) => ({ ...a, id: a.id ?? this.sigId++ })) };
    
    // esto dsp lo trae bien desde el back directamente
    const quitadas = this.medicaciones 
      .filter((m) => !medicaciones.some((c) => c.id === m.id))
      .map((m) => ({ ...m, activo: false }));

    this.medicaciones = [...quitadas, ...medicaciones.map((m) => ({ ...m, id: m.id ?? this.sigId++, activo: true }))];
    return of(this.actual()).pipe(delay(400));
  }

  private actual(): DatosPaciente {
    const medicaciones = this.medicaciones.filter((m) => m.activo).map(({ activo, ...m }) => m);
    return { ...this.datos, alergias: [...this.datos.alergias], medicaciones };
  }
}
