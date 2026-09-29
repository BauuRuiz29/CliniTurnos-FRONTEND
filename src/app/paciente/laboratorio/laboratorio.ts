import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-laboratorio',
  templateUrl: './laboratorio.html',
})
export class Laboratorio {
  readonly categories = [
    { name: 'Todos los estudios', icon: 'estudios.png', width: 20 },
    { name: 'Hematología', icon: 'gota.png', width: 15 },
    { name: 'Bioquímica', icon: 'tubo.png', width: 15 },
    { name: 'Orina', icon: 'orinas.png', width: 15 },
    { name: 'Hormonales', icon: 'hormonas.png', width: 20 },
    { name: 'Inmunología', icon: 'inmuno.png', width: 20 },
    { name: 'Serología', icon: 'serologia.png', width: 20 },
    { name: 'Microbiología', icon: 'microbiologia.png', width: 20 },
    { name: 'Otros', icon: 'otros.png', width: 25 },
  ];

  readonly studies = [
    { name: 'Hemograma completo', description: 'Evalúa los componentes de la sangre: glóbulos rojos, glóbulos blancos y plaquetas.', category: 'Hematología', preparation: 'No requiere', preparationClass: 'preparation--green', icon: 'hematologia.png', width: 30, iconClass: 'laboratory-study__icon--red' },
    { name: 'Glucemia', description: 'Mide la cantidad de glucosa en sangre.', category: 'Bioquímica', preparation: 'No requiere', preparationClass: 'preparation--green', icon: 'bioquimica.png', width: 30, iconClass: 'laboratory-study__icon--purple' },
    { name: 'Examen de orina completo', description: 'Análisis físico, químico y microscópico de orina.', category: 'Orina', preparation: 'Primera orina de la mañana', preparationClass: 'preparation--orange', icon: 'orina.png', width: 25, iconClass: 'laboratory-study__icon--orange' },
    { name: 'TSH', description: 'Evalúa el funcionamiento de la glándula tiroides.', category: 'Hormonales', preparation: 'No requiere', preparationClass: 'preparation--green', icon: 'tsh.png', width: 25, iconClass: 'laboratory-study__icon--pink' },
    { name: 'PCR (Proteína C Reactiva)', description: 'Marcador de inflamación en el organismo.', category: 'Inmunología', preparation: 'No requiere', preparationClass: 'preparation--green', icon: 'pcr.png', width: 25, iconClass: 'laboratory-study__icon--green' },
    { name: 'VDRL', description: 'Detección de sífilis.', category: 'Serología', preparation: 'No requiere', preparationClass: 'preparation--green', icon: 'vdrl.png', width: 25, iconClass: 'laboratory-study__icon--blue' },
    { name: 'Urocultivo', description: 'Detecta infecciones urinarias.', category: 'Microbiología', preparation: 'Antes del antibiótico', preparationClass: 'preparation--orange', icon: 'urocultivo.png', width: 30, iconClass: 'laboratory-study__icon--cyan' },
    { name: 'Perfil lipídico', description: 'Colesterol total, HDL, LDL y triglicéridos.', category: 'Bioquímica', preparation: 'Ayuno de 12 horas', preparationClass: 'preparation--orange', icon: '', width: 0, iconClass: 'laboratory-study__icon--gray' },
  ];
}