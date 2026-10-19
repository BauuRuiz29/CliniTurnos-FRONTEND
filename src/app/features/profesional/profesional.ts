
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

type Seccion =
  | 'inicio'
  | 'agenda'
  | 'pacientes'
  | 'detalle'
  | 'informe'
  | 'turnos'
  | 'disponibilidad'
  | 'informes'
  | 'notificaciones';

@Component({
  selector: 'app-profesional',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profesional.html',
  styleUrl: './profesional.scss'
})
export class ProfesionalComponent {
  seccion: Seccion = 'inicio';

  menu = [
    { id: 'inicio' as Seccion, nombre: 'Inicio', icono: 'home' },
    { id: 'agenda' as Seccion, nombre: 'Agenda', icono: 'calendar' },
    { id: 'pacientes' as Seccion, nombre: 'Pacientes', icono: 'users' },
    { id: 'informes' as Seccion, nombre: 'Informes médicos', icono: 'file' },
    { id: 'disponibilidad' as Seccion, nombre: 'Disponibilidad', icono: 'clock' },
    { id: 'notificaciones' as Seccion, nombre: 'Notificaciones', icono: 'bell' }
  ];

  nombreProfesional = 'Dr. Juan García';
  especialidadProfesional = 'Cardiología';

  fechaAgenda = new Date(2024, 4, 21);
  vistaAgenda: 'Día' | 'Semana' | 'Mes' = 'Día';

  filtroTurnos: 'Pendientes' | 'Pasados' | 'Todos' = 'Pendientes';
  filtroInformes: 'Todos' | 'Pendientes' | 'Completados' = 'Todos';
  filtroNotificaciones: 'Todas' | 'No leídas' | 'Turnos' | 'Sistema' = 'Todas';

  busquedaPaciente = '';
  busquedaInforme = '';
  busquedaNotificacion = '';

  pacienteSeleccionado = 0;
  pestanaPaciente = 'Información';
  paginaPacientes = 1;
  mostrarFormularioHorario = false;
  mostrarFormularioPaciente = false;
  mensaje = '';

  diagnostico = 'Hipertensión arterial estadio 1.';
  tratamiento = 'Enalapril 10mg cada 24 hs.\nDieta hiposódica.\nControl en 30 días.';
  indicaciones = '- Controlar presión arterial en casa.\n- Realizar actividad física moderada.';
  estudios = ['Hemograma completo', 'Glucemia', 'Colesterol total'];
  archivoInforme = 'ECG_21052024.pdf';

  nuevoHorario = {
    dia: 'Martes',
    desde: '08:00',
    hasta: '09:00',
    duracion: 60,
    tipo: 'Consulta'
  };

  nuevoPaciente = {
    nombre: '',
    dni: '',
    telefono: '',
    email: ''
  };

  turnos = [
    { id: 1, dia: 21, mes: 'MAY.', hora: '10:30', nombre: 'María López', dni: '28.123.456', telefono: '11 2345 6789', tipo: 'Cardiología', estado: 'Pendiente', motivo: 'Control anual', obraSocial: 'OSDE 210', email: 'marialopez@email.com', edad: 35, notas: 'Siento molestias leves en el pecho desde hace unos días.' },
    { id: 2, dia: 21, mes: 'MAY.', hora: '11:15', nombre: 'Pedro Martínez', dni: '31.987.654', telefono: '11 9876 5432', tipo: 'Primera vez', estado: 'Pendiente', motivo: 'Primera consulta', obraSocial: 'Swiss Medical', email: 'pedro@email.com', edad: 42, notas: 'Primera consulta con el profesional.' },
    { id: 3, dia: 21, mes: 'MAY.', hora: '12:00', nombre: 'Ana Fernández', dni: '27.654.321', telefono: '11 4567 8910', tipo: 'Control', estado: 'Pendiente', motivo: 'Control periódico', obraSocial: 'OSDE 210', email: 'ana@email.com', edad: 31, notas: 'Control de rutina.' },
    { id: 4, dia: 21, mes: 'MAY.', hora: '14:30', nombre: 'Luis Rodríguez', dni: '29.876.543', telefono: '11 3456 7890', tipo: 'Control', estado: 'Pendiente', motivo: 'Seguimiento', obraSocial: 'Galeno', email: 'luis@email.com', edad: 38, notas: 'Seguimiento de tratamiento.' },
    { id: 5, dia: 22, mes: 'MAY.', hora: '09:00', nombre: 'Julia Gómez', dni: '33.456.789', telefono: '11 6789 0123', tipo: 'Control', estado: 'Confirmado', motivo: 'Control anual', obraSocial: 'OSDE 210', email: 'julia@email.com', edad: 29, notas: 'Sin observaciones.' }
  ];

