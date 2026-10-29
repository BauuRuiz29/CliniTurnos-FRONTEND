import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, switchMap } from 'rxjs';
import { API_URL } from '../../../../core/config/tokens';
import { Genero, TipoDocumento } from '../../../../core/models/enums';
import type { DatosPaciente, DatosPacienteEditables, MisDatosRepository } from './mis-datos.repository';

// GET/PATCH /users/me/ (solo lo que usa la pantalla).
interface MeDto {
  login: string;
  nombre: string;
  apellido: string;
  genero: Genero;
  paciente: {
    fecha_nacimiento: string;
    telefono: string | null;
    correo: string;
    tipo_identificacion: TipoDocumento;
    num_identificacion: string;
    grupo_sanguineo: string | null;
    contacto_emergencia_nombre: string | null;
    contacto_emergencia_numero: string | null;
    obra_social_id: number | null;
  } | null;
}

// GET /clinicos/historias-clinicas/: al paciente le devuelve solo la suya.
interface HistoriaClinicaDto {
  alergias: { id: number; descripcion: string; severidad: string | null }[];
  medicaciones: { id: number; medicamento: string; dosis: string | null; frecuencia: string | null; activo: boolean }[];
}

/** Mis datos contra la API [R03]. */
@Injectable()
export class MisDatosHttpRepository implements MisDatosRepository {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  obtener(): Observable<DatosPaciente> {
    return forkJoin({
      me: this.http.get<MeDto>(`${this.apiUrl}/users/me/`),
      historias: this.http.get<HistoriaClinicaDto[]>(`${this.apiUrl}/clinicos/historias-clinicas/`),
    }).pipe(map(({ me, historias }) => aDatosPaciente(me, historias[0] ?? null)));
  }

  // Los datos del paciente van anidados en `paciente` (así los espera /users/me/).
  guardar(d: DatosPacienteEditables): Observable<DatosPaciente> {
    const body = {
      nombre: d.nombre.trim(),
      apellido: d.apellido.trim(),
      genero: d.genero,
      paciente: {
        fecha_nacimiento: d.fechaNacimiento,
        telefono: d.telefono.trim(),
        correo: d.correo.trim(),
        grupo_sanguineo: d.grupoSanguineo,
        contacto_emergencia_nombre: d.contactoEmergenciaNombre,
        contacto_emergencia_numero: d.contactoEmergenciaNumero,
        obra_social_id: d.obraSocialId,
      },
    };
    return this.http.patch(`${this.apiUrl}/users/me/`, body).pipe(switchMap(() => this.obtener()));
  }
}

function aDatosPaciente(me: MeDto, historia: HistoriaClinicaDto | null): DatosPaciente {
  const p = me.paciente;
  if (!p) throw new Error('El usuario no tiene datos de paciente');
  return {
    nombre: me.nombre,
    apellido: me.apellido,
    genero: me.genero,
    tipoIdentificacion: p.tipo_identificacion,
    numIdentificacion: p.num_identificacion,
    fechaNacimiento: p.fecha_nacimiento,
    telefono: p.telefono ?? '',
    correo: p.correo,
    login: me.login,
    obraSocialId: p.obra_social_id,
    grupoSanguineo: p.grupo_sanguineo,
    contactoEmergenciaNombre: p.contacto_emergencia_nombre,
    contactoEmergenciaNumero: p.contacto_emergencia_numero,
    alergias: (historia?.alergias ?? []).map(({ id, descripcion, severidad }) => ({ id, descripcion, severidad })),
    medicaciones: (historia?.medicaciones ?? [])
      .filter((m) => m.activo)
      .map(({ id, medicamento, dosis, frecuencia }) => ({ id, medicamento, dosis, frecuencia })),
  };
}
