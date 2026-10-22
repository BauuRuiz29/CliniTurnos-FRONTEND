/** "lunes, 19 de octubre de 2026" a partir de yyyy-MM-dd. */
export function fechaLarga(iso: string): string {
  const [a, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(a, m - 1, d));
}
