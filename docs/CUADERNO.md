> **Versión NR Academia (nov 2026):** integrada en `/cuaderno/` y hecha genérica para los alumnos. El plan semanal y el horario ya no son fijos: los carga cada alumno en la Ficha. Se quitó la guía "fútbol → pádel" y el enlace al plan privado. Los estilos usan la paleta NR. El resto de este documento describe el original.

# Cuaderno de Pádel: informe para Claude Code

App de seguimiento de pádel. Registra partidos, torneos, entrenamientos, físico y mental, y muestra el progreso con KPIs y gráficos.

## Archivos

| Archivo | Qué es |
| --- | --- |
| `index.html` | Toda la app en un solo archivo: HTML, CSS y JS sin dependencias ni build |
| `INFORME.md` | Este documento |

## Cómo correrla

1. Abrí `index.html` en el navegador (doble clic o `npx serve .`).
2. Fuera de claude.ai no existe `window.claude`, así que la app guarda en `localStorage` con la clave `padel-cuaderno-v1`. Arriba a la izquierda dice "Guardado en este navegador".
3. Arranca vacía: la Ficha se completa desde la propia app.

## Arquitectura

- **Estado:** un objeto global `S` con las colecciones `partidos`, `torneos`, `entrenos`, `fisico`, `mental` y `ficha`, más el estado de UI (`open`, `editing`, `ctx`, `confirm`, `chart`, `day`, `opened` y `closed`).
- **Persistencia:** `saveEntry(col,id,data)` y `deleteEntry(col,id)`. Si existe `window.claude.use("db")` usa esa base (estilo Firestore: `collection().doc().set()` y `onSnapshot`). Si no, usa `localStorage` mediante `lsLoad`/`lsSave`. **Este es el punto a reemplazar para migrar a un backend real** (Supabase, Firebase, etc.).
- **Render:** `render()` reemplaza el `innerHTML` de `#view` según el hash (`route()` + `subId()`). Las vistas son funciones que devuelven strings: `vInicio`, `vPartidos`, `vTorneos`, `vTorneo(id)`, `vEntrenos`, `vFisico`, `vMental`, `vHistorial` y `vFicha`.
- **Rutas:** `#inicio`, `#partidos`, `#torneos`, `#torneos/<id>` (detalle del torneo), `#entrenos`, `#fisico`, `#mental`, `#historial` y `#ficha`.
- **Eventos:** se delegan en `document`.
  - Los clics usan `data-act`: `new`, `edit`, `del`, `tnew`, `tedit`, `tedit2`, `zona`, `chart`, `day`, `step`, etc.
  - `submit` guarda el formulario.
  - `toggle` recuerda qué desplegables quedaron abiertos.
- **Formularios:** se generan desde `SPECS[col]`, una lista de campos `{k,label,type,...}`.
  - Tipos: `date`, `text`, `textarea`, `select` (cápsulas), `range` (escala en cápsulas), `number` (stepper − / +, con `pct:true` muestra el %), `checks` y `score` (marcador set por set con tie-break y súper tie-break).
  - Los encabezados de sección son `{sec:"..."}`.

## Modelo de datos

**partidos:** `fecha` (YYYY-MM-DD), `tipo` (Amistoso/Americano/Liga/Torneo), `companero`, `rivales`, `ronda` (—/Zona/32avos…/Final), `resultado` ("6-2 6-4"), `sets` [{a,b}], `tercero`, `gano` (Ganado/Perdido), `enf` (errores no forzados), `winners`, `saques`/`restos`/`globos`/`bandejasP` (de 10), `nevera` 0-5, `respNevera` 1-5, `ansiedad` 1-10, `nota` 1-10, `lectura`, `funciono`, `mejorar`, `torneoId`, `creado`.

**torneos:** `nombre`, `club`, `fecha`, `fechaFin`, `categoria`, `companero`, `formato` (Zonas + eliminación / Eliminación directa / Americano / Liga), `cuadro` (Auto/32avos…/Semifinal), `instancia` (En juego / Fase de grupos / 32avos… / Final / Campeón), `clasificado` (bool), `puntos`, `objetivo`, `balance`.

