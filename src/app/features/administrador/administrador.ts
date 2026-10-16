
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

type Seccion =
  | 'dashboard'
  | 'profesionales'
  | 'especialidades'
  | 'usuarios'
  | 'turnos'
  | 'informes'
  | 'notificaciones'
  | 'reportes';

interface Profesional {
  id: number;
  nombre: string;
  especialidad: string;
  email: string;
  telefono: string;
  activo: boolean;
}

interface Especialidad {
  id: number;
  nombre: string;
  descripcion: string;
  profesionales: number;
  activo: boolean;
}

interface Usuario {
  id: number;
  nombre: string;
  rol: string;
  email: string;
  telefono: string;
  activo: boolean;
}

interface Turno {
  id: number;
  fecha: string;
  paciente: string;
  profesional: string;
  especialidad: string;
  estado: string;
}

interface Informe {
  id: number;
  fecha: string;
  paciente: string;
  profesional: string;
  especialidad: string;
  estado: string;
}

interface Notificacion {
  id: number;
  titulo: string;
  tipo: string;
  publico: string;
  fecha: string;
  estado: string;
}

@Component({
  selector: 'app-administrador',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './administrador.html',
  styleUrl: './administrador.scss'
})
export class AdministradorComponent {
  seccionActual: Seccion = 'dashboard';

  menu = [
    { id: 'dashboard' as Seccion, nombre: 'Dashboard', icono: '▦' },
    { id: 'profesionales' as Seccion, nombre: 'Profesionales', icono: '♙' },
    { id: 'especialidades' as Seccion, nombre: 'Especialidades', icono: '✚' },
    { id: 'usuarios' as Seccion, nombre: 'Usuarios', icono: '♧' },
    { id: 'turnos' as Seccion, nombre: 'Turnos', icono: '▣' },
    { id: 'informes' as Seccion, nombre: 'Informes médicos', icono: '▤' },
    { id: 'notificaciones' as Seccion, nombre: 'Notificaciones', icono: '♧' },
    { id: 'reportes' as Seccion, nombre: 'Reportes', icono: '◉' }
  ];

  titulos: Record<Seccion, string> = {
    dashboard: '¡Bienvenido, Administrador! 👋',
    profesionales: 'Profesionales',
    especialidades: 'Especialidades',
    usuarios: 'Usuarios',
    turnos: 'Turnos',
    informes: 'Informes médicos',
    notificaciones: 'Notificaciones',
    reportes: 'Reportes y estadísticas'
  };

  descripciones: Record<Seccion, string> = {
    dashboard: 'Resumen general del sistema',
    profesionales: 'Gestioná los profesionales del centro',
    especialidades: 'Gestioná las especialidades disponibles',
    usuarios: 'Gestioná los usuarios del sistema',
    turnos: 'Visualizá y gestioná todos los turnos',
    informes: 'Accedé y gestioná los informes médicos',
    notificaciones: 'Enviá notificaciones a usuarios',
    reportes: 'Consultá estadísticas y generá reportes'
  };

  profesionales: Profesional[] = [
    { id: 1, nombre: 'Dr. Juan García', especialidad: 'Cardiología', email: 'juan.garcia@clinica.com', telefono: '11 2345 6789', activo: true },
    { id: 2, nombre: 'Dra. Ana Fernández', especialidad: 'Dermatología', email: 'ana.fernandez@clinica.com', telefono: '11 9876 5432', activo: true },
    { id: 3, nombre: 'Dr. Pablo Sánchez', especialidad: 'Traumatología', email: 'pablo.sanchez@clinica.com', telefono: '11 4567 8910', activo: true },
    { id: 4, nombre: 'Dra. María López', especialidad: 'Neurología', email: 'maria.lopez@clinica.com', telefono: '11 3456 7890', activo: true },
    { id: 5, nombre: 'Dr. Pedro Martínez', especialidad: 'Oftalmología', email: 'pedro.martinez@clinica.com', telefono: '11 6789 0123', activo: false },
    { id: 6, nombre: 'Dra. Laura Pérez', especialidad: 'Pediatría', email: 'laura.perez@clinica.com', telefono: '11 5623 9012', activo: true }
  ];

