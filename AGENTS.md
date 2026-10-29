# AGENTS.md — CliniTurnos (Front-end)

Guía para agentes de IA (Claude Code y similares) que trabajan en el front-end de CliniTurnos.
Leé este archivo completo antes de tocar código. Si algo de acá contradice lo que ves en el repo, **frená y preguntá**: puede ser que el archivo esté desactualizado o que el código tenga un error.

---

## 1. Qué es CliniTurnos

Sistema web de gestión integral para centros médicos: turnos, pacientes e informes médicos.

Tres roles, cada uno con su propia experiencia:

| Rol | Qué hace en el sistema |
|---|---|
| **PACIENTE** | Se registra, ve el catálogo de profesionales y especialidades, pide turnos (consulta o estudio), cancela/reprograma, ve sus turnos y sus informes médicos, completa su ficha (alergias, medicación habitual, contacto de emergencia). |
| **MEDICO** (profesional) | Ve su agenda, gestiona su disponibilidad horaria, inicia y completa la atención (informe médico), accede a los informes de *sus* pacientes, cancela/reprograma turnos. |
| **ADMIN** | Da de alta/baja profesionales y hace el ABM de especialidades. |

El back-end (Django + PostgreSQL) se desarrolla por separado. **Este repo es solo el front-end.**

### Documentación fuente (vive fuera de este repo)
- Objetivo de la aplicación
- Requerimientos funcionales `R01`–`R22` y no funcionales `Rnf 01`–`Rnf 14`
- Modelo de datos (`db-cliniturnos`)
- Diagramas de estado (Turno, Estudio, Notificación)

Cuando una tarea implemente un requerimiento, **referencialo por su código** (ej. `R06`) en el plan, en el commit y, si aplica, en un comentario corto.

---

## 2. Stack

- **Angular 22** — standalone, zoneless y `OnPush` son los defaults del framework. No los reviertas.
- TypeScript en modo `strict`.
- Signals como primitiva de reactividad por defecto.
- Builder de la CLI basado en esbuild (`@angular/build`). Webpack y `@angular-devkit/build-angular` están deprecados: no los introduzcas.
- Test runner: el que trae la CLI por defecto (Vitest).

> Antes de usar una API, verificá que exista en Angular 22 y que no esté marcada como experimental/deprecada. No escribas código "de memoria" de versiones viejas (NgModules, `*ngIf`/`*ngFor`, `ChangeDetectionStrategy.Default`, constructor injection, etc.). Ante la duda, consultá la documentación oficial o el MCP server de Angular CLI si está configurado.

### Comandos

```bash
npm install          # dependencias
ng serve             # dev server
ng build             # build de producción
ng test              # tests unitarios
ng lint              # lint (si está configurado)
```

Después de cada cambio: el proyecto **tiene que compilar** (`ng build`) y los tests existentes **tienen que pasar**. Si no, la tarea no está terminada.

---

## 3. Arquitectura

### 3.1 Principios
- **Feature-first**: el código se organiza por dominio de negocio, no por tipo técnico.
- **Separación por capas**: la UI no conoce detalles de transporte (HTTP, mocks, DTOs del back). Siempre hay una capa intermedia.
- **Dependencias en una sola dirección**: `features → shared → core`. Una feature nunca importa de otra feature; si dos features necesitan lo mismo, se sube a `shared` (si es UI/utilidad) o a `core` (si es infraestructura/dominio transversal).
- **Lazy loading por rol y por feature** (`Rnf 04`, `Rnf 05`): cada área de rol se carga bajo demanda.
- **Abierto a extensión** (`Rnf 10`, `Rnf 11`): el diseño tiene que permitir sumar módulos futuros (telemedicina, pagos online) sin reestructurar lo existente.

### 3.2 Estructura de carpetas objetivo

```
src/app/
├── core/                    # Singleton, se carga una vez, sin UI de negocio
│   ├── auth/                # sesión, usuario actual, roles
│   ├── guards/              # guards funcionales (auth, rol)
│   ├── interceptors/        # interceptores HTTP funcionales
│   ├── layout/              # shells por rol (header, sidebar, nav)
│   └── models/              # modelos de dominio transversales y enums
│
├── shared/                  # Reutilizable y sin estado de negocio
│   ├── ui/                  # componentes presentacionales genéricos
│   ├── pipes/
│   ├── directives/
│   └── utils/
│
├── features/
│   ├── auth/                # login, registro, recupero de contraseña
│   ├── paciente/            # área del paciente
│   │   ├── turnos/
│   │   ├── catalogo/        # profesionales y especialidades
│   │   ├── informes/
│   │   └── perfil/
│   ├── profesional/         # área del médico
│   │   ├── agenda/
│   │   ├── disponibilidad/
│   │   ├── atencion/
│   │   └── pacientes/
│   └── admin/
│       ├── profesionales/
│       └── especialidades/
│
├── app.config.ts
└── app.routes.ts
```

