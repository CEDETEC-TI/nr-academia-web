# Pendientes con Nacho

## Ya confirmado y aplicado
- Textos de clases, Por qué Academia NR, Soy Nacho (trayectoria: 3ª categoría, +10 años, +5 formando, profesorado APA) y horarios (L a V mañana y tarde, sábados por la mañana): redactados por Nacho, 15/11.
- Duración: todas las clases duran 1 hora.
- Grupos: individual o de 2, 3 o 4 personas como máximo.
- Dirección: Freitas 768, Le Club Formosa.
- Logo: la web todavía usa `Recurso 2.png` (nav, footer y favicon, sobre pastilla crema). Ya está diseñado el logo nuevo (monograma NR) en `../05 LOGO/kit`, pendiente de aplicar.

## Sigue sin confirmar (no se muestra como pendiente en la web: se oculta o dice "Consultanos por WhatsApp")
1. Domingos: Nacho solo mencionó sábados a la mañana (la web dice "Sábados por la mañana.").
2. YouTube (se oculta del footer hasta cargar la URL en `src/data/academia.ts`). Instagram y TikTok de la academia (@academia.nr_) ya cargados el 15/11.
3. Equipamiento para la clase de prueba (FAQ: "consultanos por WhatsApp").
4. Política de cancelación (FAQ: "avisanos por WhatsApp").
5. Precio de cada tipo de clase: hoy todas muestran los precios generales.
6. Edades de "Para chicos" (se pide consultar por WhatsApp).
7. Nivel requerido en Competencia (se pide consultar por WhatsApp).
8. Textos de las clases, "Por qué Academia NR" y "Soy Nacho": los redactó Nacho (15/11) y están aplicados tal cual, con ortografía corregida. En "Para chicos" no mandó "para quién es" ni "qué se trabaja": se sacaron.

Para volver a marcar algo como pendiente: usar `PENDIENTE` en `src/data/academia.ts`; `<Txt>` lo resalta.

## Panel de Nacho (sin confirmar)
- Precio por clase en el panel: usa `precios.claseSuelta` ($10.000 por alumno, lo confirmó Guillermo). Falta confirmar que sea igual para todos los tipos de clase.
- ¿Se cobra la clase si el alumno falta sin avisar? Hoy el panel no la cobra (`panel.cobraFaltaSinAviso`).
- ¿Cupo por grupo? El panel arranca en 4 y se cambia clase por clase.
