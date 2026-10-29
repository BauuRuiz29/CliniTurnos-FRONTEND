/** "lunes, 19 de octubre de 2026" a partir de yyyy-MM-dd. */
export function fechaLarga(iso: string): string {
  const [a, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(a, m - 1, d));
}

/** Años cumplidos a partir de yyyy-MM-dd. */
export function edad(fechaNacimiento: string, ahora = new Date()): number {
  const [a, m, d] = fechaNacimiento.split('-').map(Number);
  const cumplioEsteAnio = ahora.getMonth() + 1 > m || (ahora.getMonth() + 1 === m && ahora.getDate() >= d);
  return ahora.getFullYear() - a - (cumplioEsteAnio ? 0 : 1);
}

/** "17/09/2026" a partir de yyyy-MM-dd. */
export function fechaCorta(iso: string): string {
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
}

/** "Hace 10 min", "Hace 2 h", "Ayer" o la fecha corta, a partir de un ISO. */
export function haceCuanto(iso: string, ahora = new Date()): string {
  const minutos = Math.floor((ahora.getTime() - new Date(iso).getTime()) / 60_000);
  if (minutos < 1) return 'Recién';
  if (minutos < 60) return `Hace ${minutos} min`;
  if (minutos < 24 * 60) return `Hace ${Math.floor(minutos / 60)} h`;
  if (minutos < 48 * 60) return 'Ayer';
  return fechaCorta(iso.slice(0, 10));
}
