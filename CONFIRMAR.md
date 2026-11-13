# Pendientes con Nacho

## Ya confirmado y aplicado
- Duración: todas las clases duran 1 hora.
- Grupos: individual o de 2, 3 o 4 personas como máximo.
- Dirección: Freitas 768, Le Club Formosa.
- Logo: la web todavía usa `Recurso 2.png` (nav, footer y favicon, sobre pastilla crema). Ya está diseñado el logo nuevo (monograma NR) en `../05 LOGO/kit`, pendiente de aplicar.

## Sigue sin confirmar (no se muestra como pendiente en la web: se oculta o dice "Consultanos por WhatsApp")
1. Horarios de sábado y domingo (la web dice "consultanos por WhatsApp").
2. Trayectoria de Nacho: años, títulos, historia (la sección no muestra nada).
3. Instagram y YouTube (se ocultan del footer hasta cargar la URL en `src/data/academia.ts`).
4. Equipamiento para la clase de prueba (FAQ: "consultanos por WhatsApp").
5. Política de cancelación (FAQ: "avisanos por WhatsApp").
6. Precio de cada tipo de clase: hoy todas muestran los precios generales.
7. Edades de "Para chicos" (se pide consultar por WhatsApp).
8. Nivel requerido en Competencia (se pide consultar por WhatsApp).
9. Revisión de "qué se trabaja" y "cómo es la clase": redactado en términos generales de pádel.

Para volver a marcar algo como pendiente: usar `PENDIENTE` en `src/data/academia.ts`; `<Txt>` lo resalta.

## Panel de Nacho (sin confirmar)
- Precio por clase en el panel: usa `precios.claseSuelta` ($10.000 por alumno, lo confirmó Guillermo). Falta confirmar que sea igual para todos los tipos de clase.
- ¿Se cobra la clase si el alumno falta sin avisar? Hoy el panel no la cobra (`panel.cobraFaltaSinAviso`).
- ¿Cupo por grupo? El panel arranca en 4 y se cambia clase por clase.
