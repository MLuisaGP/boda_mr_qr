<?php
$pageTitle = 'Libro de Firmas · Boda Michelle & René';
$pageDesc = 'Firma el libro de honor digital de la boda de Michelle y René y lee los buenos deseos de los invitados.';
$themeColor = '#FAF7F2';
$activePage = 'guestbook';
$navTransparent = false;
?>
<!DOCTYPE html>
<html lang="es-MX">
<head>
<?php require __DIR__ . '/partials/pwa_head.php'; ?>
</head>
<body class="page-guestbook app-page-enter">

<?php require __DIR__ . '/partials/navbar.php'; ?>

  <main class="book-page-main">
    <section class="wedding-book-stage">
      <!-- LIBRO DE FIRMAS NUPCIAL (DISEÑO DE LIBRO DE HONOR CON MÍNIMO SCROLL) -->
      <div class="wedding-book-cover">
        <div class="wedding-book-spine" aria-hidden="true"></div>
        <div class="wedding-book-ribbon" aria-hidden="true"></div>

        <div class="wedding-book-sheet" id="weddingBookSheet" data-mode="closed">
          <!-- Encabezado Compacto del Libro -->
          <header class="book-sheet-header">
            <img class="book-cover-monogram" src="/assets/img/l-m&amp;r.svg" alt="Michelle y Ren&#233;" width="1371" height="1313">
            <div class="book-ornament" aria-hidden="true">
              <span></span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              <span></span>
            </div>
            <h1 class="book-eyebrow">Libro de Honor</h1>

            <!-- Selector de Vista: Escribir Firma / Ver Firmas de los Demás -->
            <div class="book-mode-bar">
              <button type="button" class="book-mode-btn" id="btnBookWriteTab" aria-controls="bookReadView" aria-expanded="false">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                <span>Escribir Firma</span>
              </button>
              <button type="button" class="book-mode-btn" id="btnBookReadTab" aria-controls="bookReadView" aria-expanded="false">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                <span>Ver Firmas</span>
                <span class="book-count-pill" id="gbBookCountPill">0</span>
              </button>
            </div>
          </header>

          <!-- PÁGINA 1 DEL LIBRO: FORMULARIO PARA FIRMAR -->
          <div class="book-view book-view-read" id="bookReadView">
          <div class="book-view book-view-write" id="bookWriteView">

            <div class="brand-wordmark book-write-wordmark">
              <span class="brand-text">Michelle <span class="brand-amp">&amp;</span> Ren&#233;</span>
              <span class="brand-date">19 &#183; XII &#183; 2026</span>
            </div>
            <span class="brand-divider book-write-divider" aria-hidden="true"></span>
