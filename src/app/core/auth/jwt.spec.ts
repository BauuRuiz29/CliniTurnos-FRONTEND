import { decodificarJwt, jwtVencido } from './jwt';

const base64Url = (obj: object) =>
  btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const crearToken = (payload: object) => `${base64Url({ alg: 'HS256' })}.${base64Url(payload)}.firma`;

describe('jwt', () => {
  it('lee exp del payload', () => {
    expect(decodificarJwt(crearToken({ exp: 100, user_id: '3' }))).toEqual({ exp: 100 });
  });

  it('devuelve null si el token está mal formado', () => {
    expect(decodificarJwt('no-es-un-jwt')).toBeNull();
    expect(decodificarJwt('a.%%%.c')).toBeNull();
  });

  it('detecta tokens vencidos', () => {
    expect(jwtVencido({ exp: 100 }, 100_000)).toBe(true);
    expect(jwtVencido({ exp: 200 }, 100_000)).toBe(false);
    expect(jwtVencido({}, 100_000)).toBe(false);
  });
});
