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
    'Academia de pádel de Nacho Román en Le Club Formosa. Clases individuales, grupales, para chicos y de competencia. Clase de prueba gratis.',
  paraTodos: ['Chicos', 'Mujeres', 'Principiantes', 'Competidores'],
};

export const contacto = {
  whatsapp: '5493704610720',
  telefono: '+54 370 461 0720', // para Google (datos estructurados); el botón de WhatsApp usa `whatsapp`
  direccion: 'Freitas 768, Le Club Formosa',
  direccionMapa: 'Freitas 768, Formosa, Argentina',
  tiktok: { usuario: '@academia.nr_', url: 'https://www.tiktok.com/@academia.nr_' },
  instagram: { usuario: '@academia.nr_', url: 'https://www.instagram.com/academia.nr_' },
  youtube: { usuario: '', url: '' }, // sin confirmar: no se muestra hasta tener URL
};

/** Precios generales (grupales, para chicos y competencia). */
export const precios = {
  claseSuelta: 10000,
  mes8Clases: 80000,
  clasePrueba: 'Gratis',
};
/** Individuales (pedido de Nacho, 15/11): clase suelta y 8 clases. */
export const preciosIndividual = {
  claseSuelta: 20000,
  mes8Clases: 160000,
};

/** Clase de prueba gratis. Lo de la cancha NO se publica: lo habla Nacho en persona. Todos los textos salen de acá. */
export const prueba = {
  titulo: 'Clase de prueba gratis.',
  frase: 'La clase de prueba es gratis.',
  cierre: 'La primera clase es gratis.',
  etiquetaHero: 'Primera clase gratis · Formosa',
  botonHero: 'Reservá tu clase gratis por WhatsApp',
  faq: 'No pagás la clase: la de prueba es gratis. Los detalles los coordinás con Nacho.',
};

export const horarios = {
  dias: 'Lunes a viernes',
  franjas: ['8 a 12 hs', '14 a 20 hs'], // mañana y tarde
  finDeSemana: 'Sábados de 8 a 12 hs.',
};

/** Los mismos horarios en formato de Google (schema.org). Tienen que coincidir con `horarios` de arriba. */
export const horariosSchema = [
  { dias: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], abre: '08:00', cierra: '12:00' },
  { dias: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], abre: '14:00', cierra: '20:00' },
  { dias: ['Saturday'], abre: '08:00', cierra: '12:00' },
];

export const datos = [
  { valor: 30, prefijo: 'Más de ', etiqueta: 'alumnos' }, // "Más de 30 alumnos" (decidido por Guillermo, 19/11)
  { valor: 4, prefijo: '', etiqueta: 'canchas' },
  { texto: 'Gratis', etiqueta: 'clase de prueba' },
] as const;

/** Texto de "Por qué Academia NR" (encabezado principal). */
export const porQue = {
  titulo: 'Por qué Academia NR',
  intro: 'Para todos: chicos, mujeres, principiantes y competidores. Un espacio diseñado para potenciar tu nivel sin importar dónde arranques.',
};

export const diferencial = [
  { titulo: 'Metodología y táctica', texto: 'No solo mejoramos tus golpes: te enseñamos a leer la dificultad de cada pelota para tomar siempre la decisión correcta en el partido.' },
  { titulo: 'Disponibilidad', texto: 'Nacho está para vos de lunes a viernes, mañana y tarde, y sábados de 8 a 12, adaptándose a tus horarios para que no te quedes sin entrenar.' },
  { titulo: 'Ganas', texto: 'Cada clase se prepara y se da con la misma energía, juegues como juegues. Entrenamientos dinámicos donde combinamos técnica, táctica y objetivos claros.' },
  { titulo: 'Responsabilidad', texto: 'Puntualidad, seguimiento constante y compromiso absoluto con tu progreso y evolución en la cancha.' },
  { titulo: 'Valores', texto: 'Respeto, esfuerzo y compañerismo dentro y fuera de la cancha. Formamos mejores jugadores y mejores personas.' },
];

