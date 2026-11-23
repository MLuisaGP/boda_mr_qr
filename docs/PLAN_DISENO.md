# PLAN_DISENO.md — Experiencia de recuerdos de boda (actualizado)

## 0. Estado y fuente
- Proyecto: `MLuisaGP/boda_mr_qr`; rama de trabajo `diseño`.
- Último **baseline externo inspeccionado**, no necesariamente el último tras los cambios del equipo: `main` en `3ccb08acdbadc76a39aea14f1e24e10ca1952e84` (19-nov-2026). Revisar nuevos commits al retomar. No se han ejecutado pruebas locales.
- Otro desarrollador continúa implementando cambios en `main`. **No desarrollar ni fusionar interfaz hasta que confirme cierre de sus pendientes.** El usuario indicó que ya ejecutó `composer update` localmente: no repetirlo por rutina.

## 1. Alcance funcional cerrado
**Es un micrositio de uso DURANTE EL EVENTO, no una invitación digital.** Los invitados llegan desde un QR de la celebración y pueden:
1. **Subir fotos/videos** del evento, con identificación mínima, límites claros, progreso y confirmación real.
2. **Firmar el libro** y explorar dedicatorias.
3. **Consultar el álbum** de fotografías/videos compartidos.

Queda **fuera de alcance**, salvo petición posterior: RSVP, historia de amor, cuenta regresiva, direcciones, cronograma, padres, dress code, regalos, hospedaje, códigos de reserva y datos bancarios del PDF. No llevar contenidos de invitación al micrositio por inercia. En portada solo contexto mínimo de Michelle & René y CTA claros.

## 2. Referencia visual aprobada (NO copiar diseño del PDF)
Consultar `docs/REFERENCIAS_VISUALES_BODA.md` y `docs/referencias/monograma-mr-referencia.png`.
- **Conservar colores actuales:** marfil `#FAF7F2`, oliva `#4A5842`, dorado `#C9A050`, con tonos actuales del CSS. Solo cambiar acentos/contraste tras revisión y aprobación.
- **Monograma M&R** exactamente en el espíritu formal/entrelazado de la referencia; usar como **favicon**, no la fotografía de pareja. Diseñar derivado vectorial legible a tamaño pequeño y verificar 16, 32, 48 px; no cambiar el icono PWA sin definirlo aparte.
- **Tipografía:** serif editorial delicada, manuscrita como acento limitado y sans legible para controles. Las fuentes existentes (Cormorant Garamond, Alex Brush, Plus Jakarta Sans) son punto de partida, no identificación probada de fuentes del PDF.
- **Botánica:** ramas y flores en trazo fino, discretas, idealmente SVG original; fondos con textura sutil, sin interferir con lectura ni botones.
- Dirección preferida: **«Álbum vivo editorial»**, unión de portada fotográfica y una experiencia de memoria compartida. Movimiento concentrado en momentos valiosos: abrir libro, confirmar firma, revelar recuerdo. Evitar animaciones masivas.

## 3. Baseline técnico revisado
- PHP >=8.1 MVC, MySQL, Illuminate, JavaScript/CSS, PWA; HostGator previsto. Fotos/videos desde `Cloudflare R2` con firma URL (`POST /api/media/presign`), PUT de objetos y confirmación (`POST /api/media/confirm`). Fallback legado local de 2 MB.
- Límites actuales en código revisado: 24 elementos/invitado, 4 videos/invitado, imagen optimizada hasta 5 MB, video hasta 30 MB y ~20 segundos, miniatura hasta 1 MB.
- Libro con `page-flip.browser.min.js`, animación de firma; galería con filtros; administración con guía para recuperación R2 mediante Cyberduck/rclone; `sw.js` caché `boda-mr-pwa-v21` en baseline.
- `app.css` y `app.js` son extensos; refactorizar exclusivamente áreas tocadas, evitar reescrituras extensas.
- **Riesgos a atender por el equipo:** `app/Config/Database.php` incluye credenciales incrustadas (rotación, retirar del código e historial); revisar seguridad de subidas, CORS, objetos huérfanos, privacidad y moderación. No exponer secretos ni probar con producción.

## 4. Secuencia acordada (sin ejecutar hasta cerrar cambios de main)
**Etapa A — Congelamiento y sincronización:** cuando el otro desarrollador termine, `git fetch origin`; revisar diff de `main` nuevo contra el baseline; sincronizar `diseño` de forma segura, revisar dependencias instaladas/lockfile sin hacer `composer update`; registrar commit exacto.

**Etapa B — Auditoría móvil (solo lectura):** revisar QR → portada → subir → ver confirmación y QR → firmar → ver firmas. Evaluar 360×800, 390×844, 430×932 y 1440×900; auditar loading, foco, memoria/performance, legibilidad y accesibilidad. Salida 6–8 hallazgos con rutas/líneas.

**Etapa C — Propuestas visuales:** dos alternativas *con los mismos colores*: (A) «Retrato editorial» — foto y CTAs bien jerarquizados; (B) «Álbum vivo» — capas de papel/botánica y transición contextual al libro/galería. Entregar mockups para selección antes de código. Priorizar la experiencia práctica del invitado sobre la espectacularidad.

**Etapa D — Portada y favicon:** redefinir jerarquía de los tres accesos, portada rápida y responsive; preparar favicon fiel al monograma, en SVG/PNG compatible, usando la imagen de referencia y comprobando tamaño pequeño. Actualizar `views/partials/pwa_head.php` únicamente tras aprobar el icono.

**Etapa E — Firmas, subida y galería:** mantener contratos del backend; suavizar y hacer accesible `page-flip`, incluir fallback sin 3D; feedback real al confirmar firma. En R2: validar cupos, miniaturas, errores, estados y confirmación idempotente; en galería: cargar miniaturas, ampliar imágenes/video y respetar privacidad.

**Etapa F — Regresión y entrega:** PHP lint de archivos editados, pruebas JS/CSS disponibles, rutas y API, estados móviles, red lenta y navegación por teclado, `prefers-reduced-motion`, PWA/actualización caché. Pruebas de subida real **solo con R2 y BD de pruebas** y permiso. Reportar lo validado y lo pendiente.

## 5. Criterios de aceptación
- Se percibe como **libro/álbum de recuerdos del evento**, nunca como invitación o sitio de RSVP.
- Entrada por QR sin obstáculos ni intro larga. En móvil tres CTA claros: **Compartir momentos**, **Firmar el libro**, **Ver álbum**.
- Monograma M&R inspirado fielmente en imagen aportada, con legibilidad comprobada como favicon.
- Paleta conservada salvo aprobación expresa; ilustraciones lineales originales y sutiles.
- Firmas, contenido anterior, archivos, rutas, APIs, R2, administración y PWA sin regresiones.
- Sin exposición de credenciales ni del PDF completo con datos personales.
- No hay commits, pushes, despliegues ni cambios de esquema sin autorización; evidencia explícita de pruebas ejecutadas.

## 6. Reutilización y tokens
Codex debe recibir tareas cortas que indiquen **objetivo + ruta + restricción + prueba**, con el detalle persistente en `AGENTS.md` y este plan. Ver `docs/PROMPTS_CORTOS.md`. Leer solo secciones relevantes: no repetir prompts filtrados enormes ni cargar cada CSS/JS completo.
