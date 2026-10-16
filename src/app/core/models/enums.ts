// Valores alineados con la base de datos (db-cliniturnos).
// Valores siempre fijos 

export const Rol = {
  PACIENTE: 'PACIENTE',
  MEDICO: 'MEDICO',
  ADMIN: 'ADMIN',
} as const;
export type Rol = (typeof Rol)[keyof typeof Rol];

export const EstadoTurno = {
  DISPONIBLE: 'DISPONIBLE',
  BLOQUEADO: 'BLOQUEADO',
  RESERVADO: 'RESERVADO',
  EN_CURSO: 'EN_CURSO',
  FINALIZADO: 'FINALIZADO',
  CANCELADO: 'CANCELADO',
  AUSENTE: 'AUSENTE',
} as const;
export type EstadoTurno = (typeof EstadoTurno)[keyof typeof EstadoTurno];

export const TipoTurno = {
  CONSULTA: 'CONSULTA',
  ESTUDIO: 'ESTUDIO',
} as const;
export type TipoTurno = (typeof TipoTurno)[keyof typeof TipoTurno];

export const EstadoEstudio = {
  SOLICITADO: 'SOLICITADO',
  REALIZADO: 'REALIZADO',
  INFORMADO: 'INFORMADO',
  CANCELADO: 'CANCELADO',
} as const;
export type EstadoEstudio = (typeof EstadoEstudio)[keyof typeof EstadoEstudio];

export const EstadoNotificacion = {
  PENDIENTE: 'PENDIENTE',
  ENVIADA: 'ENVIADA',
  FALLIDA: 'FALLIDA',
  CANCELADA: 'CANCELADA',
} as const;
export type EstadoNotificacion = (typeof EstadoNotificacion)[keyof typeof EstadoNotificacion];

export const Genero = {
  FEMENINO: 'FEMENINO',
  MASCULINO: 'MASCULINO',
  NO_BINARIO: 'NO_BINARIO',
  PREFIERO_NO_DECIRLO: 'PREFIERO_NO_DECIRLO',
} as const;
export type Genero = (typeof Genero)[keyof typeof Genero];

export const TipoDocumento = {
  DNI: 'DNI',
  PASAPORTE: 'PASAPORTE',
} as const;
export type TipoDocumento = (typeof TipoDocumento)[keyof typeof TipoDocumento];
