# Cuaderno de Pádel (versión simple, 19/11/2026)

Una **entrada por día de entrenamiento**, con tres cosas y nada más:

| Campo | Qué es |
| --- | --- |
| `fecha` | Día del entrenamiento (por defecto hoy) |
| `trabaje` | Qué trabajé hoy |
| `costo` | Qué me costó |
| `proxima` | Qué practico para la próxima |

Reemplaza al cuaderno anterior (partidos, torneos, entrenos, físico, mental, KPIs y gráficos). Ese código (`cuaderno.js`, `cuaderno.css`) está en el historial de git.

## Dónde se guarda
- **Sin cuenta:** `localStorage`, clave `nr-cuaderno-v2`. Al abrir el cuaderno nuevo por primera vez, si hay datos del cuaderno anterior (`padel-cuaderno-v1`) se convierten solos; **el original no se toca ni se borra**.
- **Con cuenta:** tabla `cuaderno_notas` de Supabase (RLS por dueño; Nacho solo lee). Si en el navegador hay entradas que no están en la cuenta, aparece el botón "Subirlas a mi cuenta".
- La migración SQL (`supabase/migrations/20261119000000_…`) copia lo que ya estaba en la nube (`cuaderno_entradas`) a `cuaderno_notas` sin borrar nada. Equivalencias: entrenos → *trabajé* (foco, tipo, minutos y notas); partidos → *trabajé* (rivales, resultado, qué funcionó) y *costó* (qué mejorar); mental → *trabajé* (situación y qué hice), *costó* (cómo me sentí) y *próxima*; físico → *trabajé* (notas); torneos → *trabajé* (nombre, instancia, balance) y *próxima* (objetivo). Lo que no entra en estos tres campos (puntajes, métricas, el plan semanal de la vieja Ficha) queda solo en las tablas viejas.

## Código
`src/pages/cuaderno.astro` (página y estilos) · `src/scripts/cuaderno.ts` (lógica). Regla: nunca escribir "drive" (usar "golpe de derecha" / "golpe de revés").