  pacientes = [
    { nombre: 'María López', dni: '28.123.456', telefono: '11 2345 6789', fecha: '21/05/2024', iniciales: 'ML', edad: 35, email: 'marialopez@email.com' },
    { nombre: 'Pedro Martínez', dni: '31.987.654', telefono: '11 9876 5432', fecha: '21/05/2024', iniciales: 'PM', edad: 42, email: 'pedro@email.com' },
    { nombre: 'Ana Fernández', dni: '27.654.321', telefono: '11 4567 8910', fecha: '21/05/2024', iniciales: 'AF', edad: 31, email: 'ana@email.com' },
    { nombre: 'Luis Rodríguez', dni: '29.876.543', telefono: '11 3456 7890', fecha: '20/05/2024', iniciales: 'LR', edad: 38, email: 'luis@email.com' },
    { nombre: 'Julia Gómez', dni: '33.456.789', telefono: '11 6789 0123', fecha: '20/05/2024', iniciales: 'JG', edad: 29, email: 'julia@email.com' }
  ];

  informes = [
    { nombre: 'María López', fecha: '21/05/2024', especialidad: 'Cardiología', estado: 'Completado' },
    { nombre: 'Pedro Martínez', fecha: '07/05/2024', especialidad: 'Traumatología', estado: 'Completado' },
    { nombre: 'Ana Fernández', fecha: '30/04/2024', especialidad: 'Dermatología', estado: 'Pendiente' },
    { nombre: 'Luis Rodríguez', fecha: '15/04/2024', especialidad: 'Cardiología', estado: 'Completado' }
  ];

  horarios = [
    { dia: 'Martes', desde: '08:00', hasta: '09:00', duracion: 60, tipo: 'Consulta', activo: true },
    { dia: 'Martes', desde: '09:00', hasta: '10:00', duracion: 60, tipo: 'Consulta', activo: true },
    { dia: 'Martes', desde: '10:00', hasta: '11:00', duracion: 60, tipo: 'Consulta', activo: true },
    { dia: 'Martes', desde: '11:00', hasta: '12:00', duracion: 60, tipo: 'Consulta', activo: false },
    { dia: 'Martes', desde: '14:00', hasta: '15:00', duracion: 60, tipo: 'Consulta', activo: true },
    { dia: 'Martes', desde: '15:00', hasta: '16:00', duracion: 60, tipo: 'Consulta', activo: true },
    { dia: 'Martes', desde: '16:00', hasta: '17:00', duracion: 60, tipo: 'Consulta', activo: false }
  ];

  notificaciones = [
    { icono: 'calendar', titulo: 'Nuevo turno asignado', texto: 'Tenés un nuevo turno con María López para el 21/05/2024 a las 10:30 hs.', tiempo: 'Hace 10 min', categoria: 'Turnos', leida: false },
    { icono: 'clock', titulo: 'Reprogramación de turno', texto: 'Pedro Martínez reprogramó el turno del 21/05/2024 a las 11:15 hs.', tiempo: 'Hace 1 h', categoria: 'Turnos', leida: false },
    { icono: 'file', titulo: 'Informe pendiente', texto: 'Tenés 2 informes pendientes por completar.', tiempo: 'Hace 2 h', categoria: 'Sistema', leida: true },
    { icono: 'bell', titulo: 'Recordatorio de disponibilidad', texto: 'Recordá actualizar tu disponibilidad horaria.', tiempo: 'Ayer', categoria: 'Sistema', leida: true }
  ];

  get turnoActual() {
    return this.turnos.find(t => t.id === this.pacienteSeleccionado) ?? this.turnos[0];
  }

  get turnosFiltrados() {
    if (this.filtroTurnos === 'Pendientes') {
      return this.turnos.filter(t => t.estado === 'Pendiente');
    }
    if (this.filtroTurnos === 'Pasados') {
      return this.turnos.filter(t => t.estado === 'Confirmado');
    }
    return this.turnos;
  }

  get pacientesFiltrados() {
    const texto = this.busquedaPaciente.toLowerCase().trim();
    return this.pacientes.filter(p =>
      `${p.nombre} ${p.dni} ${p.telefono}`.toLowerCase().includes(texto)
    );
  }

  get informesFiltrados() {
    const texto = this.busquedaInforme.toLowerCase().trim();
    return this.informes.filter(i => {
      const coincideTexto = `${i.nombre} ${i.fecha} ${i.especialidad}`.toLowerCase().includes(texto);
      const coincideEstado = this.filtroInformes === 'Todos' || i.estado === this.filtroInformes;
      return coincideTexto && coincideEstado;
    });
  }

