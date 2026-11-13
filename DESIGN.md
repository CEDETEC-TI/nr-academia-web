# Academia NR — dirección visual

Skill usada: **frontend-design**. Referencia de estructura (no de textos ni imágenes): aforpa.com.ar — video de fondo, mucho aire, estética limpia.

## Idea
La cancha es el sistema. Todo el sitio usa las **líneas de una cancha de pádel** como lenguaje estructural: filetes finos crema que dividen secciones, esquinas de "línea de saque" en las tarjetas, y una cuadrícula que recuerda el trazado. Las fotos y videos son de verdad (Le Club, canchas rojas y azules, Nacho trabajando), así que el diseño se queda quieto y deja que el material hable.

Lo memorable (se gasta la audacia en un solo lugar): **el hero**. Video vertical a pantalla completa, virado a bordó, con el título gigante pegado abajo a la izquierda y el botón "Reservá tu clase". Todo lo demás es calmo.

## Color (paleta cerrada por el brief, nada rosado)
| Token | Hex | Uso |
|---|---|---|
| bordó | #6D1A2A | fondo de marca, botones, secciones oscuras |
| bordó profundo | #4A1019 | overlays, hover, texto sobre crema fuerte |
| crema | #F5EBDD | fondo principal, texto sobre bordó |
| crema oscura | #E9DAC4 | tarjetas sobre crema, divisores |
| tinta | #1B1416 | texto (casi negro con una pizca cálida de bordó) |
| arcilla de cancha | #B5452F | solo acento mínimo (puntos, estados), nunca fondo |

El rojo de las canchas de Le Club vive en las fotos; la web no lo imita.

## Tipografía (autoalojada, sin pedir nada a Google)
- **Bricolage Grotesque** (variable, con eje de ancho): títulos enormes, muy apretados, peso 700–800. Es una grotesca con carácter deportivo, no una serifa.
- **Figtree**: texto corrido, claro y legible en celular.
- Escala fluida con `clamp()`: títulos de hasta ~11vw en celular. Líneas de texto < 65 caracteres.
- Se evita: una palabra en cursiva o color dentro del título, etiquetas en MAYÚSCULAS sobre cada título, numeración 01/02/03 donde no hay secuencia.

## Layout
- Alineación a la izquierda; lo único centrado es el cierre de WhatsApp.
- Celular primero (390px): una columna, tarjetas de clase de alto completo apiladas, galería con scroll horizontal por snap.
- Escritorio (1440px): rejilla de 12 columnas, tarjetas de clase en 2×2, Nacho en dos columnas.
- Radios: grandes (28–40px) en tarjetas y medios; botones en píldora.

```
HERO (100svh)            FRANJA            CLASES
┌──────────────────┐   ┌─────────────┐   ┌─────┬─────┐
│ video + bordó    │   │+30 │ 4 │ $0 │   │ Ind │ Gru │
│                  │   └─────────────┘   ├─────┼─────┤
│ Título gigante   │                     │ Chi │ Com │
│ [Reservá tu clase]                     └─────┴─────┘
└──────────────────┘
```

## Movimiento (se detalla con las skills de Emil Kowalski)
- Un solo momento orquestado: entrada del hero (título por líneas, botón al final).
- Reveal al scroll: solo en bloques grandes, corto, sin rebote.
- Contadores de la franja de datos al entrar en pantalla.
- Hover de tarjetas solo en dispositivos con hover; en táctil, feedback al presionar.
- Transición entre páginas con View Transitions de Astro.
- `prefers-reduced-motion`: sin parallax, sin contadores animados, sin autoplay del video (queda el póster).

## Revisión del plan contra los "tics" genéricos
- Crema + serifa + terracota: la paleta crema viene del brief, pero se evitó la serifa y el acento terracota como protagonista; el contraste lo da el bordó y una grotesca.
- Tarjetas SaaS idénticas: las tarjetas de clase llevan foto/video propio, esquinas con marca de cancha y tamaños distintos según el contenido.
- Mono, flechas "→" en todos los botones, eyebrows en mayúsculas: fuera.

## Contenido
Textos cortos, voz directa, español rioplatense ("Reservá", "Jugá"). No se inventan datos: lo no confirmado queda como `[CONFIRMAR CON NACHO]` en `src/data/academia.ts`.