<p class="book-prompt-note">
              Déjanos tus buenos deseos y bendiciones para recordar este día para siempre.
            </p>
            <form id="guestbookForm" class="book-form">
              <div class="book-field">
                <label for="gbAuthor" class="book-label">De parte de</label>
                <input type="text" id="gbAuthor" class="book-input" placeholder="Tu nombre o familia (ej. Familia Rodríguez)" required />
              </div>

              <div class="book-field book-message-field">
                <label for="gbMessage" class="book-label">Tu dedicatoria</label>
                <textarea id="gbMessage" class="book-textarea" placeholder="Escribe aquí tus deseos para Michelle &amp; René..." required rows="4"></textarea>
              </div>

              <div class="book-form-actions">
                <div class="book-write-footer">
              <button type="button" class="book-paper-corner-btn book-mode-switch" data-book-mode="read" aria-label="Ver firmas">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                <span class="book-mode-tooltip" aria-hidden="true">Ver firmas</span>
              </button>
            </div>
                <button type="submit" class="book-submit-btn">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                  <span>Firmar Libro</span>
                </button>
              </div>
            </form>

          </div>
            <!-- Escenario Interactivo del Libro (StPageFlip con doblado real de hoja, sin scroll vertical) -->
            <div class="book-flip-stage" id="bookFlipStage" aria-label="Hojas del libro de firmas, desliza con tu dedo para cambiar de página">
              <!-- Grosor visual de hojas apiladas a la derecha -->
              <div class="book-pages-stack" id="bookPagesStack" aria-hidden="true"></div>

              <!-- Contenedor donde StPageFlip monta las hojas reales -->
              <div class="book-flip-host-wrap" id="bookFlipHostWrap"></div>
            </div>
          </div>

          <!-- Animación de carga: pluma firmando el libro sobre pergamino -->
          <div class="book-signing-overlay" id="bookSigningOverlay" aria-hidden="true" role="status" aria-live="polite">
            <div class="book-signing-stage">
              <svg class="book-signing-svg" viewBox="0 0 280 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <defs>
                  <linearGradient id="penBodyGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#3E5035" />
                    <stop offset="55%" stop-color="#222E1C" />
                    <stop offset="100%" stop-color="#141C11" />
                  </linearGradient>
                  <linearGradient id="penGoldGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#F6E5BE" />
                    <stop offset="50%" stop-color="#C9A050" />
                    <stop offset="100%" stop-color="#8F6B28" />
                  </linearGradient>
                </defs>

                <!-- Línea guía de firma -->
                <line x1="22" y1="88" x2="258" y2="88" stroke="rgba(201, 160, 80, 0.36)" stroke-width="1" stroke-dasharray="3 4" />

                <!-- Trazo caligráfico de tinta -->
                <path
                  id="bookSigningPath"
                  class="book-signing-ink-path"
                  d="M 28 80 C 36 42, 56 26, 62 46 C 67 62, 48 82, 64 76 C 78 70, 92 40, 102 52 C 110 62, 96 78, 114 72 C 128 67, 138 46, 148 56 C 156 64, 146 78, 166 71 C 180 66, 192 46, 202 58 C 210 67, 204 78, 224 73 C 238 70, 248 64, 254 68"
                  stroke="#2D3A27"
                  stroke-width="2.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />

                <!-- Destello sutil en la punta de tinta -->
                <circle id="bookSigningInkDot" cx="28" cy="80" r="2.6" fill="#C9A050" opacity="0.85" />

                <!-- Pluma estilográfica (su punta exacta está en 0,0) -->
                <g id="bookSigningPen" transform="translate(28 80)">
                  <!-- Plumín dorado -->
                  <path d="M 0 0 L 10 -16 L 17 -10 Z" fill="url(#penGoldGrad)" stroke="#7E5C1E" stroke-width="0.7" stroke-linejoin="round" />
                  <line x1="1" y1="-1" x2="10.5" y2="-10.5" stroke="#5A4012" stroke-width="0.8" />
                  <circle cx="9.2" cy="-9.2" r="1.15" fill="#5A4012" />
                  <!-- Aro dorado -->
                  <path d="M 10 -16 L 17 -10 L 20 -13 L 13 -19 Z" fill="#F2DCAA" stroke="#8F6B28" stroke-width="0.6" />
                  <!-- Cuerpo de la pluma -->
                  <path d="M 13 -19 L 47 -53 C 50 -56, 54 -55, 55 -53 C 56 -51, 55 -47, 52 -44 L 20 -13 Z" fill="url(#penBodyGrad)" stroke="#161E13" stroke-width="0.8" />
                  <!-- Reflejo dorado en el cuerpo -->
                  <line x1="18" y1="-21" x2="47" y2="-49" stroke="rgba(244, 226, 183, 0.55)" stroke-width="1.3" stroke-linecap="round" />
                  <!-- Clip dorado -->
                  <path d="M 35 -43 L 49 -57 C 51 -59, 54 -58, 53 -56 L 41 -44" stroke="url(#penGoldGrad)" stroke-width="1.5" stroke-linecap="round" fill="none" />
                </g>
              </svg>

              <p class="book-signing-title">Firmando el libro...</p>
              <p class="book-signing-author" id="bookSigningAuthorLabel"></p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>

  <!-- Modal ligero para leer dedicatorias largas completas en su misma tipografía -->
  <div class="book-sig-modal" id="bookSigModal" aria-hidden="true" role="dialog" aria-modal="true">
    <div class="book-sig-modal-card">
      <button type="button" class="book-sig-modal-close" id="bookSigModalClose" aria-label="Cerrar"><svg class="ui-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 6 12 12M18 6 6 18"/></svg></button>
      <div class="book-sig-modal-ornament" aria-hidden="true"><svg class="ui-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/></svg></div>
      <div class="book-sig-modal-body" id="bookSigModalBody"></div>
    </div>
  </div>

<?php require __DIR__ . '/partials/shared_modals.php'; ?>

  <script src="/assets/js/vendor/page-flip.browser.min.js"></script>
  <script src="/assets/js/app.js?v=44"></script>
</body>
</html>
