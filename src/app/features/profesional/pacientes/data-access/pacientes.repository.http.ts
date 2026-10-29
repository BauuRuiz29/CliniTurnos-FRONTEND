import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';
import { EstadoTurno } from '../../../../core/models/enums';
import { hoyIso } from '../../../../shared/utils/formularios';
import { ProfesionalApi, aPacienteTurno, conPaciente } from '../../data-access/profesional-api';
import type {
  AlergiaEditable,
  MedicacionEditable,
  PacienteAsignado,
  PacientesRepository,
  HistoriaPaciente,
} from './pacientes.repository';

// GET /clinicos/historias-clinicas/: al médico le devuelve las de los pacientes que atendió [Rnf 01].
interface HistoriaClinicaDto {
  id: number;
  paciente: number;
  alergias: { id: number; descripcion: string; severidad: string | null }[];
  medicaciones: { id: number; medicamento: string; dosis: string | null; frecuencia: string | null; activo: boolean }[];
}

/**
 * Pacientes del profesional contra la API [R14].
 * El back no tiene un listado de pacientes por profesional: se arma con los pacientes de sus turnos
 * (el mismo criterio con el que el back le deja ver historias clínicas) [Rnf 01].
 */
@Injectable()
export class PacientesHttpRepository implements PacientesRepository {
  private readonly api = inject(ProfesionalApi);
  private readonly http = inject(HttpClient);

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
          };
        });
      }),
    );
  }

  perfil(pacienteId: number): Observable<HistoriaPaciente> {
    return forkJoin({
      paciente: this.api.paciente(pacienteId),
      historias: this.http.get<HistoriaClinicaDto[]>(`${this.api.url}/clinicos/historias-clinicas/`),
    }).pipe(
      map(({ paciente, historias }) => {
        const h = historias.find((x) => x.paciente === pacienteId);
        if (!h) throw new Error('El paciente no tiene historia clínica visible para el profesional.');
        return {
          paciente: aPacienteTurno(paciente),
          historiaId: h.id,
          alergias: h.alergias.map(({ id, descripcion, severidad }) => ({ id, descripcion, severidad })),
          medicaciones: h.medicaciones
            .filter((m) => m.activo)
            .map(({ id, medicamento, dosis, frecuencia }) => ({ id, medicamento, dosis, frecuencia })),
        };
      }),
    );
  }

  // Alta con POST, cambios con PATCH. Las alergias quitadas se borran; las medicaciones quitadas
  // se dan por suspendidas (activo = false) para no perder el historial.
  guardarHistoria(antes: HistoriaPaciente, alergias: AlergiaEditable[], medicaciones: MedicacionEditable[]): Observable<HistoriaPaciente> {
    const url = `${this.api.url}/clinicos`;
    const historia = antes.historiaId;
    const hoy = hoyIso();
    const pedidos: Observable<unknown>[] = [];

    for (const { id, descripcion, severidad } of alergias) {
      const previa = antes.alergias.find((a) => a.id === id);
      if (id === null) pedidos.push(this.http.post(`${url}/alergias/`, { historia, descripcion, severidad, fecha_registro: new Date().toISOString() }));
      else if (previa && (previa.descripcion !== descripcion || previa.severidad !== severidad))
        pedidos.push(this.http.patch(`${url}/alergias/${id}/`, { descripcion, severidad }));
    }
    for (const a of antes.alergias.filter((a) => !alergias.some((x) => x.id === a.id)))
      pedidos.push(this.http.delete(`${url}/alergias/${a.id}/`));

    for (const { id, medicamento, dosis, frecuencia } of medicaciones) {
      const previa = antes.medicaciones.find((m) => m.id === id);
      if (id === null) pedidos.push(this.http.post(`${url}/medicaciones/`, { historia, medicamento, dosis, frecuencia, fecha_desde: hoy, activo: true }));
      else if (previa && (previa.medicamento !== medicamento || previa.dosis !== dosis || previa.frecuencia !== frecuencia))
        pedidos.push(this.http.patch(`${url}/medicaciones/${id}/`, { medicamento, dosis, frecuencia }));
    }
    for (const m of antes.medicaciones.filter((m) => !medicaciones.some((x) => x.id === m.id)))
      pedidos.push(this.http.patch(`${url}/medicaciones/${m.id}/`, { activo: false, fecha_hasta: hoy }));

    return (pedidos.length ? forkJoin(pedidos) : of([])).pipe(switchMap(() => this.perfil(antes.paciente.id)));
  }
}
