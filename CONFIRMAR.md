# Pendientes con Nacho

## Ya confirmado y aplicado
- Textos de clases, Por qué Academia NR, Soy Nacho (trayectoria: 3ª categoría, +10 años, +5 formando, profesorado APA) y horarios (L a V mañana y tarde, sábados de 8 a 12): redactados por Nacho, 15/11.
- Duración: todas las clases duran 1 hora.
- Grupos: individual o de 2, 3 o 4 personas como máximo.
- Dirección: Freitas 768, Le Club Formosa.
- Logo: definitivo `a-fino-cerca.svg` (ya aplicado en header, footer, favicons y og:image, sobre pastilla crema). El monograma NR de `../05 LOGO/kit` quedó en pausa.
- Tipografía: Anton (títulos) + Open Sans (textos), ya integradas.
- Números del inicio (19/11): **"Más de 30 alumnos"** y **4 canchas**.
- Fotos: ya no hay material de stock (Pexels); todo es de Nacho.
- Regla: **no se publica el precio de la cancha ni que la cancha se paga.** La clase de prueba es "gratis" y los detalles los habla Nacho.

## Sigue sin confirmar (no se muestra como pendiente en la web: se oculta o dice "Consultanos por WhatsApp")
1. Domingos: Nacho solo mencionó sábados (de 8 a 12, confirmado el 19/11).
2. YouTube (se oculta del footer hasta cargar la URL en `src/data/academia.ts`). Instagram y TikTok de la academia (@academia.nr_) ya cargados el 15/11.
3. Equipamiento para la clase de prueba (FAQ: "consultanos por WhatsApp").
4. Política de cancelación (FAQ: "avisanos por WhatsApp").
5. Precios: Individuales $20.000 la clase y $160.000 las 8 (pedido de Nacho, 15/11). Grupales, chicos y competencia siguen con $10.000 y $80.000: falta confirmar con Nacho.
6. Edades de "Para chicos" (se pide consultar por WhatsApp).
7. Nivel requerido en Competencia (se pide consultar por WhatsApp).
8. Textos de las clases, "Por qué Academia NR" y "Soy Nacho": los redactó Nacho (15/11) y están aplicados tal cual, con ortografía corregida. En "Para chicos" no mandó "para quién es" ni "qué se trabaja": se sacaron.

Para volver a marcar algo como pendiente: usar `PENDIENTE` en `src/data/academia.ts`; `<Txt>` lo resalta.

## Panel de Nacho (sin confirmar)
- Precio por clase en el panel: usa `precios.claseSuelta` ($10.000 por alumno, lo confirmó Guillermo). Falta confirmar que sea igual para todos los tipos de clase.
- ¿Se cobra la clase si el alumno falta sin avisar? Hoy el panel no la cobra (`panel.cobraFaltaSinAviso`).
- ¿Cupo por grupo? El panel arranca en 4 y se cambia clase por clase.
