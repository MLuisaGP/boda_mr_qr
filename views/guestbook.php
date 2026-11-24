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

<?php require __DIR__ . '/partials/preloader.php'; ?>

<?php require __DIR__ . '/partials/navbar.php'; ?>

  <main class="book-page-main">
    <section class="wedding-book-stage is-real-book" id="weddingBookStage" data-book-state="front" data-spread="false">
      <!-- LIBRO DE FIRMAS FÍSICO REAL (StPageFlip con tapas duras, interior de pasta en escritorio y cierre en contraportada) -->
      <div class="book-physical-shell" id="weddingBookSheet" data-mode="closed">
        <div class="book-flip-stage" id="bookFlipStage" aria-label="Libro de honor interactivo, desliza para abrir y pasar hoja por hoja">
          <div class="book-flip-host-wrap" id="bookFlipHostWrap"></div>
          <div class="book-portrait-lid book-portrait-lid--front" id="bookPortraitFrontLid" aria-label="Portada del libro de firmas"></div>
          <div class="book-portrait-lid book-portrait-lid--back" id="bookPortraitBackLid" aria-label="Contraportada del libro de firmas"></div>
        </div>

        <!-- Estacionamiento oculto para preservar el formulario vivo y sus datos entre remounts -->
        <div id="bookWriteParking" hidden>
          <div class="book-view book-view-write is-active" id="bookWriteView">
            <div class="book-paper-running-head">
              <span>Libro de Honor · M &amp; R</span>
              <span>Dedicatoria</span>
            </div>
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
                <button type="submit" class="book-submit-btn">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                  <span>Firmar Libro</span>
                </button>
              </div>
            </form>

            <div class="book-paper-footer book-write-paper-footer">
              <button type="button" class="book-paper-corner-btn book-corner-prev" data-book-dir="prev" aria-label="Cerrar portada">
                <svg class="ui-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12H4m6-6-6 6 6 6"/></svg>
              </button>
              <span class="book-paper-swipe-hint">Desliza para leer las dedicatorias</span>
              <button type="button" class="book-paper-corner-btn book-corner-next" data-book-action="open-read" aria-label="Ver firmas">
                <svg class="ui-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16m-6-6 6 6-6 6"/></svg>
              </button>
            </div>
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
  <script src="/assets/js/media-download.js?v=1"></script>
  <script src="/assets/js/app.js?v=57"></script>
</body>
</html>