**entrenos:** `fecha`, `foco`, `tipo`, `minutos`, `potencia` 1-5, `bandejas`/`bajas`/`globosE` (de 10), `sensacion` 1-5, `golpes` [], `notas`.

**fisico:** `fecha`, `split` (%), `explosivo` 1-5, `rodilla` 0-10, `tobillo` 0-10, `superficie`, `trabajo` [], `notas`.

**mental:** `fecha`, `tipo`, `situacion`, `senti`, `hice`, `proxima`, `control` 1-10.

**ficha:** perfil y metas (`metaBandejas` 7, `metaSplit` 80, `metaEnf` 30).

## Lógica clave

- **`metrics()`:** calcula los KPIs de Inicio. Solo los **entrenos** cuentan como días entrenados; los partidos no.
- **`rendimiento(p)`:** el % del partido. Es el promedio de `nota/10`, `(respNevera-1)/4`, `1-(ansiedad-1)/9` y los conteos de 10 que haya cargado.
- **`torneoFase(t,pt)`:** devuelve las fases (Zona → 8vos → 4tos → Semi → Final), la fase actual, si terminó y el texto de estado. Alimenta la barra de avance.
- **`avanzarTorneo(p)`:** cierra solo el torneo cuando se pierde en llave o se gana la final.
- **`cuadroHTML(t,pt,bare)`:** dibuja la llave de dos lados con tarjetas en posición absoluta y conectores en SVG.
- **`torneoPartidos(t)`:** junta los partidos por `torneoId`, o por rango de fechas con tipo Torneo.

## Diseño

- **Tema:** claro siempre, tipo "analítica deportiva premium". Los tokens están en `:root`: `--bg #f6f7fa`, `--fg #05070d`, `--accent #0a64ff` (azul eléctrico), `--good #00b26a` (verde cyber), `--bad #ff2952` (rojo láser), `--shadow` y `--shadow-h`. Hay una variante oscura opcional en `[data-theme=dark]`.
- **Tipografías:** Inter para el texto y Roboto Mono para los números (Google Fonts).
- **Estilo:** tarjetas sin bordes con sombras suaves.
- **Responsive:** en compu, riel lateral de 220 px; en 860 px o menos, barra superior con pestañas que se deslizan.
- **Divulgación progresiva:** listas con desplegables (`details.entry`, `details.tm`, `details.fold`). Los torneos van en 3 niveles: lista, página del torneo y detalle.
- **CSS:** la hoja tiene un bloque base y al final un bloque "skin: pro analytics" que lo pisa. Si se refactoriza, conviene fusionarlos.

## Reglas del usuario (no romper)

- El jugador juega de **revés**. Nunca escribir "drive": usar "golpe de derecha" o "golpe de revés".
- Solo los entrenamientos cuentan como días entrenados.
- Español rioplatense en toda la interfaz.
- Plan: lunes a viernes a las 10:00, 60 minutos.
  - Lunes: bandeja.
  - Martes: físico + bolas bajas.
  - Miércoles: víbora/potencia.
  - Jueves: paredes/nevera/mental.
  - Viernes: partido.

## Próximos pasos sugeridos

1. Separar en `index.html`, `styles.css` y módulos JS (`state`, `storage`, `views/`, `forms`).
2. Reemplazar `saveEntry`/`deleteEntry`/`start` por un backend real, para tener login y sincronizar entre celu y compu.
3. Convertirla en PWA (manifest + service worker) para instalarla en el celu y usarla sin conexión.
4. Exportar e importar los datos en JSON desde la Ficha.

## Prompt para pegarle a Claude Code

> Tengo esta app de seguimiento de pádel en `index.html` (un solo archivo, vanilla JS). Leé `INFORME.md` primero. Quiero [tu objetivo, por ejemplo: separarla en archivos y convertirla en una PWA con datos en Supabase], sin cambiar el diseño ni las reglas del informe.
