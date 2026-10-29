export const environment = {
    production: false,
    apiUrl: 'http://127.0.0.1:8000/api',
    // true = no se llama al back para loguear: sesión simulada con ROL_SESION_SIMULADA (core/config/tokens.ts).
    // false = login real contra el back (tiene que estar levantado; CORS solo acepta http://localhost:4200).
    sesionSimulada: false,
};
