import { formatDate } from '@angular/common';
import { Injectable } from '@angular/core';
import { EstadoTurno, Genero, TipoDocumento, TipoTurno } from '../../../core/models/enums';
import { DIAS_SEMANA, VENTANA_DIAS, isoLocal, sumarDias } from '../../../shared/utils/calendario';
import type { PacienteTurno } from '../agenda/data-access/agenda.repository';
import type { AdjuntoInforme } from '../atencion/data-access/atencion.repository';
import type { Bloqueo, HorarioProfesional } from '../disponibilidad/data-access/disponibilidad.repository';
import type { NotificacionProfesional } from '../notificaciones/data-access/notificaciones.repository';
import type { PerfilProfesional } from '../perfil/data-access/perfil.repository';

// "Base" en memoria que comparten los repositorios mock del área profesional, para que
// iniciar, cancelar o bloquear en una pantalla se vea en las demás. TODO: reemplazar por el back.

export const DEMORA_MS = 200;

export interface FilaTurno {
  id: number;
  fecha: string; // yyyy-MM-dd
  horaInicio: string; // HH:mm
  horaFin: string; // HH:mm
  estado: EstadoTurno;
  tipoTurno: TipoTurno;
  pacienteId: number | null;
  comentario: string | null;
}

export interface FilaConsulta {
  id: number;
  turnoId: number;
  diagnostico: string | null;
  planTratamiento: string | null;
  indicaciones: string | null;
  finalizada: boolean;
  adjuntos: AdjuntoInforme[];
}

export interface FilaPaciente extends PacienteTurno {
  alergias: string[];
  medicaciones: string[];
}

//#region DATOS FORZADOS
const ESPECIALIDAD = 'Cardiología';

const PERFIL: PerfilProfesional = {
  nombre: 'Juan Manuel',
  apellido: 'García',
  foto: 'doctor-avatar.png',
  genero: Genero.MASCULINO,
  especialidades: [ESPECIALIDAD],
  matriculas: ['MN 123456 · Nacional · Nación'],
  correo: 'jgarcia@cliniturnos.com',
};

const paciente = (id: number, nombre: string, apellido: string, dni: string, fechaNacimiento: string, obraSocial: string | null, alergias: string[] = [], medicaciones: string[] = []): FilaPaciente => ({
  id, nombre, apellido, tipoIdentificacion: TipoDocumento.DNI, numIdentificacion: dni, fechaNacimiento,
  telefono: `+54 9 11 ${2000 + id * 111} ${4000 + id * 37}`, correo: `${nombre.toLowerCase()}.${apellido.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')}@email.com`,
  obraSocial, alergias, medicaciones,
});

const PACIENTES: FilaPaciente[] = [
  paciente(1, 'Marcela', 'Díaz', '23.998.657', '1974-03-02', 'OSDE 210', [], ['Levotiroxina 75mg']),
  paciente(2, 'Roberto', 'González', '13.565.443', '1958-07-21', 'PAMI', ['Penicilina'], ['Enalapril 10mg', 'Aspirina 100mg']),
  paciente(3, 'Lautaro', 'Viera', '46.065.654', '2004-11-10', 'Swiss Medical'),
  paciente(4, 'Sergio', 'Jiménez', '30.105.574', '1983-05-30', 'Galeno', ['Ibuprofeno']),
  paciente(5, 'Nicolás', 'Rodríguez', '33.234.174', '1987-09-14', 'OSDE 310'),
  paciente(6, 'Matías', 'Gómez', '44.912.454', '2002-01-25', null),
  paciente(7, 'Micaela', 'López', '22.422.556', '1971-12-08', 'Medifé', [], ['Atorvastatina 20mg']),
  paciente(8, 'Ana', 'Álvarez', '44.976.577', '2003-04-17', 'OSDE 210', ['Látex']),
];

// Mismos bloques de una hora todos los días hábiles; algunos apagados, como en el prototipo.
const BLOQUES: [string, string, boolean][] = [
  ['08:00', '09:00', true], ['09:00', '10:00', true], ['10:00', '11:00', true], ['11:00', '12:00', false],
  ['14:00', '15:00', true], ['15:00', '16:00', true], ['16:00', '17:00', false],
];
const DIAS_HABILES = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'] as const;
const DURACION_MIN = 30;

const COMENTARIOS = ['Control anual', 'Dolor en el pecho al hacer ejercicio', null, 'Traigo estudios anteriores', null];
const INFORME_EJEMPLO = {
  diagnostico: 'Hipertensión arterial esencial (HTA) - Estadio 1.',
  planTratamiento: '• Enalapril 10 mg cada 24 horas.\n• Control de la presión arterial en domicilio.\n• Reevaluación clínica en 30 días.',
  indicaciones: '• Reducir el consumo de sal.\n• Realizar actividad física moderada (150 minutos semanales).',
};
//#endregion

@Injectable({ providedIn: 'root' })
export class ProfesionalMockDb {
  readonly perfil = PERFIL;
  readonly pacientes = PACIENTES;
  readonly horarios: HorarioProfesional[] = [];
  readonly bloqueos: Bloqueo[] = [];
  readonly turnos: FilaTurno[] = [];
  readonly consultas: FilaConsulta[] = [];
  readonly notificaciones: NotificacionProfesional[] = [];
  private sigId = 1;

  constructor() {
    for (const diaSemana of DIAS_HABILES) {
      for (const [horaDesde, horaHasta, activo] of BLOQUES) {
        this.horarios.push({ id: this.nuevoId(), diaSemana, horaDesde, horaHasta, duracionTurnosMin: DURACION_MIN, activo });
      }
    }
    this.generarTurnos(new Date());
    this.generarNotificaciones(new Date());
  }

