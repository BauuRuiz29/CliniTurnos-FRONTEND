// Modelos de dominio del catálogo. Campos tomados del maquetado:
// TODO: alinear nombres y tipos con db-cliniturnos cuando se conecte el back.

export interface Especialidad {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface Profesional {
  id: number;
  titulo: "Dr." | "Dra."; 
  nombre: string;
  apellido: string;
  especialidadId: number;
  especialidad: string;
}

/** Estudio que se puede solicitar (catálogo), no el estudio de un paciente. */
export interface TipoEstudio {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  preparacion: string | null;
}