export const nacho = {
  intro:
    'Soy Nacho, profe de pádel en Le Club Formosa. Jugador competitivo de 3ª categoría con más de 10 años de trayectoria en las canchas y más de 5 años formando jugadores. Cuento con el profesorado licenciado por la APA (Asociación de Pádel Argentino).',
  parrafos: [
    'Dar clases y enseñar es mi verdadera pasión y lo que mejor se me da. Soy una persona de observar demasiado cada detalle, corregir con constancia y tenerle la paciencia necesaria a cada alumno para que avance seguro.',
    'Mi objetivo es simple: enseñarte a leer el juego, potenciar tu técnica y llevar tu nivel al máximo para que disfrutes y ganes cada partido.',
  ],
};

/** Un ítem de lista: con título en negrita (`t`) y texto (`d`), o solo texto. */
export type Item = { t?: string; d: string };
/** Bloque de una página de clase (título + lista y/o párrafo). */
export interface Seccion { titulo: string; items?: Item[]; texto?: string }

export interface Clase {
  slug: string;
  nombre: string;
  corto: string;
  imagen: string; // nombre de archivo en src/assets/img (sin extensión)
  video?: string; // clip en src/assets/video (sin extensión; hay .mp4 y .webm) y póster `<video>-poster` en src/assets/img
  /** Bloques antes de "Cómo es la clase" (Para quién es, Qué se trabaja, etc.). Pueden no existir. */
  secciones: Seccion[];
  comoEs: Item[];
  /** Si es true, "Cómo es la clase" se muestra como pasos numerados. */
  comoEsNumerado?: boolean;
  duracion: string;
  tamanoGrupo: string;
  /** Precio de esta clase (si no se indica, el general). */
  precios: { claseSuelta: number; mes8Clases: number };
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
    corto: 'Atención 100% personalizada para acelerar tu evolución en la cancha.',
    imagen: 'individuales',
    video: 'individuales-clip',
    secciones: [
      {
        titulo: 'Para quién es',
        items: [
          { t: 'Quien quiere avanzar rápido', d: 'Sin depender del ritmo de una clase grupal, enfocados netamente en tus objetivos.' },
          { t: 'Quien empieza y prefiere ir a su ritmo', d: 'Ideal para ganar confianza desde cero con un seguimiento exclusivo.' },
          { t: 'Quien necesita corregir un golpe puntual', d: '¿No te sale la bandeja, la víbora o sufrís con la pared de fondo? Lo trabajamos de raíz.' },
        ],
      },
      {
        titulo: 'Por qué elegir una clase 1 a 1',
        items: [
          { t: 'Más impacto de pelota', d: 'Al ser individual, tocás la pelota muchísimas más veces que en un grupo.' },
          { t: 'Corrección al instante', d: 'Cada error de postura o empuñadura se corrige en el momento para no fijar vicios malos.' },
          { t: 'Plan a tu medida', d: 'La clase se arma 100% en base a tus fortalezas y debilidades.' },
        ],
      },
    ],
    comoEs: [
      { t: 'Diagnóstico inicial', d: 'Analizamos qué necesitás corregir o potenciar.' },
      { t: 'Bloque técnico / táctico', d: 'Ejercicios específicos con cubos de pelotas y situaciones reales de partido.' },
      { t: 'Feedback final', d: 'Resumen de lo trabajado y objetivos para la siguiente clase.' },
    ],
    comoEsNumerado: true,
    duracion: 'Cada clase dura 1 hora.',
    tamanoGrupo: 'Clase individual, uno a uno.',
    precios: { claseSuelta: preciosIndividual.claseSuelta, mes8Clases: preciosIndividual.mes8Clases },
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
    corto: 'Clases dinámicas enfocadas en situaciones reales de juego.',
    imagen: 'grupales',
    video: 'grupales-clip',
    secciones: [
      {
        titulo: 'De qué se trata',
        items: [
          { d: 'Armado de grupos según niveles compatibles para que todos compitan y evolucionen a la par.' },
          { d: 'Combinación de ejercicios tácticos con puntos en situación real.' },
        ],
      },
      {
        titulo: '¿Cómo armamos los grupos?',
        texto: 'Podés venir con tu pareja o grupo armado, o te sumamos a un grupo que se adapte perfectamente a tu nivel de juego.',
      },
    ],
    comoEs: [
      { d: 'Grupo reducido en cancha de Le Club Formosa.' },
      { t: 'Trabajo técnico y táctico', d: 'Combinamos ejercicios de a dos y juego de puntos orientados a situaciones reales.' },
      { t: 'Toma de decisiones', d: 'Te enseñamos a leer la dificultad de cada pelota que te viene para elegir el golpe y el objetivo correcto (definir, construir el punto o jugar con margen).' },
      { d: 'Nacho corrige la técnica al instante y ordena el trabajo de todo el grupo.' },
    ],
    duracion: 'Cada clase dura 1 hora.',
    tamanoGrupo: 'Grupos de 2, 3 o 4 personas como máximo.',
    precios: { claseSuelta: precios.claseSuelta, mes8Clases: precios.mes8Clases },
    precioNota: '',
    mensajeWhatsApp: 'Hola Nacho! Quiero reservar mi clase de prueba de pádel Grupal. ¿Qué grupos y horarios hay?',
    faq: [
      { p: '¿Puedo ir con amigos?', r: 'Sí, podés venir con tu pareja o grupo armado. Escribinos y lo coordinamos.' },
      ...faqComun('grupal'),
    ],
  },
  {
    slug: 'para-chicos',
    nombre: 'Para chicos',
    corto: 'Clases dinámicas y divertidas, con cuidado y valores.',
    imagen: 'chicos-clip-poster',
    video: 'chicos-clip',
    secciones: [],
    comoEs: [
      { d: 'Clases dinámicas y divertidas en cancha de Le Club Formosa.' },
      { t: 'Aprendizaje con objetivos', d: 'Combinamos coordinación y técnica básica con juegos tácticos adaptados a su edad.' },
      { t: 'Toma de decisiones temprana', d: 'Les enseñamos a leer la pelota para que entiendan cómo jugar y a dónde dirigirla según la situación.' },
      { d: 'Seguimiento personalizado de Nacho para que avancen seguros y motivados.' },
    ],
    duracion: 'Cada clase dura 1 hora.',
    tamanoGrupo: 'Cupos reducidos para una mejor atención.',
    precios: { claseSuelta: precios.claseSuelta, mes8Clases: precios.mes8Clases },
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
    imagen: 'competencia-clip-poster',
    video: 'competencia-clip',
    secciones: [
      {
        titulo: 'Qué se trabaja',
        items: [
          { d: 'Técnica, táctica y lectura de juego (orientado a la dificultad de la pelota y el posicionamiento).' },
          { d: 'Golpes de definición y construcción del punto.' },
          { d: 'Preparación mental para partidos y manejo de la presión.' },
          { d: 'Trabajo de situaciones reales de torneo.' },
        ],
      },
      {
        titulo: 'Para quién es',
        items: [
          { d: 'Quien juega torneos y busca un salto de calidad en su juego.' },
          { d: 'Quien quiere subir de categoría y necesita corregir errores finos.' },
          { d: 'Quien busca alta intensidad física y mental en cada entrenamiento.' },
          { d: 'Jugadores que quieren aprender a leer mejor los partidos y tomar decisiones correctas bajo presión.' },
        ],
      },
    ],
    comoEs: [
      { d: 'Entrenamiento exigente en cancha de Le Club Formosa.' },
      { t: 'Foco', d: 'En tus puntos débiles y en tu estrategia personal de juego.' },
      { t: 'Trabajo con objetivos claros', d: 'Aprendés a leer la dificultad de cada pelota para tomar la decisión correcta (cuándo apretar, cuándo construir y cuándo defender).' },
      { t: 'Simulación de presión', d: 'Situaciones reales de torneo y preparación mental para partidos.' },
    ],
    duracion: 'Cada clase dura 1 hora.',
    tamanoGrupo: 'Grupos de 2, 3 o 4 personas como máximo.',
    precios: { claseSuelta: precios.claseSuelta, mes8Clases: precios.mes8Clases },
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
  /** Lo que cobra Nacho por clase y por alumno: el mismo precio de la web (`precios.claseSuelta`, $10.000; las individuales cuestan $20.000 en la web, el panel es de clases grupales). */
  precioClase: precios.claseSuelta,
  /** Cupo inicial de un grupo nuevo (4 = una cancha de pádel); se cambia en cada clase. */
  cupoPorDefecto: 4,
  /** Si falta sin avisar, ¿se cobra la clase? Sin confirmar con Nacho: por ahora no. */
  cobraFaltaSinAviso: false,
};