Dentro de cada feature, separar al menos:
- `pages/` — componentes ruteables (contenedores).
- `components/` — piezas de UI propias de esa feature.
- `data-access/` — servicios, fachadas, mappers de esa feature.
- `*.routes.ts` — rutas de la feature.

Esta estructura es el **objetivo**. Si el maquetado actual no la respeta, migrar de forma incremental (ver §6).

### 3.3 Patrones a aplicar

| Patrón | Dónde | Para qué |
|---|---|---|
| **Smart / Presentational** | `pages/` vs `components/` | Las páginas orquestan y obtienen datos; los componentes de UI reciben `input()` y emiten `output()`, sin inyectar servicios de datos. |
| **Facade** | `data-access/` de cada feature | Una única puerta de entrada para la UI. La página habla con la fachada, nunca directo con HTTP ni con mocks. |
| **Repository / Data source** | `data-access/` | Abstrae de dónde vienen los datos. Permite tener una implementación **mock** ahora y una **HTTP** después, intercambiables por DI sin tocar la UI. |
| **Mapper / Adapter** | `data-access/` | Convierte DTOs del back (snake_case, formato de la DB) en modelos de dominio del front y viceversa. Ningún DTO llega a un template. |
| **State machine explícita** | `core/models/` o la feature | Las transiciones de `Turno`, `Estudio` y `Notificación` se modelan como un mapa de transiciones permitidas (ver §4.2), no con `if` dispersos por los componentes. |
| **Strategy** | Shells, home por rol | Comportamiento que varía por rol (navegación, landing, acciones disponibles) se resuelve por configuración/estrategia, no con `@if (rol === ...)` repetido. |
| **Dependency Injection con tokens** | `core/` | Configuración (ej. `max_intentos`, URL base, ventana de cancelación de 24 h) se provee con `InjectionToken`, no con constantes sueltas. |

Regla práctica: **si una decisión de negocio aparece en un template, está en el lugar equivocado.**

---

## 4. Reglas de dominio que el front tiene que respetar

El back-end es la fuente de verdad y valida todo. El front **anticipa** estas reglas para dar buena UX (deshabilitar acciones, mostrar mensajes), pero nunca las da por garantizadas.

### 4.1 Roles y acceso (`Rnf 01`)
- Un paciente solo ve su propia información.
- Un médico solo ve datos de sus pacientes asignados.
- Las rutas de cada área se protegen con guards por rol. Ocultar un botón **no** es control de acceso.

### 4.2 Ciclos de vida

**Turno** — `DISPONIBLE · BLOQUEADO · RESERVADO · EN_CURSO · FINALIZADO · CANCELADO · AUSENTE`
- `DISPONIBLE → RESERVADO` cuando el paciente lo pide (no hay confirmación manual).
- `RESERVADO → EN_CURSO` cuando el profesional inicia la atención.
- `EN_CURSO → FINALIZADO` al completar el informe, o al cerrar la atención sin informe: en ese caso el informe queda **pendiente** (consulta finalizada sin diagnóstico) y el profesional lo completa después.
- `RESERVADO → AUSENTE` si vence el horario sin presentarse.
- `RESERVADO → CANCELADO` por paciente, médico o clínica.
- `CANCELADO → DISPONIBLE` reutiliza la misma franja (se limpia el paciente).
- **Reprogramar no es un estado**: es cancelar el turno original + reservar una franja nueva.
- **Cancelar/reprogramar solo hasta 24 h antes** del inicio (`R08`, `R12`).
- `tipo_turno`: `CONSULTA` (requiere profesional y especialidad) o `ESTUDIO` (el vínculo lo da el estudio).

**Estudio** — `SOLICITADO → REALIZADO → INFORMADO`, o `SOLICITADO → CANCELADO`
- Asignarle turno no cambia el estado.
- Si se cancela el turno del estudio, el estudio vuelve a `SOLICITADO` sin turno.

**Notificación** — `PENDIENTE · ENVIADA · FALLIDA · CANCELADA` (mayormente back-end; el front solo la muestra).

