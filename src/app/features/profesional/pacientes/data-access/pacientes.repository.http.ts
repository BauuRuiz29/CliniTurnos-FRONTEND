import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { EstadoTurno } from '../../../../core/models/enums';
import { ProfesionalApi, conPaciente } from '../../data-access/profesional-api';
import type { PacienteAsignado, PacientesRepository } from './pacientes.repository';

/**
 * Pacientes del profesional contra la API [R14].
 * El back no tiene un listado de pacientes por profesional: se arma con los pacientes de sus turnos
 * (el mismo criterio con el que el back le deja ver historias clínicas) [Rnf 01].
 */
@Injectable()
export class PacientesHttpRepository implements PacientesRepository {
  private readonly api = inject(ProfesionalApi);

  listar(): Observable<PacienteAsignado[]> {
    return forkJoin({ turnos: this.api.turnos(), pacientes: this.api.pacientes() }).pipe(
      map(({ turnos, pacientes }) => {
        const propios = conPaciente(turnos).sort((a, b) => `${b.fecha}${b.fecha_hora_inicio}`.localeCompare(`${a.fecha}${a.fecha_hora_inicio}`));
        const ids = [...new Set(propios.map((t) => t.paciente!))].filter((id) => pacientes.has(id));
        return ids.map((id): PacienteAsignado => {
          const p = pacientes.get(id)!;
          const turnos = propios.filter((t) => t.paciente === id);
          return {
            id,
            nombre: p.usuario.nombre,
            apellido: p.usuario.apellido,
            numIdentificacion: p.num_identificacion,
            telefono: p.telefono,
            ultimaConsulta: turnos.find((t) => t.estado === EstadoTurno.FINALIZADO)?.fecha ?? null,
            ultimoTurnoId: turnos[0]?.id ?? null,
          };
        });
      }),
    );
  }
}
