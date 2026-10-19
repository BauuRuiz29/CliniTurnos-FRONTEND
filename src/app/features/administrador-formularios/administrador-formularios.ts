
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

type SeccionAdmin = 'profesional' | 'especialidad' | 'configuracion';

@Component({
  selector: 'app-administrador-formularios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './administrador-formularios.html',
  styleUrl: './administrador-formularios.scss'
})
export class AdministradorFormulariosComponent {
  seccion: SeccionAdmin = 'profesional';

  notificaciones = 2;
  mensaje = '';
  mostrarMensaje = false;

  fotoProfesional = '';
  logoCentro = '';

  roles = [
    'Médico',
    'Laboratorista',
    'Especialista',
    'Recepcionista'
  ];

  especialidades = [
    'Cardiología',
    'Dermatología',
    'Traumatología',
    'Neurología',
    'Pediatría',
    'Oftalmología',
    'Laboratorio',
    'Medicina general'
  ];

  consultorios = [
    'Consultorio 1',
    'Consultorio 2',
    'Consultorio 3',
    'Consultorio externo'
  ];

  iconos = [
    { simbolo: '♡', nombre: 'Corazón' },
    { simbolo: '♧', nombre: 'Estetoscopio' },
    { simbolo: '♧', nombre: 'Pulmones' },
    { simbolo: '◉', nombre: 'Cerebro' },
    { simbolo: '♙', nombre: 'Pediatría' },
    { simbolo: '◎', nombre: 'Oftalmología' },
    { simbolo: '♜', nombre: 'Odontología' },
    { simbolo: '⌁', nombre: 'Traumatología' },
    { simbolo: '♧', nombre: 'Laboratorio' },
    { simbolo: '•••', nombre: 'Otros' }
  ];

  iconoSeleccionado = 0;

  profesional = {
    nombre: '',
    apellido: '',
    dni: '',
    nacimiento: '',
    email: '',
    telefono: '',
    rol: '',
    especialidad: '',
    matricula: '',
    subespecialidad: '',
    consultorio: '',
    presencial: false,
    virtual: false,
    ambas: false,
    observaciones: ''
  };

  especialidad = {
    nombre: '',
    descripcion: '',
    activa: true
  };

  centro = {
    nombre: 'Clínica Centro',
    cuit: '30-12345678-9',
    direccion: 'Av. Siempre Viva 1234',
    ciudad: 'Córdoba',
    provincia: 'Córdoba',
    codigoPostal: '5000',
    telefono: '(0351) 123-4567',
    email: 'info@clinicacentro.com',
    web: 'www.clinicacentro.com'
  };

  preferencias = {
    zonaHoraria: 'GMT-03:00 Buenos Aires',
    formatoFecha: 'dd/mm/aaaa',
    formatoHora: '24 horas',
    duracionTurno: '30 minutos',
    turnosOnline: true,
    recordatorios: true,
    confirmacion: false
  };

  provincias = [
    'Buenos Aires',
    'Catamarca',
    'Chaco',
    'Chubut',
    'Ciudad Autónoma de Buenos Aires',
    'Córdoba',
    'Corrientes',
    'Entre Ríos',
    'Formosa',
    'Jujuy',
    'La Pampa',
    'La Rioja',
    'Mendoza',
    'Misiones',
    'Neuquén',
    'Río Negro',
    'Salta',
    'San Juan',
    'San Luis',
    'Santa Cruz',
    'Santa Fe',
    'Santiago del Estero',
    'Tierra del Fuego',
    'Tucumán'
  ];

  cambiarSeccion(seccion: SeccionAdmin): void {
    this.seccion = seccion;
    this.mensaje = '';
    this.mostrarMensaje = false;
  }

  seleccionarIcono(indice: number): void {
    this.iconoSeleccionado = indice;
  }

  cambiarModalidad(modalidad: 'presencial' | 'virtual' | 'ambas'): void {
    if (modalidad === 'ambas') {
      this.profesional.ambas = !this.profesional.ambas;

      if (this.profesional.ambas) {
        this.profesional.presencial = true;
        this.profesional.virtual = true;
      } else {
        this.profesional.presencial = false;
        this.profesional.virtual = false;
      }

      return;
    }

    this.profesional[modalidad] = !this.profesional[modalidad];

    this.profesional.ambas =
      this.profesional.presencial &&
      this.profesional.virtual;
  }