  nuevoId(): number {
    return this.sigId++;
  }

  // Simula la generación de slots del back: historial de 30 días y ventana de 30 días hacia adelante.
  private generarTurnos(ahora: Date): void {
    const hoy = isoLocal(ahora);
    const ya = formatDate(ahora, 'HH:mm', 'en-US');
    let n = 0;

    // Un día completo bloqueado dentro de la ventana, como ejemplo.
    const diaBloqueado = this.diasHabiles(ahora, 3, VENTANA_DIAS)[2];
    if (diaBloqueado) this.bloqueos.push({ id: this.nuevoId(), fechaDesde: `${diaBloqueado}T00:00`, fechaHasta: `${diaBloqueado}T23:59`, motivo: 'Congreso de cardiología' });

    for (const fecha of this.diasHabiles(ahora, -30, VENTANA_DIAS)) {
      const dia = DIAS_SEMANA[new Date(`${fecha}T12:00`).getDay()];
      for (const h of this.horarios.filter((x) => x.diaSemana === dia && x.activo)) {
        for (let ini = h.horaDesde; ini < h.horaHasta; ini = sumarMinutos(ini, h.duracionTurnosMin)) {
          const fin = sumarMinutos(ini, h.duracionTurnosMin);
          const conPaciente = n++ % 3 !== 1;
          const pasado = fecha < hoy || (fecha === hoy && fin <= ya);
          // Los slots vencidos sin reservar se borran [Notion: manejo de turnos].
          if (pasado && !conPaciente) continue;

          const bloqueado = this.bloqueos.some((b) => `${fecha}T${ini}` < b.fechaHasta && `${fecha}T${fin}` > b.fechaDesde);
          let estado: EstadoTurno = EstadoTurno.DISPONIBLE;
          if (bloqueado) estado = EstadoTurno.BLOQUEADO;
          else if (pasado) estado = n % 11 === 0 ? EstadoTurno.CANCELADO : n % 13 === 0 ? EstadoTurno.AUSENTE : EstadoTurno.FINALIZADO;
          else if (conPaciente && n % 2 === 0) estado = EstadoTurno.RESERVADO;

          const ocupado = estado !== EstadoTurno.DISPONIBLE && estado !== EstadoTurno.BLOQUEADO;
          this.turnos.push({
            id: this.nuevoId(), fecha, horaInicio: ini, horaFin: fin, estado, tipoTurno: TipoTurno.CONSULTA,
            pacienteId: ocupado ? PACIENTES[n % PACIENTES.length].id : null,
            comentario: ocupado ? COMENTARIOS[n % COMENTARIOS.length] : null,
          });
        }
      }
    }

    // Las dos últimas atenciones quedan EN_CURSO: informes pendientes de completar.
    const finalizados = this.turnos.filter((t) => t.estado === EstadoTurno.FINALIZADO);
    finalizados.slice(-2).forEach((t) => (t.estado = EstadoTurno.EN_CURSO));
    for (const t of this.turnos.filter((x) => x.estado === EstadoTurno.FINALIZADO || x.estado === EstadoTurno.EN_CURSO)) {
      const finalizada = t.estado === EstadoTurno.FINALIZADO;
      this.consultas.push({
        id: this.nuevoId(), turnoId: t.id, finalizada,
        diagnostico: finalizada ? INFORME_EJEMPLO.diagnostico : null,
        planTratamiento: finalizada ? INFORME_EJEMPLO.planTratamiento : null,
        indicaciones: finalizada ? INFORME_EJEMPLO.indicaciones : null,
        adjuntos: finalizada ? [{ id: this.nuevoId(), titulo: 'InformeElectrocardiograma.pdf', url: null }] : [],
      });
    }
  }

  private generarNotificaciones(ahora: Date): void {
    const proximo = this.turnos.find((t) => t.estado === EstadoTurno.RESERVADO && t.fecha > isoLocal(ahora));
    const pendientes = this.turnos.filter((t) => t.estado === EstadoTurno.EN_CURSO).length;
    const hace = (min: number) => new Date(ahora.getTime() - min * 60_000).toISOString();
    if (proximo) {
      const p = PACIENTES.find((x) => x.id === proximo.pacienteId)!;
      this.notificaciones.push(
        { id: this.nuevoId(), turnoId: proximo.id, tipo: 'TURNO_ASIGNADO', asunto: 'Nuevo turno asignado', mensaje: `Tenés un nuevo turno con ${p.nombre} ${p.apellido}.`, fechaEnvio: hace(10), leida: false },
        { id: this.nuevoId(), turnoId: proximo.id, tipo: 'TURNO_REPROGRAMADO', asunto: 'Reprogramación de turno', mensaje: `${p.nombre} ${p.apellido} reprogramó su turno.`, fechaEnvio: hace(60), leida: false },
      );
    }
    this.notificaciones.push({ id: this.nuevoId(), turnoId: null, tipo: 'INFORME_PENDIENTE', asunto: 'Informe pendiente', mensaje: `Tenés ${pendientes} informes pendientes por completar.`, fechaEnvio: hace(60 * 24), leida: true });
  }

  /** Fechas lunes a viernes entre hoy + `desde` y hoy + `hasta` días. */
  private diasHabiles(ahora: Date, desde: number, hasta: number): string[] {
    const fechas: string[] = [];
    for (let i = desde; i <= hasta; i++) { 
      const d = sumarDias(ahora, i);
      if (d.getDay() !== 0 && d.getDay() !== 6) fechas.push(isoLocal(d));
    }
    return fechas;
  }
}

export function sumarMinutos(hora: string, minutos: number): string {
  const [h, m] = hora.split(':').map(Number);
  const total = h * 60 + m + minutos;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}