  especialidades: Especialidad[] = [
    { id: 1, nombre: 'Cardiología', descripcion: 'Especialidad encargada del estudio y tratamiento del corazón y vasos sanguíneos.', profesionales: 4, activo: true },
    { id: 2, nombre: 'Dermatología', descripcion: 'Diagnóstico y tratamiento de enfermedades de la piel, cabello y uñas.', profesionales: 3, activo: true },
    { id: 3, nombre: 'Traumatología', descripcion: 'Lesiones y enfermedades del sistema musculoesquelético.', profesionales: 4, activo: true },
    { id: 4, nombre: 'Neurología', descripcion: 'Trata enfermedades del sistema nervioso y cerebro.', profesionales: 2, activo: true },
    { id: 5, nombre: 'Pediatría', descripcion: 'Atención médica integral de niños y adolescentes.', profesionales: 3, activo: true },
    { id: 6, nombre: 'Laboratorio', descripcion: 'Estudios de análisis clínicos y laboratoriales.', profesionales: 2, activo: true }
  ];

  usuarios: Usuario[] = [
    { id: 1, nombre: 'Administrador', rol: 'Administrador', email: 'admin@clinica.com', telefono: '11 1234 5678', activo: true },
    { id: 2, nombre: 'Dr. Juan García', rol: 'Profesional', email: 'juan.garcia@clinica.com', telefono: '11 2345 6789', activo: true },
    { id: 3, nombre: 'María López', rol: 'Paciente', email: 'maria.lopez@email.com', telefono: '11 3456 7890', activo: true },
    { id: 4, nombre: 'Recepcionista', rol: 'Recepcionista', email: 'recepcion@clinica.com', telefono: '11 4567 8901', activo: true },
    { id: 5, nombre: 'Pedro Martínez', rol: 'Profesional', email: 'pedro.martinez@clinica.com', telefono: '11 5678 9012', activo: false },
    { id: 6, nombre: 'Laura Gómez', rol: 'Paciente', email: 'laura.gomez@email.com', telefono: '11 7890 1234', activo: true }
  ];

  turnos: Turno[] = [
    { id: 1, fecha: '21/05/2024 10:30', paciente: 'María López', profesional: 'Dr. Juan García', especialidad: 'Cardiología', estado: 'Confirmado' },
    { id: 2, fecha: '21/05/2024 11:15', paciente: 'Pedro Martínez', profesional: 'Dra. Ana Fernández', especialidad: 'Dermatología', estado: 'Confirmado' },
    { id: 3, fecha: '21/05/2024 12:00', paciente: 'Ana Fernández', profesional: 'Dr. Pablo Sánchez', especialidad: 'Traumatología', estado: 'Pendiente' },
    { id: 4, fecha: '21/05/2024 14:30', paciente: 'Luis Rodríguez', profesional: 'Dra. María López', especialidad: 'Neurología', estado: 'Confirmado' },
    { id: 5, fecha: '21/05/2024 16:00', paciente: 'Julia Gómez', profesional: 'Dr. Pedro Martínez', especialidad: 'Oftalmología', estado: 'Reprogramado' }
  ];

  informes: Informe[] = [
    { id: 1, fecha: '20/05/2024', paciente: 'María López', profesional: 'Dr. Juan García', especialidad: 'Cardiología', estado: 'Completado' },
    { id: 2, fecha: '20/05/2024', paciente: 'Pedro Martínez', profesional: 'Dra. Ana Fernández', especialidad: 'Dermatología', estado: 'Completado' },
    { id: 3, fecha: '19/05/2024', paciente: 'Ana Fernández', profesional: 'Dr. Pablo Sánchez', especialidad: 'Traumatología', estado: 'Completado' },
    { id: 4, fecha: '19/05/2024', paciente: 'Luis Rodríguez', profesional: 'Dra. María López', especialidad: 'Neurología', estado: 'Completado' },
    { id: 5, fecha: '18/05/2024', paciente: 'Julia Gómez', profesional: 'Dr. Pedro Martínez', especialidad: 'Oftalmología', estado: 'Completado' }
  ];

  notificaciones: Notificacion[] = [
    { id: 1, titulo: 'Recordatorio de turno (48hs)', tipo: 'Recordatorio', publico: 'Pacientes', fecha: '21/05/2024 08:00', estado: 'Enviada' },
    { id: 2, titulo: 'Nuevo profesional disponible', tipo: 'Informativa', publico: 'Pacientes', fecha: '20/05/2024 10:30', estado: 'Enviada' },
    { id: 3, titulo: 'Reprogramación de turno', tipo: 'Alerta', publico: 'Pacientes', fecha: '20/05/2024 09:15', estado: 'Enviada' },
    { id: 4, titulo: 'Mantenimiento programado', tipo: 'Informativa', publico: 'Todos', fecha: '19/05/2024 18:00', estado: 'Programada' },
    { id: 5, titulo: 'Nuevo informe disponible', tipo: 'Informativa', publico: 'Pacientes', fecha: '19/05/2024 14:20', estado: 'Enviada' }
  ];

