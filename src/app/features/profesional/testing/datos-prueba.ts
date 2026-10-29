import { Observable, of } from 'rxjs';
import type { Disponibilidad } from '../../../core/models/disponibilidad';
import { EstadoTurno, TipoDocumento, TipoTurno } from '../../../core/models/enums';
import { isoLocal, sumarDias } from '../../../shared/utils/calendario';
import type { AgendaRepository, FichaPaciente, TurnoProfesional } from '../agenda/data-access/agenda.repository';

// Solo para specs: turnos armados a mano y un repositorio de agenda en memoria.

export function turnoDePrueba(parcial: Partial<TurnoProfesional> = {}): TurnoProfesional {
  return {
    id: 1,
    fecha: isoLocal(sumarDias(new Date(), 3)),
    horaInicio: '10:00',
    horaFin: '10:30',
    estado: EstadoTurno.RESERVADO,
    tipoTurno: TipoTurno.CONSULTA,
    especialidad: 'Cardiología',
    comentario: null,
    consultaId: null,
    informePendiente: false,
    paciente: {
      id: 7, nombre: 'Marcela', apellido: 'Díaz', tipoIdentificacion: TipoDocumento.DNI, numIdentificacion: '23.998.657',
      fechaNacimiento: '1974-03-02', telefono: null, correo: 'marcela@email.com', obraSocial: 'OSDE 210',
    },
    ...parcial,
  };
}

export class AgendaFalsa implements AgendaRepository {
  turnos: TurnoProfesional[] = [];
  disp: Disponibilidad = { horarios: [], bloqueos: [], slots: [] };
  llamadas: string[] = [];

  listar(): Observable<TurnoProfesional[]> {
    return of(this.turnos);
  }
  obtener(id: number): Observable<TurnoProfesional | null> {
    return of(this.turnos.find((t) => t.id === id) ?? null);
  }
  ficha(): Observable<FichaPaciente> {
    return of({ alergias: ['Penicilina'], medicaciones: [] });
  }
  iniciar(id: number): Observable<TurnoProfesional> {
    this.llamadas.push(`iniciar:${id}`);
    return of({ ...this.turnos.find((t) => t.id === id)!, estado: EstadoTurno.EN_CURSO });
  }
  cancelar(id: number): Observable<TurnoProfesional> {
    this.llamadas.push(`cancelar:${id}`);
    return of({ ...this.turnos.find((t) => t.id === id)!, estado: EstadoTurno.CANCELADO });
  }
  disponibilidad(): Observable<Disponibilidad> {
    return of(this.disp);
  }
  reprogramar(id: number, nuevoTurnoId: number): Observable<TurnoProfesional> {
    this.llamadas.push(`reprogramar:${id}->${nuevoTurnoId}`);
    return of({ ...this.turnos.find((t) => t.id === id)!, id: nuevoTurnoId });
  }
}
