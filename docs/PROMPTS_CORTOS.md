# PROMPTS_CORTOS.md — flujo ligero para Codex y Claude

Usar **un prompt por tarea**. `AGENTS.md` ya establece la identidad. No pegar este archivo completo al agente.

## 1. Mientras el otro desarrollador trabaja (solo lectura)
> Estamos en `diseño`. No edites ni sincronices. Usa AGENTS.md y revisa solo el alcance y el módulo [MÓDULO]. Detecta máximo 5 riesgos reales (ruta/línea) y responde en 8 líneas. Este sitio es para firmas y multimedia durante el evento; no es invitación.

## 2. Retomar tras los cambios de `main` (sin editar)
> Comprueba rama, status y refs de `origin/main`. Compara el nuevo `main` contra `3ccb08a` y resume únicamente cambios que afecten portada, firmas, galería, R2 y PWA. No hagas merge, `composer update`, commit ni push; reporta si hay conflictos potenciales.

## 3. Proponer dos diseños sin código
> Lee solo `docs/REFERENCIAS_VISUALES_BODA.md` y la portada actual. Propón 2 conceptos móviles para un álbum/firmas de boda accesible por QR. Conserva #FAF7F2, #4A5842 y #C9A050. Usa el monograma como favicon y botánica lineal discreta. No agregues contenidos de invitación. Wireframes cortos y una interacción distintiva por concepto.

## 4. Favicon (solo después de autorización)
> Toma `docs/referencias/monograma-mr-referencia.png` como fuente visual. Prepara una versión del monograma M&R fiel y legible a 16/32/48 px, preferentemente SVG y PNG, usando la paleta existente. Muestra primero opciones si hay que simplificar detalles; no sustituyas el icono PWA. Tras aprobación, integra en `views/partials/pwa_head.php` y verifica.

## 5. Implementar un cambio aprobado
> En `diseño` aplica [CAMBIO] solo a [ARCHIVOS]. Consulta los fragmentos afectados; conserva paleta, endpoints, R2, firmas y PWA. Comprueba [PRUEBA]. Reporta archivos, pruebas y riesgos en <=10 líneas. No hagas push.

## 6. QA limitado al diff
> Revisa `git diff --stat` y los hunks de [ARCHIVOS]. Prioriza regresiones reales de móvil, foco, contrastes, almacenamiento, firmas y caché. Sin reescribir código, máximo 6 hallazgos, con ruta/línea.

## 7. Claude + 21st.dev (solo referencias)
> Busca inspiración para una experiencia editorial de recuerdos compartidos en boda. 2 variantes visuales con misma paleta; toma Awwwards/Codrops/21st como referencia sin copiar. Prioriza CSS/SVG/JS y no introduzcas React. Entrega enlaces/ideas, no código ni componentes completos todavía.

## Ahorro real
- No mandar PDF de 9 páginas ni todo `app.css`/`app.js` al agente; basta el documento de referencia y la imagen del monograma.
- Primero referencia, luego una propuesta, luego una implementación acotada.
- `rg -n` + fragmentos + diff, evitar lectura masiva y cambios de dependencias.
- No confundir «respuesta breve» con «menos pruebas».
