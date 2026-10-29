import { Injectable, inject } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { EstadoTurno } from '../../../../core/models/enums';
import { DEMORA_MS, ProfesionalMockDb } from '../../data-access/profesional.mock-db';
import type { PacienteAsignado, PacientesRepository } from './pacientes.repository';

@Injectable()
export class PacientesMockRepository implements PacientesRepository {
  private readonly db = inject(ProfesionalMockDb);

  listar(): Observable<PacienteAsignado[]> {
    const pacientes = this.db.pacientes.map((p): PacienteAsignado => {
      const turnos = this.db.turnos.filter((t) => t.pacienteId === p.id).sort((a, b) => `${b.fecha}${b.horaInicio}`.localeCompare(`${a.fecha}${a.horaInicio}`));
      return {
        id: p.id,
        nombre: p.nombre,
        apellido: p.apellido,
        numIdentificacion: p.numIdentificacion,
        telefono: p.telefono,
        ultimaConsulta: turnos.find((t) => t.estado === EstadoTurno.FINALIZADO)?.fecha ?? null,
        ultimoTurnoId: turnos[0]?.id ?? null,
      };
    });
    return of(pacientes).pipe(delay(DEMORA_MS));
  }
}
