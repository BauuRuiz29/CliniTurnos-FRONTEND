// Tablas `alergias` y `medicaciones_habituales` de la historia clínica. Las cargan médicos o admin.
export interface Alergia {
  id: number;
  descripcion: string;
  severidad: string | null;
}

export interface Medicacion {
  id: number;
  medicamento: string;
  dosis: string | null;
  frecuencia: string | null;
}

// Valores conocidos para mostrar; en el back la severidad es texto libre.
const TEXTO_SEVERIDAD: Record<string, string> = { LEVE: 'Leve', MODERADA: 'Moderada', GRAVE: 'Grave' };

export const SEVERIDADES = Object.entries(TEXTO_SEVERIDAD).map(([valor, texto]) => ({ valor, texto }));

export function textoSeveridad(severidad: string | null): string {
  if (!severidad) return 'No especificada';
  return TEXTO_SEVERIDAD[severidad] ?? severidad;
}