  busqueda = '';
  filtroEstado = 'Todos';
  filtroRol = 'Todos';
  filtroTab = 'Todos';
  pagina = 1;
  elementosPorPagina = 6;

  modalAbierto = false;
  tipoModal: 'profesional' | 'especialidad' | 'usuario' | 'turno' | 'notificacion' = 'profesional';
  idEdicion: number | null = null;

  mensaje = '';
  mostrarMensaje = false;

  nuevo: any = {};
  notificacionesNoLeidas = 1;

  constructor() {
    this.limpiarFormulario();
  }

  navegar(seccion: Seccion): void {
    this.seccionActual = seccion;
    this.busqueda = '';
    this.filtroEstado = 'Todos';
    this.filtroTab = 'Todos';
    this.pagina = 1;
    this.modalAbierto = false;
  }

  limpiarFormulario(): void {
    this.nuevo = {
      nombre: '',
      especialidad: 'Cardiología',
      email: '',
      telefono: '',
      descripcion: '',
      rol: 'Paciente',
      activo: true,
      fecha: '',
      paciente: '',
      profesional: '',
      estado: 'Pendiente',
      titulo: '',
      tipo: 'Informativa',
      publico: 'Todos'
    };
  }

  abrirNuevo(tipo: 'profesional' | 'especialidad' | 'usuario' | 'turno' | 'notificacion'): void {
    this.tipoModal = tipo;
    this.idEdicion = null;
    this.limpiarFormulario();

    if (tipo === 'turno') {
      this.nuevo.profesional = this.profesionales[0]?.nombre ?? '';
      this.nuevo.fecha = '2024-05-22T10:00';
    }

    this.modalAbierto = true;
  }

  editar(tipo: 'profesional' | 'especialidad' | 'usuario' | 'turno' | 'notificacion', item: any): void {
    this.tipoModal = tipo;
    this.idEdicion = item.id;
    this.nuevo = { ...item };
    this.modalAbierto = true;
  }

  guardar(): void {
    if (this.tipoModal === 'profesional') {
      if (!this.nuevo.nombre.trim() || !this.nuevo.email.trim()) {
        this.notificar('Completá el nombre y el email del profesional.');
        return;
      }

      const item: Profesional = {
        id: this.idEdicion ?? this.siguienteId(this.profesionales),
        nombre: this.nuevo.nombre,
        especialidad: this.nuevo.especialidad,
        email: this.nuevo.email,
        telefono: this.nuevo.telefono,
        activo: this.nuevo.activo ?? true
      };

      this.guardarEnLista(this.profesionales, item);
      this.recalcularProfesionales();
    }

    if (this.tipoModal === 'especialidad') {
      if (!this.nuevo.nombre.trim()) {
        this.notificar('Ingresá el nombre de la especialidad.');
        return;
      }

      const item: Especialidad = {
        id: this.idEdicion ?? this.siguienteId(this.especialidades),
        nombre: this.nuevo.nombre,
        descripcion: this.nuevo.descripcion,
        profesionales: this.idEdicion
          ? this.especialidades.find(x => x.id === this.idEdicion)?.profesionales ?? 0
          : 0,
        activo: this.nuevo.activo ?? true
      };

      this.guardarEnLista(this.especialidades, item);
    }

    if (this.tipoModal === 'usuario') {
      if (!this.nuevo.nombre.trim() || !this.nuevo.email.trim()) {
        this.notificar('Completá el nombre y el email del usuario.');
        return;
      }

      const item: Usuario = {
        id: this.idEdicion ?? this.siguienteId(this.usuarios),
        nombre: this.nuevo.nombre,
        rol: this.nuevo.rol,
        email: this.nuevo.email,
        telefono: this.nuevo.telefono,
        activo: this.nuevo.activo ?? true
      };

      this.guardarEnLista(this.usuarios, item);
    }

    if (this.tipoModal === 'turno') {
      if (!this.nuevo.paciente.trim() || !this.nuevo.profesional) {
        this.notificar('Completá el paciente y el profesional.');
        return;
      }

      const item: Turno = {
        id: this.idEdicion ?? this.siguienteId(this.turnos),
        fecha: this.nuevo.fecha || '22/05/2024 10:00',
        paciente: this.nuevo.paciente,
        profesional: this.nuevo.profesional,
        especialidad: this.nuevo.especialidad,
        estado: this.nuevo.estado
      };

      this.guardarEnLista(this.turnos, item);
    }

    if (this.tipoModal === 'notificacion') {
      if (!this.nuevo.titulo.trim()) {
        this.notificar('Escribí el título de la notificación.');
        return;
      }

      const item: Notificacion = {
        id: this.idEdicion ?? this.siguienteId(this.notificaciones),
        titulo: this.nuevo.titulo,
        tipo: this.nuevo.tipo,
        publico: this.nuevo.publico,
        fecha: this.nuevo.fecha || '22/05/2024 09:00',
        estado: this.nuevo.estado || 'Programada'
      };

      this.guardarEnLista(this.notificaciones, item);
    }

    this.modalAbierto = false;
    this.notificar(this.idEdicion ? 'Registro actualizado correctamente.' : 'Registro creado correctamente.');
  }

