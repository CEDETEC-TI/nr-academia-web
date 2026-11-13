/**
 * TODOS los datos editables de Academia NR viven acá.
 * Lo que no está confirmado dice [CONFIRMAR CON NACHO]: se muestra con un aviso
 * y se busca fácil con Ctrl+F.
 */

export const PENDIENTE = '[CONFIRMAR CON NACHO]';
export const esPendiente = (v: string) => v.includes(PENDIENTE);
export const pesos = (n: number) => '$' + n.toLocaleString('es-AR');

export const academia = {
  nombre: 'Academia NR',
  profe: 'Ignacio "Nacho" Román',
  profeCorto: 'Nacho',
  sede: 'Le Club Formosa',
  ciudad: 'Formosa, Argentina',
  descripcion:
    'Academia de pádel de Nacho Román en Le Club Formosa. Clases individuales, grupales, para chicos y de competencia. Clase de prueba gratis: solo se paga la cancha.',
  paraTodos: ['Chicos', 'Mujeres', 'Principiantes', 'Competidores'],
};

export const contacto = {
  whatsapp: '5493704610720',
  direccion: 'Freitas 768, Le Club Formosa',
  direccionMapa: 'Freitas 768, Formosa, Argentina',
  tiktok: { usuario: '@NACHOROMAN637', url: 'https://www.tiktok.com/@nachoroman637' },
  instagram: { usuario: '', url: '' }, // sin confirmar: no se muestra hasta tener URL
  youtube: { usuario: '', url: '' }, // sin confirmar: no se muestra hasta tener URL
};

export const precios = {
  claseSuelta: 10000,
  mes8Clases: 80000,
  canchaHora: 24000,
  clasePrueba: 'Gratis', // la CLASE es gratis; la cancha se paga igual (corregido 6/11)
};

/** Clase de prueba: la clase de Nacho es gratis, la cancha se paga. Todos los textos salen de acá. */
export const prueba = {
  titulo: 'Clase de prueba: la clase es gratis, solo pagás la cancha.',
  frase: 'La clase de prueba es gratis: solo pagás la cancha.',
  cierre: 'La primera clase es gratis, solo pagás la cancha.',
  faq: `No pagás la clase: la de prueba es gratis. Lo único que se paga es la cancha (${pesos(precios.canchaHora)} la hora).`,
};

export const horarios = {
  dias: 'Lunes a viernes',
  franjas: ['8 a 12 hs', '14 a 20 hs'],
  finDeSemana: 'Sábados y domingos: consultanos por WhatsApp.',
};

export const datos = [
  { valor: 30, prefijo: '+', etiqueta: 'alumnos' },
  { valor: 4, prefijo: '', etiqueta: 'canchas' },
  { texto: 'Gratis', etiqueta: 'clase de prueba (cancha aparte)' },
] as const;

export const diferencial = [
  { titulo: 'Disponibilidad', texto: 'Nacho está para vos: de lunes a viernes, mañana y tarde.' },
  { titulo: 'Ganas', texto: 'Cada clase se prepara y se da con energía, juegues como juegues.' },
  { titulo: 'Responsabilidad', texto: 'Puntualidad, seguimiento y compromiso con tu progreso.' },
  { titulo: 'Valores', texto: 'Respeto, esfuerzo y compañerismo dentro y fuera de la cancha.' },
];

export const nacho = {
  intro: 'Soy Nacho, profe de pádel en Le Club Formosa. Enseño para que juegues mejor y disfrutes cada partido.',
  trayectoria: '', // sin confirmar: la sección no muestra nada si está vacío
};

export interface Clase {
  slug: string;
  nombre: string;
  corto: string;
  imagen: string; // nombre de archivo en src/assets/img (sin extensión)
  paraQuien: string[];
  queSeTrabaja: string[];
  comoEs: string[];
  duracion: string;
  tamanoGrupo: string;
  precioNota: string;
  mensajeWhatsApp: string;
  faq: { p: string; r: string }[];
}

const faqComun = (nombreClase: string) => [
  {
    p: '¿La primera clase tiene costo?',
    r: prueba.faq,
  },
  {
    p: '¿Necesito tener paleta?',
    r: 'Consultanos por WhatsApp qué traer a tu primera clase y te contamos.',
  },
  {
    p: '¿Cómo reservo?',
    r: `Escribí por WhatsApp con el botón de esta página y coordinamos día y horario para tu clase ${nombreClase}.`,
  },
  {
    p: '¿Qué pasa si no puedo ir?',
    r: 'Avisanos por WhatsApp con tiempo y coordinamos cómo seguir.',
  },
];

