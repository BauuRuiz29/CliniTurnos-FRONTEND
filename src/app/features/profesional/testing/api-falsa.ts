import { TurnoDto } from '../../../core/models/turno.dto';
import { ConsultaDto, PacienteDto } from '../data-access/profesional-api';

// Respuestas de la API para los specs de los repositorios HTTP del área profesional.

export const API = 'http://api.test/api';

export const turnoDto = (extra: Partial<TurnoDto> = {}): TurnoDto => ({
  id: 13, paciente: 8, paciente_nombre: 'Ana Álvarez', profesional: 1, profesional_nombre: 'Juan Manuel García',
  especialidad: 2, especialidad_nombre: 'Cardiología', tipo_turno: 'CONSULTA', fecha: '2026-11-03', estado: 'RESERVADO',
  fecha_hora_inicio: '09:00:00', fecha_hora_fin: '09:30:00', comentario: 'Control', ...extra,
});

export const pacienteDto = (extra: Partial<PacienteDto> = {}): PacienteDto => ({
  id: 8, usuario: { nombre: 'Ana', apellido: 'Álvarez' }, obra_social: { nombre: 'OSDE 210' }, fecha_nacimiento: '1992-03-04',
  telefono: '11 4497 6577', correo: 'ana@example.com', tipo_identificacion: 'DNI', num_identificacion: '44976577', ...extra,
});

export const consultaDto = (extra: Partial<ConsultaDto> = {}): ConsultaDto => ({
  id: 3, turno: 13, diagnostico: null, plan_tratamiento: null, indicaciones: null, estado: 'EN_CURSO', ...extra,
});
