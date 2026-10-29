import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_URL } from '../config/tokens';
import { Notificacion, TipoNotificacion } from '../models/notificacion';

interface NotificacionDto {
  id: number;
  turno: number | null;
  tipo: TipoNotificacion;
  asunto: string;
  mensaje: string;
  estado: 'PROGRAMADA' | 'PENDIENTE' | 'ENVIADA' | 'FALLIDA' | 'CANCELADA';
  fecha_programada: string;
  fecha_envio: string | null;
}

/**
 * Notificaciones del usuario de la sesión, para paciente y profesional [R09, R15, R17, R18].
 * El back ya filtra por usuario [Rnf 01]. No tiene "leída".
 */
@Injectable({ providedIn: 'root' })
export class NotificacionesRepository {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  listar(): Observable<Notificacion[]> {
    return this.http.get<NotificacionDto[]>(`${this.apiUrl}/notificaciones/notificaciones/`).pipe(
      // FALLIDA también se muestra: el aviso existe aunque no haya salido el mail (los médicos no tienen correo).
      map((dtos) => dtos.filter((d) => d.estado !== 'CANCELADA').map(aNotificacion)),
    );
  }
}

function aNotificacion(dto: NotificacionDto): Notificacion {
  return {
    id: dto.id,
    turnoId: dto.turno,
    tipo: dto.tipo,
    asunto: dto.asunto,
    mensaje: dto.mensaje,
    fecha: dto.fecha_envio ?? dto.fecha_programada,
  };
}
