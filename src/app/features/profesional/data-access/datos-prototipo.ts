//#region DATOS FORZADOS
// TODO Fase B: reemplazar por repositorios (interfaz + mock) con los estados reales de la base.
// Son los mismos datos que tenía el prototipo estático del profesional.

export type EstadoTurnoPrototipo = 'Pendiente' | 'Confirmado';

export interface TurnoAgenda {
  id: number;
  dia: number;
  mes: string;
  hora: string;
  nombre: string;
  dni: string;
  telefono: string;
  tipo: string;
  estado: EstadoTurnoPrototipo;
  motivo: string;
  obraSocial: string;
  email: string;
  edad: number;
  notas: string;
}

export interface PacienteAsignado {
  nombre: string;
  dni: string;
  telefono: string;
  fecha: string;
  iniciales: string;
}

export interface HorarioAtencion {
  dia: string;
  desde: string;
  hasta: string;
  duracion: number;
  activo: boolean;
}

export interface NotificacionProfesional {
  id: number;
  icono: 'calendar' | 'clock' | 'file';
  titulo: string;
  texto: string;
  tiempo: string;
  leida: boolean;
}

export const PROFESIONAL = {
  nombre: 'Dr. Juan García',
  nombreCompleto: 'Juan García',
  dni: '12.234.456',
  fechaNacimiento: '13/12/1989',
  sexo: 'Masculino',
  especialidad: 'Cardiología',
  subespecialidad: '-',
  matricula: 'MN 123456',
  telefono: '+54 9 11 2345-5678',
  telefonoAlternativo: '+54 9 11 2345-5679',
  email: 'jgarcia@cliniturnos.com',
  direccion: 'Calle falsa 123',
  ciudad: 'Campana',
};

export const RESUMEN_HOY = { turnos: 8, informesPendientes: 2 };

export const TURNOS: TurnoAgenda[] = [
  { id: 1, dia: 21, mes: 'MAY.', hora: '10:30', nombre: 'María López', dni: '28.123.456', telefono: '11 2345 6789', tipo: 'Cardiología', estado: 'Pendiente', motivo: 'Control anual', obraSocial: 'OSDE 210', email: 'marialopez@email.com', edad: 35, notas: 'Siento molestias leves en el pecho desde hace unos días.' },
  { id: 2, dia: 21, mes: 'MAY.', hora: '11:15', nombre: 'Pedro Martínez', dni: '31.987.654', telefono: '11 9876 5432', tipo: 'Primera vez', estado: 'Pendiente', motivo: 'Primera consulta', obraSocial: 'Swiss Medical', email: 'pedro@email.com', edad: 42, notas: 'Primera consulta con el profesional.' },
  { id: 3, dia: 21, mes: 'MAY.', hora: '12:00', nombre: 'Ana Fernández', dni: '27.654.321', telefono: '11 4567 8910', tipo: 'Control', estado: 'Pendiente', motivo: 'Control periódico', obraSocial: 'OSDE 210', email: 'ana@email.com', edad: 31, notas: 'Control de rutina.' },
  { id: 4, dia: 21, mes: 'MAY.', hora: '14:30', nombre: 'Luis Rodríguez', dni: '29.876.543', telefono: '11 3456 7890', tipo: 'Control', estado: 'Pendiente', motivo: 'Seguimiento', obraSocial: 'Galeno', email: 'luis@email.com', edad: 38, notas: 'Seguimiento de tratamiento.' },
  { id: 5, dia: 22, mes: 'MAY.', hora: '09:00', nombre: 'Julia Gómez', dni: '33.456.789', telefono: '11 6789 0123', tipo: 'Control', estado: 'Confirmado', motivo: 'Control anual', obraSocial: 'OSDE 210', email: 'julia@email.com', edad: 29, notas: 'Sin observaciones.' },
];

export const PACIENTES: PacienteAsignado[] = [
  { nombre: 'María López', dni: '28.123.456', telefono: '11 2345 6789', fecha: '21/05/2024', iniciales: 'ML' },
  { nombre: 'Pedro Martínez', dni: '31.987.654', telefono: '11 9876 5432', fecha: '21/05/2024', iniciales: 'PM' },
  { nombre: 'Ana Fernández', dni: '27.654.321', telefono: '11 4567 8910', fecha: '21/05/2024', iniciales: 'AF' },
  { nombre: 'Luis Rodríguez', dni: '29.876.543', telefono: '11 3456 7890', fecha: '20/05/2024', iniciales: 'LR' },
  { nombre: 'Julia Gómez', dni: '33.456.789', telefono: '11 6789 0123', fecha: '20/05/2024', iniciales: 'JG' },
];

export const HORARIOS: HorarioAtencion[] = [
  { dia: 'Martes', desde: '08:00', hasta: '09:00', duracion: 60, activo: true },
  { dia: 'Martes', desde: '09:00', hasta: '10:00', duracion: 60, activo: true },
  { dia: 'Martes', desde: '10:00', hasta: '11:00', duracion: 60, activo: true },
  { dia: 'Martes', desde: '11:00', hasta: '12:00', duracion: 60, activo: false },
  { dia: 'Martes', desde: '14:00', hasta: '15:00', duracion: 60, activo: true },
  { dia: 'Martes', desde: '15:00', hasta: '16:00', duracion: 60, activo: true },
  { dia: 'Martes', desde: '16:00', hasta: '17:00', duracion: 60, activo: false },
];

export const NOTIFICACIONES: NotificacionProfesional[] = [
  { id: 1, icono: 'calendar', titulo: 'Nuevo turno asignado', texto: 'Tenés un nuevo turno con María López para el 21/05/2024 a las 10:30 hs.', tiempo: 'Hace 10 min', leida: false },
  { id: 2, icono: 'clock', titulo: 'Reprogramación de turno', texto: 'Pedro Martínez reprogramó el turno del 21/05/2024 a las 11:15 hs.', tiempo: 'Hace 1 h', leida: false },
  { id: 3, icono: 'file', titulo: 'Informe pendiente', texto: 'Tenés 2 informes pendientes por completar.', tiempo: 'Hace 2 h', leida: true },
];
//#endregion

export function iniciales(nombre: string): string {
  return nombre
    .split(' ')
    .map((palabra) => palabra[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