  get notificacionesFiltradas() {
    const texto = this.busquedaNotificacion.toLowerCase().trim();
    return this.notificaciones.filter(n => {
      const coincideTexto = `${n.titulo} ${n.texto}`.toLowerCase().includes(texto);
      const coincideCategoria = this.filtroNotificaciones === 'Todas' ||
        (this.filtroNotificaciones === 'No leídas' && !n.leida) ||
        n.categoria === this.filtroNotificaciones;
      return coincideTexto && coincideCategoria;
    });
  }

  get notificacionesNoLeidas() {
    return this.notificaciones.filter(n => !n.leida).length;
  }

  get pacientesPaginados() {
    const inicio = (this.paginaPacientes - 1) * 5;
    return this.pacientesFiltrados.slice(inicio, inicio + 5);
  }

  navegar(seccion: Seccion): void {
    this.seccion = seccion;
    this.mensaje = '';
  }

  abrirPaciente(id: number): void {
    this.pacienteSeleccionado = id;
    this.pestanaPaciente = 'Información';
    this.navegar('detalle');
  }

  cambiarDia(direccion: number): void {
    const fecha = new Date(this.fechaAgenda);
    if (this.vistaAgenda === 'Mes') {
      fecha.setMonth(fecha.getMonth() + direccion);
    } else if (this.vistaAgenda === 'Semana') {
      fecha.setDate(fecha.getDate() + direccion * 7);
    } else {
      fecha.setDate(fecha.getDate() + direccion);
    }
    this.fechaAgenda = fecha;
  }

  get fechaAgendaTexto(): string {
    return new Intl.DateTimeFormat('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(this.fechaAgenda);
  }

  alternarHorario(horario: { activo: boolean }): void {
    horario.activo = !horario.activo;
  }

  agregarHorario(): void {
    if (!this.nuevoHorario.desde || !this.nuevoHorario.hasta ||
        this.nuevoHorario.hasta <= this.nuevoHorario.desde) {
      this.mostrarMensaje('Revisá el horario ingresado.');
      return;
    }

    this.horarios.push({
      ...this.nuevoHorario,
      activo: true
    });

    this.mostrarFormularioHorario = false;
    this.mostrarMensaje('Horario agregado.');
  }

  eliminarHorario(horario: object): void {
    this.horarios = this.horarios.filter(h => h !== horario);
    this.mostrarMensaje('Horario eliminado.');
  }

  agregarPaciente(): void {
    if (!this.nuevoPaciente.nombre.trim() || !this.nuevoPaciente.dni.trim()) {
      this.mostrarMensaje('Ingresá el nombre y el DNI del paciente.');
      return;
    }

    this.pacientes.push({
      nombre: this.nuevoPaciente.nombre,
      dni: this.nuevoPaciente.dni,
      telefono: this.nuevoPaciente.telefono,
      fecha: 'Sin consultas',
      iniciales: this.nuevoPaciente.nombre
        .split(' ')
        .map(p => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      edad: 0,
      email: this.nuevoPaciente.email
    });

    this.nuevoPaciente = { nombre: '', dni: '', telefono: '', email: '' };
    this.mostrarFormularioPaciente = false;
    this.mostrarMensaje('Paciente agregado.');
  }

  guardarInforme(): void {
    this.mostrarMensaje('Informe guardado en esta demostración.');
  }

  agregarEstudio(): void {
    const estudio = window.prompt('Nombre del estudio solicitado:');
    if (estudio?.trim()) {
      this.estudios.push(estudio.trim());
    }
  }

  quitarEstudio(estudio: string): void {
    this.estudios = this.estudios.filter(e => e !== estudio);
  }

  seleccionarArchivo(evento: Event): void {
    const elemento = evento.target as HTMLInputElement;
    if (elemento.files?.length) {
      this.archivoInforme = elemento.files[0].name;
    }
  }

  marcarLeida(notificacion: { leida: boolean }): void {
    notificacion.leida = true;
  }

  marcarTodasLeidas(): void {
    this.notificaciones.forEach(n => n.leida = true);
    this.mostrarMensaje('Notificaciones marcadas como leídas.');
  }

  mostrarMensaje(texto: string): void {
    this.mensaje = texto;
    window.setTimeout(() => {
      if (this.mensaje === texto) {
        this.mensaje = '';
      }
    }, 2600);
  }

  cerrarSesion(): void {
    this.mostrarMensaje('La sesión de demostración sigue activa.');
  }

  get inicialesTurnoActual(): string {
  return this.turnoActual.nombre
    .split(' ')
    .map(palabra => palabra[0])
    .join('');
  }

  get horariosFiltrados() {
    return this.horarios.filter(
      horario => horario.dia === this.nuevoHorario.dia
    );
  }

  obtenerTurnoIdPorDni(dni: string): number {
    const turno = this.turnos.find(item => item.dni === dni);
    return turno ? turno.id : 1;
  }

  paginaAnterior(): void {
    this.paginaPacientes = Math.max(1, this.paginaPacientes - 1);
  }

}
