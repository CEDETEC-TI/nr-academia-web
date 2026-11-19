# Academia NR — web oficial

Academia de pádel de Ignacio "Nacho" Román en Le Club Formosa (Formosa, Argentina).
Stack: Astro + Tailwind CSS v4 + GSAP (ScrollTrigger) + Lenis. Deploy: GitHub Pages (repo CEDETEC-TI/nr-academia-web, base `/nr-academia-web`).

> Contexto general del proyecto (marca, logo nuevo, estado actual, pendientes): `../CLAUDE.md` e historial en `../HISTORIAL.md`.
> Logo definitivo (`a-fino-cerca.svg`): `public/logo.svg` (= `../05 LOGO/exploracion/ronda2/trazo-fino/a-fino-cerca.svg`, no modificar), siempre sobre pastilla crema en `Logo.astro`. No aplicar el kit bordó de `../05 LOGO/kit`.

## Reglas (respetar siempre)
1. **Trabajar solo en esta carpeta** (`~/Documents/ACADEMIA NR V1/01 WEB`). No leer ni reutilizar proyectos ni plantillas de CEDETEC.
2. **Datos en un solo archivo: `src/data/academia.ts`.** Nada de precios, horarios, teléfonos o textos de negocio hardcodeados en componentes.
3. **No inventar datos.** Lo desconocido se escribe `[CONFIRMAR CON NACHO]` (constante `PENDIENTE`); se renderiza con `<Txt>`.
4. **Diseño:** leer `DESIGN.md` antes de tocar estilos. Paleta bordó `#6D1A2A` + crema `#F5EBDD` + casi negro. **Nada rosado.** Tipografía: **Anton** (títulos, un solo peso, nunca negrita) + **Open Sans** (textos), instaladas con `@fontsource` (no usar Bricolage ni Figtree). Bordes redondeados, títulos enormes, textos cortos, mucha foto y video. Celular primero (390px).
5. **Movimiento:** respetar `prefers-reduced-motion` (sin Lenis, sin reveals, sin video, solo póster). Animar solo `transform`/`opacity`. Sin `transition: all`.
6. **Materiales:** los originales viven en `../03 MATERIALES ORIGINALES` (dentro de `~/Documents/ACADEMIA NR V1`) y **nunca se tocan**. Se optimizan copias en `src/assets`: hero < 5 MB escritorio y < 2 MB celular; imágenes WebP/AVIF.
7. **Sin fotos de stock:** hoy todo el material es real de Nacho en Le Club (ya no queda nada de Pexels). Si alguna vez hace falta una provisoria (Unsplash/Pexels, sin marcas), se anota en `PROVISORIOS.md`.
8. **Calidad:** probar con Playwright en 390px y 1440px sin errores de consola; Lighthouse ≥ 90 en rendimiento y accesibilidad (`npm run test:e2e`).
9. Rutas internas con `url()` de `src/utils.ts` (respeta el base de GitHub Pages).
10. No publicar ni pushear a repos públicos sin confirmación explícita del dueño.
11. **Cancha:** no publicar el precio de la cancha ni decir que la cancha se paga (ni en textos, ni en FAQ, ni en datos estructurados). Lo habla Nacho en persona. Los textos de la clase de prueba salen de `prueba` en `academia.ts`.
12. **Repo público:** nada de mails personales, claves ni tokens en archivos del repo (los usuarios del panel se nombran por rol, no por mail).
13. Logo: `public/logo.svg` = `a-fino-cerca.svg`, tal cual, sobre pastilla crema.
14. Datos confirmados (19/11): **"Más de 30 alumnos"** y **4 canchas** (franja de números del inicio). Sábados de 8 a 12 hs.

## Cuaderno de Pádel (`/cuaderno/`)
- App de seguimiento de pádel integrada como página propia. Lógica en `src/scripts/cuaderno.js` (vanilla JS del original), estilos en `src/styles/cuaderno.css` acotados a `#cuaderno` con los tokens NR. Documentación original en `docs/CUADERNO.md`.
- Guarda en `localStorage` (`padel-cuaderno-v1`) si no hay sesión; con cuenta (`/cuenta/`) guarda en Supabase por usuario (RLS) y ofrece subir lo que había en el navegador. Cada persona ve solo lo suyo.
- Es para **cualquier alumno** de NR: nada personalizado a un jugador. El plan semanal y el horario los carga cada alumno en la Ficha (`plan1`…`plan5`, `horario`).
- Reglas: nunca escribir "drive" (usar "golpe de derecha" / "golpe de revés"); solo los entrenamientos cuentan como días entrenados.
- La página usa `<Base app>`: header siempre sólido, sin Lenis y sin botón flotante de WhatsApp.

## Panel de Nacho (`/panel/`)
- Sistema privado de **clases grupales, alumnos, asistencia y cobros** (noindex; el enlace del menú aparece solo si la cuenta es de Nacho). Pantallas: Hoy, Semana, Alumnos, Cobros. Modelo y reglas en `docs/PANEL.md`.
- Modelo: Alumno ── Inscripción ── Clase (con cupo); Clase + fecha = Sesión con Asistencia; cada clase a la que vino se cobra (`precios.claseSuelta`, $10.000) y los pagos descuentan.
- Solo entra la cuenta con rol `nacho`. Datos en Supabase con Row Level Security (`supabase/migrations/`, tablas del panel + `perfiles` + cuaderno); sin claves (`PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`) funciona en modo demo (localStorage). Reglas de negocio (precio, cupo, cobro de faltas) en `panel` de `academia.ts`.
- Los horarios salen de `horarios.franjas`. Nunca usar ni commitear la `service_role` key. Conexión, roles y pruebas: `docs/PANEL.md`.

## Cuentas (`/cuenta/`)
- Registro de alumnos con mail y contraseña (confirmación por mail), login, recuperar y cambiar contraseña. Lógica en `src/scripts/auth.ts` y `cuenta.ts`. Todo usuario nuevo es `alumno`; `nacho` solo lo asigna la API de administración. `/cuenta/` y `/panel/` son noindex.

## Comandos
`npm run dev` · `npm run build` · `npm run preview` · `npm run test:e2e` · `npm run test:panel` · `node tests/cuenta.mjs` (base real) · `npm run lighthouse`