### 4.3 Otros
- Datos de salud: el registro exige **consentimiento explícito** antes de continuar (`Rnf 14`).
- La disponibilidad de turnos tiene que reflejar cambios en tiempo real para evitar doble reserva (`Rnf 08`): no cachear agresivamente franjas horarias.
- Días de atención del profesional: lunes a viernes.
- Identificación del paciente: `DNI` o `PASAPORTE`.

---

## 5. Requisitos no funcionales que impactan en el front

- **Responsive / mobile-first** (`Rnf 03`): todo layout se diseña primero para mobile.
- **Rendimiento** (`Rnf 04`, `Rnf 05`): páginas principales < 2 s, búsqueda y calendario < 1 s. Lazy loading, `@defer` donde tenga sentido, `track` en todo `@for`, imágenes optimizadas.
- **Compatibilidad** (`Rnf 13`): Chrome, Firefox, Safari y Edge recientes.
- **Accesibilidad**: HTML semántico, labels en todos los campos, navegación por teclado y foco visible.
- **Confidencialidad**: nunca loguear en consola datos personales o médicos; nunca guardar datos clínicos en `localStorage`/`sessionStorage`.

---

## 6. Roadmap inicial

El repo hoy tiene **maquetado prácticamente estático**. Las primeras tareas son, en este orden:

### Fase 1 — Relevamiento (sin cambios de código)
1. Recorrer el proyecto y listar: pantallas existentes, rutas, componentes, estilos globales, dependencias y versión real de Angular.
2. Mapear cada pantalla con el rol y los requerimientos (`R0x`) que cubre.
3. Detectar HTML duplicado, bloques repetidos y datos hardcodeados.
4. Entregar un informe corto y una propuesta de migración. **Esperar aprobación antes de seguir.**

### Fase 2 — Modularización
1. Crear la estructura de §3.2 (`core`, `shared`, `features`) y mover lo existente sin cambiar comportamiento visual.
2. Extraer layouts/shells por rol.
3. Extraer componentes reutilizables (cards, tablas, badges de estado, formularios repetidos) a `shared/ui` o a la feature correspondiente.
4. Definir rutas con lazy loading por rol y por feature.
5. Verificar en cada paso que la UI se ve igual que antes.

### Fase 3 — Hacer funcional el maquetado
1. Definir modelos de dominio y enums alineados con el modelo de datos.
2. Reemplazar datos hardcodeados por data sources **mock** detrás de fachadas (patrón de §3.3), de modo que conectar el back después sea cambiar un provider.
3. Conectar interacciones: navegación, formularios con validación, filtros, estados de carga/vacío/error.
4. Implementar las transiciones de estado de §4.2 con su máquina de estados.
5. Guards de autenticación y rol con una sesión simulada.

Fases posteriores (integración con API, notificaciones, etc.) se agregan a este archivo cuando se definan.

---

## 7. Cómo trabajar en este repo (para el agente)

- **Planificá antes de editar.** Para cualquier tarea que toque más de un archivo, proponé un plan breve (archivos afectados, qué cambia, riesgos) y esperá el OK.
- **Cambios chicos e incrementales.** Una tarea = un objetivo. No mezcles refactor con features nuevas.
- **No cambies el diseño visual** durante la modularización salvo que se pida explícitamente.
- **No agregues dependencias** sin justificarlo y pedir aprobación.
- **No inventes reglas de negocio.** Si un requerimiento es ambiguo o falta información (ej. una pantalla sin diseño), preguntá.
- **No borres código ni archivos** sin confirmarlo antes.
- **Verificá** compilación y tests al terminar cada tarea, y resumí: qué cambió, qué requerimientos cubre y qué quedó pendiente.

### Convenciones generales
- **Idioma**: dominio en español, alineado con la base de datos (`Turno`, `Paciente`, `Profesional`, `EstadoTurno`). Términos técnicos de Angular en inglés (`component`, `service`, `guard`, `facade`).
- **Nombres de archivo**: `kebab-case`, siguiendo la convención de nombres de la CLI de Angular 22.
- **Enums de estado**: usar exactamente los valores de la base de datos (`RESERVADO`, `EN_CURSO`, etc.).
- **Commits**: mensajes descriptivos que referencien el requerimiento cuando aplique (ej. `feat(paciente/turnos): listar turnos próximos y pasados [R07]`).

---

## 8. Secciones pendientes

Se van a definir a medida que avance el desarrollo. **No asumas reglas para estas áreas**: si una tarea las necesita, consultá primero.

- Guía de componentes
- Manejo de estado
- Integración con APIs
- Estilos / design system
- Estrategia de testing
- Manejo de errores y notificaciones al usuario
