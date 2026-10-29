import { EstadoTurno } from './enums';

// Agenda de un profesional: lo que se necesita para elegir una franja (reservar o reprogramar).

// El enum del DER hoy va de LUNES a VIERNES; el front acepta cualquier día que traiga horarios_medico.
export type DiaSemana = 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO' | 'DOMINGO';

// Tabla `horarios_medico` (solo las filas activas).
export interface HorarioMedico {
  diaSemana: DiaSemana;
  horaDesde: string; // HH:mm
  horaHasta: string; // HH:mm
  duracionTurnosMin: number;
}

// Tabla `fechas_bloqueadas`: puede cubrir unas horas o días enteros.
export interface FechaBloqueada {
  fechaDesde: string; // yyyy-MM-ddTHH:mm
  fechaHasta: string; // yyyy-MM-ddTHH:mm
  motivo: string | null;
}

// Fila pregenerada de `turnos` (ventana de ~30 días).
export interface Slot {
  turnoId: number;
  fecha: string; // yyyy-MM-dd
  horaInicio: string; // HH:mm
  horaFin: string; // HH:mm
  estado: EstadoTurno;
}

export interface Disponibilidad {
  horarios: HorarioMedico[];
  bloqueos: FechaBloqueada[];
  slots: Slot[];
}
