// Modelos de dominio del catálogo, alineados con la API.

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
  duracionMin: number | null; // tipos_estudio.duracion_min
}
