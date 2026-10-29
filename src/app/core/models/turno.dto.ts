import { EstadoTurno } from './enums';

// Respuesta de /turnos/turnos/ (TurnoSerializer del back). La comparten paciente y profesional.
export interface TurnoDto {
  id: number;
  paciente: number | null;
  paciente_nombre: string | null;
  profesional: number | null;
  profesional_nombre: string | null;
  especialidad: number | null;
  especialidad_nombre: string | null;
  tipo_turno: 'CONSULTA' | 'ESTUDIO';
  fecha: string; // yyyy-MM-dd
  estado: EstadoTurno;
  fecha_hora_inicio: string; // HH:mm:ss
  fecha_hora_fin: string; // HH:mm:ss
  comentario: string | null;
}

/** "09:30:00" → "09:30". */
export function horaCorta(hora: string): string {
  return hora.slice(0, 5);
}