  private guardarEnLista<T extends { id: number }>(lista: T[], item: T): void {
    const indice = lista.findIndex(x => x.id === item.id);

    if (indice >= 0) {
      lista[indice] = item;
    } else {
      lista.unshift(item);
    }
  }

  private siguienteId(lista: { id: number }[]): number {
    return lista.length ? Math.max(...lista.map(x => x.id)) + 1 : 1;
  }

  private recalcularProfesionales(): void {
    this.especialidades.forEach(especialidad => {
      especialidad.profesionales = this.profesionales.filter(
        profesional =>
          profesional.especialidad === especialidad.nombre && profesional.activo
      ).length;
    });
  }

  eliminar(tipo: 'profesional' | 'especialidad' | 'usuario' | 'turno' | 'informe' | 'notificacion', id: number): void {
    if (!confirm('¿Querés eliminar este registro?')) {
      return;
    }

    if (tipo === 'profesional') {
      this.profesionales = this.profesionales.filter(x => x.id !== id);
      this.recalcularProfesionales();
    }

    if (tipo === 'especialidad') {
      this.especialidades = this.especialidades.filter(x => x.id !== id);
    }

    if (tipo === 'usuario') {
      this.usuarios = this.usuarios.filter(x => x.id !== id);
    }

    if (tipo === 'turno') {
      this.turnos = this.turnos.filter(x => x.id !== id);
    }

    if (tipo === 'informe') {
      this.informes = this.informes.filter(x => x.id !== id);
    }

    if (tipo === 'notificacion') {
      this.notificaciones = this.notificaciones.filter(x => x.id !== id);
    }

    this.notificar('Registro eliminado.');
  }

  cambiarEstado(item: { activo: boolean }): void {
    item.activo = !item.activo;
    this.notificar(item.activo ? 'Registro activado.' : 'Registro desactivado.');
  }

  cambiarEstadoTurno(turno: Turno): void {
    const estados = ['Pendiente', 'Confirmado', 'Reprogramado', 'Cancelado'];
    const indice = estados.indexOf(turno.estado);
    turno.estado = estados[(indice + 1) % estados.length];
  }

  get profesionalesFiltrados(): Profesional[] {
    const q = this.busqueda.toLowerCase().trim();

    return this.profesionales.filter(p =>
      `${p.nombre} ${p.especialidad} ${p.email}`.toLowerCase().includes(q) &&
      (this.filtroEstado === 'Todos' ||
        (this.filtroEstado === 'Activo' && p.activo) ||
        (this.filtroEstado === 'Inactivo' && !p.activo))
    );
  }

  get especialidadesFiltradas(): Especialidad[] {
    const q = this.busqueda.toLowerCase().trim();

    return this.especialidades.filter(e =>
      `${e.nombre} ${e.descripcion}`.toLowerCase().includes(q) &&
      (this.filtroEstado === 'Todos' ||
        (this.filtroEstado === 'Activo' && e.activo) ||
        (this.filtroEstado === 'Inactivo' && !e.activo))
    );
  }