  cargarArchivo(event: Event, tipo: 'foto' | 'logo'): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];

    if (!archivo) {
      return;
    }

    if (!archivo.type.startsWith('image/')) {
      this.notificar('Seleccioná un archivo de imagen válido.');
      input.value = '';
      return;
    }

    if (archivo.size > 2 * 1024 * 1024) {
      this.notificar('La imagen no puede superar los 2 MB.');
      input.value = '';
      return;
    }

    const lector = new FileReader();

    lector.onload = () => {
      const resultado = lector.result;

      if (typeof resultado !== 'string') {
        this.notificar('No se pudo cargar la imagen.');
        return;
      }

      if (tipo === 'foto') {
        this.fotoProfesional = resultado;
      } else {
        this.logoCentro = resultado;
      }

      this.notificar(
        tipo === 'foto'
          ? 'Foto cargada correctamente.'
          : 'Logo cargado correctamente.'
      );
    };

    lector.onerror = () => {
      this.notificar('No se pudo leer el archivo.');
    };

    lector.readAsDataURL(archivo);
  }

  guardarProfesional(): void {
    if (
      !this.profesional.nombre.trim() ||
      !this.profesional.apellido.trim() ||
      !this.profesional.dni.trim() ||
      !this.profesional.email.trim() ||
      !this.profesional.telefono.trim() ||
      !this.profesional.rol ||
      !this.profesional.especialidad ||
      !this.profesional.matricula.trim()
    ) {
      this.notificar('Completá todos los campos obligatorios.');
      return;
    }

    if (
      !this.profesional.presencial &&
      !this.profesional.virtual
    ) {
      this.notificar('Seleccioná una modalidad de atención.');
      return;
    }

    this.notificar(
      `Profesional ${this.profesional.nombre} ${this.profesional.apellido} validado correctamente.`
    );

    // En este punto se puede conectar el alta a una API.
  }

  guardarEspecialidad(): void {
    if (!this.especialidad.nombre.trim()) {
      this.notificar('Ingresá el nombre de la especialidad.');
      return;
    }

    this.notificar(
      `Especialidad "${this.especialidad.nombre}" validada correctamente.`
    );

    // En este punto se puede conectar el alta a una API.
  }

  guardarConfiguracion(): void {
    if (
      !this.centro.nombre.trim() ||
      !this.centro.direccion.trim() ||
      !this.centro.ciudad.trim() ||
      !this.centro.provincia ||
      !this.centro.codigoPostal.trim() ||
      !this.centro.telefono.trim() ||
      !this.centro.email.trim()
    ) {
      this.notificar(
        'Completá los campos obligatorios del centro.'
      );
      return;
    }

    this.notificar('Configuración validada correctamente.');

    // En este punto se puede conectar el guardado a una API.
  }

  cancelar(): void {
    if (this.seccion === 'profesional') {
      this.profesional = {
        nombre: '',
        apellido: '',
        dni: '',
        nacimiento: '',
        email: '',
        telefono: '',
        rol: '',
        especialidad: '',
        matricula: '',
        subespecialidad: '',
        consultorio: '',
        presencial: false,
        virtual: false,
        ambas: false,
        observaciones: ''
      };

      this.fotoProfesional = '';
    }

    if (this.seccion === 'especialidad') {
      this.especialidad = {
        nombre: '',
        descripcion: '',
        activa: true
      };

      this.iconoSeleccionado = 0;
    }

    if (this.seccion === 'configuracion') {
      this.notificar(
        'Los cambios no guardados permanecen en el formulario.'
      );
      return;
    }

    this.notificar('Formulario limpiado.');
  }

  cerrarSesion(): void {
    this.notificar('La sesión de demostración sigue activa.');
  }

  private notificar(texto: string): void {
    this.mensaje = texto;
    this.mostrarMensaje = true;
  }

  cerrarNotificacion(): void {
    this.mostrarMensaje = false;
  }
}
