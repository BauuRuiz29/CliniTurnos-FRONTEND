/** Para buscar sin importar mayúsculas, espacios de más ni tildes. */
export function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}