  get usuariosFiltrados(): Usuario[] {
    const q = this.busqueda.toLowerCase().trim();

    return this.usuarios.filter(u =>
      `${u.nombre} ${u.email} ${u.rol}`.toLowerCase().includes(q) &&
      (this.filtroRol === 'Todos' || u.rol === this.filtroRol) &&
      (this.filtroEstado === 'Todos' ||
        (this.filtroEstado === 'Activo' && u.activo) ||
        (this.filtroEstado === 'Inactivo' && !u.activo))
    );
  }

  get turnosFiltrados(): Turno[] {
    const q = this.busqueda.toLowerCase().trim();

    return this.turnos.filter(t =>
      `${t.paciente} ${t.profesional} ${t.especialidad} ${t.estado}`.toLowerCase().includes(q) &&
      (this.filtroTab === 'Todos' || t.estado === this.filtroTab)
    );
  }

  get informesFiltrados(): Informe[] {
    const q = this.busqueda.toLowerCase().trim();

    return this.informes.filter(i =>
      `${i.paciente} ${i.profesional} ${i.especialidad}`.toLowerCase().includes(q) &&
      (this.filtroTab === 'Todos' || i.estado === this.filtroTab)
    );
  }

  get notificacionesFiltradas(): Notificacion[] {
    const q = this.busqueda.toLowerCase().trim();

    return this.notificaciones.filter(n =>
      `${n.titulo} ${n.tipo} ${n.publico}`.toLowerCase().includes(q) &&
      (this.filtroTab === 'Todos' ||
        (this.filtroTab === 'Enviadas' && n.estado === 'Enviada') ||
        (this.filtroTab === 'Programadas' && n.estado === 'Programada'))
    );
  }

  get turnosConfirmados(): number {
    return this.turnos.filter(t => t.estado === 'Confirmado').length;
  }

  get turnosPendientes(): number {
    return this.turnos.filter(t => t.estado === 'Pendiente').length;
  }

  get turnosCancelados(): number {
    return this.turnos.filter(t => t.estado === 'Cancelado').length;
  }

  get turnosReprogramados(): number {
    return this.turnos.filter(t => t.estado === 'Reprogramado').length;
  }

  get totalInformes(): number {
    return this.informes.length;
  }

  get profesionalesActivos(): number {
    return this.profesionales.filter(p => p.activo).length;
  }

  get pacientesRegistrados(): number {
    return this.usuarios.filter(u => u.rol === 'Paciente').length;
  }

  get usuariosActivos(): number {
    return this.usuarios.filter(u => u.activo).length;
  }

  get porcentajeConfirmados(): number {
    return this.turnos.length
      ? Math.round((this.turnosConfirmados / this.turnos.length) * 100)
      : 0;
  }

  get porcionesEstados(): { nombre: string; cantidad: number; color: string }[] {
    return [
      { nombre: 'Confirmados', cantidad: this.turnosConfirmados, color: '#0863e8' },
      { nombre: 'Pendientes', cantidad: this.turnosPendientes, color: '#10b6a4' },
      { nombre: 'Cancelados', cantidad: this.turnosCancelados, color: '#f3a524' },
      { nombre: 'Reprogramados', cantidad: this.turnosReprogramados, color: '#ec4775' }
    ];
  }

  get graficoDona(): string {
    const total = this.porcionesEstados.reduce((s, e) => s + e.cantidad, 0);

    if (!total) {
      return '#e8eef7';
    }

    let inicio = 0;
    const partes = this.porcionesEstados.map(parte => {
      const fin = inicio + (parte.cantidad / total) * 100;
      const texto = `${parte.color} ${inicio}% ${fin}%`;
      inicio = fin;
      return texto;
    });

    return `conic-gradient(${partes.join(', ')})`;
  }

  get reportesDona(): string {
    return 'conic-gradient(#0863e8 0% 25%, #0aa79c 25% 45%, #ffb347 45% 63%, #ec4775 63% 82%, #8c95ad 82% 100%)';
  }