export const clases: Clase[] = [
  {
    slug: 'individuales',
    nombre: 'Individuales',
    corto: 'Vos y Nacho. Todo el foco en tu juego.',
    imagen: 'individuales',
    paraQuien: ['Quien quiere avanzar rápido', 'Quien empieza y prefiere ir a su ritmo', 'Quien necesita corregir un golpe puntual'],
    queSeTrabaja: ['Golpes base: derecha, revés y volea', 'Saque y devolución', 'Posición y movimiento en la cancha', 'Bandeja y víbora'],
    comoEs: ['Clase uno a uno en cancha de Le Club Formosa.', 'Nacho arma el trabajo según tu nivel y tu objetivo.', 'Practicás con corrección en el momento.'],
    duracion: 'Cada clase dura 1 hora.',
    tamanoGrupo: 'Clase individual, uno a uno.',
    precioNota: '',
    mensajeWhatsApp: 'Hola Nacho! Quiero reservar mi clase de prueba de pádel Individual. ¿Qué días y horarios tenés?',
    faq: [
      { p: '¿Sirve si nunca jugué?', r: 'Sí. Arrancás desde cero y vas a tu ritmo.' },
      ...faqComun('individual'),
    ],
  },
  {
    slug: 'grupales',
    nombre: 'Grupales',
    corto: 'Aprendé jugando con otros.',
    imagen: 'grupales',
    paraQuien: ['Quien quiere entrenar con amigos', 'Quien busca un ambiente divertido', 'Quien quiere practicar situaciones de partido'],
    queSeTrabaja: ['Golpes y juego en pareja', 'Ubicación y comunicación con tu compañero', 'Puntos y situaciones reales de partido', 'Ejercicios en equipo'],
    comoEs: ['Grupo reducido en cancha de Le Club Formosa.', 'Ejercicios de a dos y juego de puntos.', 'Nacho corrige y ordena el trabajo de todos.'],
    duracion: 'Cada clase dura 1 hora.',
    tamanoGrupo: 'Grupos de 2, 3 o 4 personas como máximo.',
    precioNota: '',
    mensajeWhatsApp: 'Hola Nacho! Quiero reservar mi clase de prueba de pádel Grupal. ¿Qué grupos y horarios hay?',
    faq: [
      { p: '¿Puedo ir con amigos?', r: 'Sí, escribinos y armamos el grupo. Los grupos son de 2, 3 o 4 personas como máximo.' },
      ...faqComun('grupal'),
    ],
  },
  {
    slug: 'para-chicos',
    nombre: 'Para chicos',
    corto: 'Pádel con alegría, cuidado y valores.',
    imagen: 'chicos',
    paraQuien: ['Chicos que se inician en el pádel', 'Familias que buscan deporte y valores', 'Consultanos por WhatsApp según la edad de tu hijo/a'],
    queSeTrabaja: ['Coordinación y primeros golpes', 'Respeto, esfuerzo y compañerismo', 'Juego en equipo', 'Gusto por el deporte'],
    comoEs: ['Clase pensada para chicos, en cancha de Le Club Formosa.', 'Ejercicios de a poco y con juego.', 'Nacho cuida el ritmo y el clima de la clase.'],
    duracion: 'Cada clase dura 1 hora.',
    tamanoGrupo: 'Grupos de 2, 3 o 4 chicos como máximo.',
    precioNota: '',
    mensajeWhatsApp: 'Hola Nacho! Quiero reservar una clase de prueba de pádel para mi hijo/a. ¿Qué días y horarios tenés?',
    faq: [
      { p: '¿Desde qué edad pueden venir?', r: 'Consultanos por WhatsApp con la edad de tu hijo/a y te contamos.' },
      ...faqComun('para chicos'),
    ],
  },
  {
    slug: 'competencia',
    nombre: 'Competencia',
    corto: 'Entrená para ganar partidos.',
    imagen: 'competencia',
    paraQuien: ['Quien juega torneos', 'Quien quiere subir de categoría', 'Quien busca más intensidad'],
    queSeTrabaja: ['Táctica y lectura de juego', 'Golpes de definición', 'Preparación mental para partidos', 'Trabajo de situaciones de torneo'],
    comoEs: ['Entrenamiento exigente en cancha de Le Club Formosa.', 'Foco en tus puntos débiles y en tu estrategia.', 'Trabajo con objetivos claros.'],
    duracion: 'Cada clase dura 1 hora.',
    tamanoGrupo: 'Grupos de 2, 3 o 4 personas como máximo.',
    precioNota: '',
    mensajeWhatsApp: 'Hola Nacho! Quiero reservar mi clase de prueba de pádel de Competencia. ¿Qué nivel piden y qué horarios hay?',
    faq: [
      { p: '¿Qué nivel necesito?', r: 'Consultanos por WhatsApp y Nacho te orienta según tu nivel.' },
      ...faqComun('de competencia'),
    ],
  },
];

/** Utilidades */
export const waLink = (mensaje = 'Hola Nacho! Quiero reservar mi clase de prueba.') =>
  `https://wa.me/${contacto.whatsapp}?text=${encodeURIComponent(mensaje)}`;

/** Reglas del panel privado de Nacho (/panel/). No se muestran en la web pública. */
export const panel = {
  /** Lo que cobra Nacho por clase y por alumno: el mismo precio de la web (`precios.claseSuelta`, $10.000). */
  precioClase: precios.claseSuelta,
  /** Cupo inicial de un grupo nuevo (4 = una cancha de pádel); se cambia en cada clase. */
  cupoPorDefecto: 4,
  /** Si falta sin avisar, ¿se cobra la clase? Sin confirmar con Nacho: por ahora no. */
  cobraFaltaSinAviso: false,
};
