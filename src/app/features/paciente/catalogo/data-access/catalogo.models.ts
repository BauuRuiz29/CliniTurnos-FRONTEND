// Modelos de dominio del catálogo. Especialidad y Profesional ya están alineados con la API.
// TODO: TipoEstudio sigue el maquetado (el back no tiene categoría ni preparación).

export interface Especialidad {
  id: number;
  nombre: string;
  descripcion: string;
}

/** Un profesional puede tener varias especialidades (`profesional_especialidades`). */
export interface Profesional {
  id: number;
  nombre: string;
  apellido: string;
  especialidades: Pick<Especialidad, 'id' | 'nombre'>[];
}

/** Estudio que se puede solicitar (catálogo), no el estudio de un paciente. */
export interface TipoEstudio {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  preparacion: string | null;
}