  get nombreModal(): string {
    const acciones: Record<string, string> = {
      profesional: 'profesional',
      especialidad: 'especialidad',
      usuario: 'usuario',
      turno: 'turno',
      notificacion: 'notificación'
    };

    return `${this.idEdicion ? 'Editar' : 'Nuevo'} ${acciones[this.tipoModal]}`;
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.listaActual.length / this.elementosPorPagina));
  }

  get listaActual(): any[] {
    if (this.seccionActual === 'profesionales') return this.profesionalesFiltrados;
    if (this.seccionActual === 'especialidades') return this.especialidadesFiltradas;
    if (this.seccionActual === 'usuarios') return this.usuariosFiltrados;
    if (this.seccionActual === 'turnos') return this.turnosFiltrados;
    if (this.seccionActual === 'informes') return this.informesFiltrados;
    if (this.seccionActual === 'notificaciones') return this.notificacionesFiltradas;

    return [];
  }

  get listaPaginada(): any[] {
    const inicio = (this.pagina - 1) * this.elementosPorPagina;
    return this.listaActual.slice(inicio, inicio + this.elementosPorPagina);
  }

  cambiarPagina(pagina: number): void {
    this.pagina = Math.min(this.totalPaginas, Math.max(1, pagina));
  }

  notificar(texto: string): void {
    this.mensaje = texto;
    this.mostrarMensaje = true;

    setTimeout(() => {
      this.mostrarMensaje = false;
    }, 2800);
  }

  marcarNotificacionesLeidas(): void {
    this.notificacionesNoLeidas = 0;
    this.notificar('Notificaciones marcadas como leídas.');
  }

  exportarCSV(): void {
    let filas: string[][] = [];

    if (this.seccionActual === 'profesionales') {
      filas = [
        ['Nombre', 'Especialidad', 'Email', 'Teléfono', 'Estado'],
        ...this.profesionalesFiltrados.map(p => [
          p.nombre, p.especialidad, p.email, p.telefono,
          p.activo ? 'Activo' : 'Inactivo'
        ])
      ];
    } else if (this.seccionActual === 'especialidades') {
      filas = [
        ['Especialidad', 'Descripción', 'Profesionales', 'Estado'],
        ...this.especialidadesFiltradas.map(e => [
          e.nombre, e.descripcion, String(e.profesionales),
          e.activo ? 'Activo' : 'Inactivo'
        ])
      ];
    } else if (this.seccionActual === 'usuarios') {
      filas = [
        ['Nombre', 'Rol', 'Email', 'Teléfono', 'Estado'],
        ...this.usuariosFiltrados.map(u => [
          u.nombre, u.rol, u.email, u.telefono,
          u.activo ? 'Activo' : 'Inactivo'
        ])
      ];
    } else if (this.seccionActual === 'turnos') {
      filas = [
        ['Fecha', 'Paciente', 'Profesional', 'Especialidad', 'Estado'],
        ...this.turnosFiltrados.map(t => [
          t.fecha, t.paciente, t.profesional, t.especialidad, t.estado
        ])
      ];
    } else if (this.seccionActual === 'informes') {
      filas = [
        ['Fecha', 'Paciente', 'Profesional', 'Especialidad', 'Estado'],
        ...this.informesFiltrados.map(i => [
          i.fecha, i.paciente, i.profesional, i.especialidad, i.estado
        ])
      ];
    } else if (this.seccionActual === 'notificaciones') {
      filas = [
        ['Título', 'Tipo', 'Público', 'Fecha', 'Estado'],
        ...this.notificacionesFiltradas.map(n => [
          n.titulo, n.tipo, n.publico, n.fecha, n.estado
        ])
      ];
    } else {
      filas = [
        ['Indicador', 'Cantidad'],
        ['Profesionales activos', String(this.profesionalesActivos)],
        ['Pacientes registrados', String(this.pacientesRegistrados)],
        ['Turnos', String(this.turnos.length)],
        ['Turnos confirmados', String(this.turnosConfirmados)],
        ['Informes médicos', String(this.totalInformes)]
      ];
    }

    const contenido = filas.map(fila =>
      fila.map(valor => `"${String(valor).replace(/"/g, '""')}"`).join(';')
    ).join('\r\n');

    const archivo = new Blob(['\uFEFF' + contenido], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = URL.createObjectURL(archivo);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `cliniturnos-${this.seccionActual}.csv`;
    enlace.click();
    URL.revokeObjectURL(url);

    this.notificar('Archivo CSV exportado.');
  }

  verDetalle(tipo: string, item: any): void {
    this.notificar(`${tipo}: ${item.nombre || item.paciente || item.titulo || 'Registro'}`);
  }

  iniciales(nombre: string): string {
  return nombre
    .split(' ')
    .filter(palabra => palabra.length > 0)
    .map(palabra => palabra[0])
    .slice(-2)
    .join('')
    .toUpperCase();
  }

  get numerosPaginas(): number[] {
    return Array.from(
      { length: this.totalPaginas },
      (_, indice) => indice + 1
    );
  }

}
