import { Rol } from '../models/enums';
import { rutaInicio } from './inicio-por-rol';

describe('rutaInicio', () => {
  it('lleva cada rol a su área', () => {
    expect(rutaInicio(Rol.PACIENTE)).toBe('/paciente');
    expect(rutaInicio(Rol.MEDICO)).toBe('/profesional');
    expect(rutaInicio(Rol.ADMIN)).toBe('/administrador');
  });

  it('sin rol vuelve a la home', () => {
    expect(rutaInicio(null)).toBe('/');
  });
});
