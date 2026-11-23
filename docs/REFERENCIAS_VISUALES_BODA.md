# REFERENCIAS_VISUALES_BODA.md — Michelle & René

**Origen**: PDF de invitación proporcionado por el usuario (9 páginas) e imagen del monograma M&R adjunta. **Uso autorizado**: tomar referencias **aisladas**; NO reproducir el diseño del PDF ni trasladar su contenido al sitio.

## Qué rescatar
| Fuente visual | Rasgo útil | Aplicación sugerida |
|---|---|---|
| Imagen de monograma y PDF p. 1 | M&R entrelazado, serif fina de alto contraste y ampersand caligráfico | Identidad secundaria y **favicon**, respetando silueta/proporciones. Fuente local: `docs/referencias/monograma-mr-referencia.png` |
| PDF pp. 2–3 | Contraste entre título manuscrito expresivo y serif editorial; fondo cálido tipo papel | Jerarquía de títulos/firmas; no usar caligrafía larga en etiquetas o instrucciones |
| PDF pp. 2, 3, 6, 7 y 9 | Dibujos de flores/ramas con un solo trazo fino, especialmente en esquinas | Ilustraciones SVG propias, escasas y de bajo contraste, sin cubrir texto o controles |
| PDF pp. 2, 3 y 7 | Aire visual, composición elegante y ornamentos espaciados | Reinterpretar márgenes, ritmo y materiales, **no** copiar la composición |

## Qué NO usar
- **No copiar**: diseños de páginas, cronología, RSVP, ceremonia, lugares, horarios, hospedaje, regalos, códigos QR de la invitación, datos familiares, datos bancarios ni otras secciones informativas.
- El sitio funciona **durante la fiesta**, con tres tareas: compartir fotos/videos, firmar libro y ver álbum. No es una invitación digital.
- No subir el PDF original a GitHub ni incluirlo en el kit: contiene información personal y financiera. No extraer esa información para el frontend.
- Los nombres exactos de fuentes **no pueden deducirse con certeza** de imágenes del PDF. Reutilizar primero Cormorant Garamond, Alex Brush y Plus Jakarta Sans del proyecto; evaluar visualmente antes de reemplazar.

## Favicon: especificación
1. Referencia suministrada: monograma blanco/marfil M&R sobre fondo fotográfico verde oscuro, con letras serif altas y ampersand central curvilínea. **No** sustituir por un logo genérico ni letras en tipografía estándar.
2. Preparar preferentemente variante SVG con trazos/silueta fiel (si existe vector de origen, usarlo), y PNG de respaldo en 32/48 px. Respetar legibilidad a 16 px: si el detalle se pierde, mostrar una **propuesta de ajuste óptico** para aprobación, conservando identidad.
3. Para fondo usar, si hace falta, un tono ya presente en proyecto: oliva oscuro `#2D3A27` o `#171E14`; monograma marfil `#FAF7F2`. No introducir colores sin permiso.
4. Integración futura: comprobar `views/partials/pwa_head.php`; cambiar **favicon de pestaña**, sin dar por hecho que los iconos de PWA o apple-touch deben cambiar.

## Dirección de experiencia
«Álbum vivo editorial»: el usuario llega por QR y ve de inmediato **Compartir momentos**, **Firmar el libro** y **Ver álbum**. Fotografía en portada con tratamiento sensible; libro de firmas con animación táctil que no obstaculice su uso; galería con fotos como protagonistas y estado de subida claro. Una interacción memorable por pantalla, no decoraciones continuas.

## Estado
Referencia incorporada a documentación, **pendiente aprobación de mockups y posterior implementación**. Otro desarrollador aún realiza cambios en `main`; no hacer cambios de frontend ni fusionar ramas antes de que cierre esa etapa.
