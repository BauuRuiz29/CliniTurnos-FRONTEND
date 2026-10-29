import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import type { DatosPaciente, DatosPacienteEditables, MisDatosRepository } from './mis-datos.repository';

// Datos ficticios en memoria (para trabajar sin back).
@Injectable()
export class MisDatosMockRepository implements MisDatosRepository {
  private datos: DatosPaciente = {
    nombre: 'Juan',
    apellido: 'Pérez',
    genero: 'MASCULINO',
    tipoIdentificacion: 'DNI',
    numIdentificacion: '30123456',
    fechaNacimiento: '1990-05-10',
    telefono: '+54 11 1234 5678',
    correo: 'juan@cliniturnos.com',
    login: 'juanperez',
    obraSocialId: 1, // OSDE 210
    grupoSanguineo: null,
    contactoEmergenciaNombre: null,
    contactoEmergenciaNumero: null,
    alergias: [{ id: 1, descripcion: 'Penicilina', severidad: 'GRAVE' }],
    medicaciones: [{ id: 2, medicamento: 'Enalapril', dosis: '10 mg', frecuencia: 'Cada 12 h' }],
  };

  obtener(): Observable<DatosPaciente> {
    return of({ ...this.datos }).pipe(delay(300));
  }

  guardar(cambios: DatosPacienteEditables): Observable<DatosPaciente> {
    this.datos = { ...this.datos, ...cambios };
    return of({ ...this.datos }).pipe(delay(400));
  }
}
