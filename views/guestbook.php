<!DOCTYPE html>
<html lang="es-MX">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Libro de Firmas · Boda Michelle & René</title>
  
  <meta name="description" content="Déjanos tus bendiciones y dedicatorias de amor en nuestro libro de firmas digital.">
  <meta name="theme-color" content="#4A5842">

  <!-- Estilos Modernos No-Planos -->
  <link rel="stylesheet" href="assets/css/app.css">
  <link rel="icon" type="image/jpeg" href="assets/img/couple-portrait.jpg">
</head>
<body class="loading">

  <!-- ==================== INTERACTIVE PRELOADER (INSPIRADO EN WEDDING.JONGJEONGLEE.COM) ==================== -->
  <div id="interactive-preloader" aria-label="Cargando experiencia de boda">
    <div class="preloader-inner">
      <svg id="preloader-svg" xmlns="http://www.w3.org/2000/svg" width="190" height="190" viewBox="0 0 500 500">
        <defs>
          <linearGradient id="preloaderGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#F4E2B7"/>
            <stop offset="45%" stop-color="#C9A050"/>
            <stop offset="100%" stop-color="#8F6B28"/>
          </linearGradient>
          <radialGradient id="preloaderGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="rgba(201, 160, 80, 0.16)"/>
            <stop offset="100%" stop-color="transparent"/>
          </radialGradient>
        </defs>
        <circle cx="250" cy="250" r="235" fill="url(#preloaderGlow)" />
        <circle cx="250" cy="250" r="210" fill="none" stroke="rgba(201, 160, 80, 0.18)" stroke-width="2" />
        <circle cx="250" cy="250" r="195" fill="none" stroke="rgba(201, 160, 80, 0.12)" stroke-width="1" stroke-dasharray="3, 5" />
        <circle id="preloader-ring-circle" cx="250" cy="250" r="210" fill="none"
                stroke="url(#preloaderGold)" stroke-width="3.5" stroke-linecap="round"
                stroke-dasharray="1320" stroke-dashoffset="1320"
                transform="rotate(-90 250 250)" />
        <circle cx="250" cy="40" r="2.5" fill="#C9A050" />
        <circle cx="250" cy="460" r="2.5" fill="#C9A050" />
        <circle cx="40" cy="250" r="2.5" fill="#C9A050" />
        <circle cx="460" cy="250" r="2.5" fill="#C9A050" />
        <g id="preloader-center-logo">
          <path d="M250 126 L252 134 L260 136 L252 138 L250 146 L248 138 L240 136 L248 134 Z" fill="#C9A050" opacity="0.85"/>
          <text x="190" y="270" font-family="'Cormorant Garamond', Georgia, serif" font-size="124" font-weight="600" fill="#1F281B" text-anchor="middle" letter-spacing="-3">M</text>
          <text x="250" y="262" font-family="'Alex Brush', cursive" font-size="68" fill="url(#preloaderGold)" text-anchor="middle">&amp;</text>
          <text x="310" y="270" font-family="'Cormorant Garamond', Georgia, serif" font-size="124" font-weight="600" fill="#1F281B" text-anchor="middle" letter-spacing="-3">R</text>
          <text x="250" y="324" font-family="'Plus Jakarta Sans', sans-serif" font-size="11.5" font-weight="600" fill="#53614E" text-anchor="middle" letter-spacing="5">MICHELLE &amp; RENÉ</text>
          <line x1="205" y1="340" x2="295" y2="340" stroke="rgba(201, 160, 80, 0.45)" stroke-width="1" />
          <text x="250" y="360" font-family="'Plus Jakarta Sans', sans-serif" font-size="9.5" font-weight="500" fill="#82917D" text-anchor="middle" letter-spacing="3.5">19 · DICIEMBRE · 2026</text>
        </g>
      </svg>
      <div id="preloader-percentage">0%</div>
      <button id="pl-skip-btn" type="button" title="Saltar carga">Saltar</button>
    </div>
  </div>
  <script>
    (function(){
      var p = document.getElementById('interactive-preloader');
      var b = document.getElementById('pl-skip-btn');
      if (b && p) {
        b.onclick = function(e) {
          e.preventDefault();
          e.stopPropagation();
          p.style.opacity = '0';
          p.style.pointerEvents = 'none';
          document.body.classList.remove('loading');
          setTimeout(function() { if (p && p.parentNode) p.parentNode.removeChild(p); }, 400);
        };
      }
    })();
  </script>

  <!-- BARRA DE NAVEGACIÓN SUPERIOR (ESCRITORIO / TABLET) -->
  <header class="site-nav" id="siteNav">
    <a href="/" class="nav-brand">
      <div class="brand-monogram">M&R</div>
      <div class="brand-text">Michelle & René</div>
    </a>
    <ul class="nav-links">
      <li><a href="/" class="nav-link">Inicio</a></li>
      <li><a href="/#historia" class="nav-link">Nuestra Historia</a></li>
      <li><a href="/#subir" class="nav-link">Subir Recuerdo</a></li>
      <li><a href="/galeria" class="nav-link">Galería en Vivo</a></li>
      <li><a href="/firmas" class="nav-link active">Libro de Firmas</a></li>
      <li>
        <div id="guestDisplayBadge" class="user-badge" style="display:none;" onclick="if(window.promptGuestName) window.promptGuestName(true); else document.getElementById('guestModal').classList.add('active');" title="Mi perfil de invitado">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span id="guestDisplayName">Invitado</span>
        </div>
      </li>
    </ul>
  </header>

    <main>
    <!-- CABECERA DE LA PÁGINA DE FIRMAS -->
    <header class="page-hero-header">
      <span class="section-tag">Libro de Honor &amp; Recuerdos</span>
      <h1 class="section-title">Dedicatorias de Amor</h1>
      <div class="section-divider">
        <span class="divider-line"></span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
        <span class="divider-line"></span>
      </div>
      <p class="section-desc" style="max-width:580px; margin:0 auto 24px;">
        Un rincón especial para inmortalizar tus palabras de bendición para Michelle &amp; René.
      </p>
    </header>

    <div class="section-wrapper" style="padding-top:10px;">
      <div class="guestbook-redesign-container">
        <!-- Tarjeta del Formulario Nupcial -->
        <div class="guestbook-form-box">
          <div class="guestbook-box-header">
            <h3 class="guestbook-box-title">Escribe Tu Dedicatoria</h3>
            <p class="guestbook-box-desc">Comparte tus mejores deseos o selecciona una inspiración rápida:</p>
          </div>

          <!-- Chips de Inspiración Rápida -->
          <div>
            <span class="gb-chips-label">Inspiración de un toque:</span>
            <div class="gb-chips-row">
              <button type="button" class="gb-chip-btn" data-msg="¡Muchas felicidades a los novios! Que este amor sea eterno y lleno de bendiciones.">
                🥂 ¡Felicidades esposos!
              </button>
              <button type="button" class="gb-chip-btn" data-msg="Que Dios bendiga su matrimonio con infinita paz, respeto y felicidad todos los días.">
                💍 Que su amor sea eterno
              </button>
              <button type="button" class="gb-chip-btn" data-msg="¡Gracias por hacernos parte de su historia tan hermosa! Los queremos muchísimo.">
                ✨ Gracias por invitarnos
              </button>
              <button type="button" class="gb-chip-btn" data-msg="¡A bailar y celebrar con todo el corazón este gran día! Que vivan los novios.">
                🎉 ¡A celebrar en grande!
              </button>
              <button type="button" class="gb-chip-btn" data-msg="Les deseamos una vida repleta de aventuras compartidas, risas y complicidad mutua.">
                🤍 Siempre juntos
              </button>
            </div>
          </div>

          <form id="guestbookForm">
            <div class="gb-input-row">
              <input type="text" id="gbAuthor" class="gb-input-field" placeholder="Tu Nombre o Familia (ej. Familia Rodríguez)" required />
            </div>
            <div class="gb-input-row">
              <textarea id="gbMessage" class="gb-textarea-field" placeholder="Escribe aquí tu dedicatoria con todo tu cariño..." required rows="4"></textarea>
            </div>
            <button type="submit" class="gb-submit-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              <span>Publicar Mi Dedicatoria</span>
            </button>
          </form>
        </div>

        <!-- Encabezado de cartas recibidas -->
        <div class="gb-entries-header">
          <div class="gb-entries-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            <span id="gbCounterBadge">Cargando dedicatorias...</span>
          </div>
        </div>

        <!-- Muro de Cartas de Amor -->
        <div class="guestbook-letters-grid" id="guestbookList">
          <!-- Renderizado dinámico vía app.js -->
        </div>
      </div>
    </div>
  </main>

  <!-- FOOTER ELEGANTE -->
  <footer style="background:#1E271A; color:#E3EADF; padding:50px 24px 90px; text-align:center; border-top:1px solid rgba(212,175,55,0.3);">
    <div style="font-family:var(--font-script); font-size:3.2rem; color:var(--color-gold-light); margin-bottom:6px;">
      Michelle & René
    </div>
    <p style="font-size:0.85rem; letter-spacing:0.25em; text-transform:uppercase; color:var(--color-gold); margin-bottom:20px;">
      19 de Diciembre de 2026
    </p>
    <div>
      <a href="/admin" style="color:rgba(212,175,55,0.7); text-decoration:none; font-size:0.75rem; letter-spacing:0.12em; text-transform:uppercase;">
        Acceso Exclusivo Novios →
      </a>
    </div>
  </footer>

  <!-- BOTTOM NAVIGATION BAR PARA TELÉFONOS MÓVILES (Estilo App Nativa) -->
  <nav class="mobile-app-nav" aria-label="Navegación móvil">
    <ul class="mobile-nav-items">
      <li>
        <a href="/" class="mobile-nav-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          <span>Inicio</span>
        </a>
      </li>
      <li>
        <a href="/galeria" class="mobile-nav-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
          <span>Galería</span>
        </a>
      </li>
      <li>
        <button type="button" class="mobile-upload-fab" id="navCameraFab" onclick="if(window.openCameraAction) window.openCameraAction(); else document.getElementById('cameraMobileSheet')?.classList.add('active');" title="Tomar foto o grabar video">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
        </button>
      </li>
      <li>
        <a href="/firmas" class="mobile-nav-btn active">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          <span>Firmas</span>
        </a>
      </li>
      <li>
        <button class="mobile-nav-btn" onclick="if(window.promptGuestName) window.promptGuestName(true); else document.getElementById('guestModal').classList.add('active');">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span>Perfil</span>
        </button>
      </li>
    </ul>
  </nav>

  <!-- MODAL DE INGRESO DEL INVITADO -->
  <div class="modal-backdrop" id="guestModal">
    <div class="modal-dialog">
      <button type="button" class="modal-close-btn" id="guestModalClose" title="Cerrar sin guardar cambios" style="display:none;">&times;</button>
      
      <div class="modal-icon-badge">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
      </div>
      <h3 class="modal-title">Tu Perfil de Invitado</h3>
      <p class="modal-subtitle">
        Identifícate con tu nombre para subir recuerdos y dejar tus firmas con amor.
      </p>

      <div class="modal-current-info" style="display:none;">
        Nombre registrado actualmente: <br><strong id="guestModalCurrentName">Invitado</strong>
      </div>

      <form id="guestForm">
        <div class="form-group" style="text-align:left;">
          <label for="guestNameInput" style="display:block; font-size:0.78rem; text-transform:uppercase; letter-spacing:0.1em; color:var(--color-olive); margin-bottom:6px; font-weight:600;">Modificar o confirmar nombre</label>
          <input type="text" id="guestNameInput" class="form-control" placeholder="Escribe tu nombre y apellido" required autocomplete="name" />
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%; padding:14px;">
          Guardar Nombre →
        </button>
      </form>
    </div>
  </div>

  <!-- Inputs invisibles para captura de cámara -->
  <input type="file" id="inputUploadDevice" accept="image/*,video/*" style="position:fixed; top:-9999px; left:-9999px; opacity:0; width:1px; height:1px; pointer-events:none;" />
  <input type="file" id="inputNativePhoto" accept="image/*" capture="environment" style="position:fixed; top:-9999px; left:-9999px; opacity:0; width:1px; height:1px; pointer-events:none;" />
  <input type="file" id="inputNativeVideo" accept="video/*" capture="environment" style="position:fixed; top:-9999px; left:-9999px; opacity:0; width:1px; height:1px; pointer-events:none;" />

  <!-- CUADRO DESPLEGABLE ELEGANTE: SELECCIÓN ENTRE TOMAR FOTO O GRABAR VIDEO -->
  <div class="mobile-sheet-backdrop" id="cameraMobileSheet">
    <div class="mobile-sheet-card">
      <div class="mobile-sheet-drag-handle"></div>
      <div class="mobile-sheet-head">
        <div class="mobile-sheet-title">Capturar Momento Especial</div>
        <p class="mobile-sheet-desc">Selecciona cómo deseas compartir tu recuerdo:</p>
      </div>

      <div class="mobile-sheet-options">
        <!-- Opción 1: Tomar Foto con la Cámara -->
        <label for="inputNativePhoto" class="mobile-sheet-btn sheet-btn-primary" id="btnSheetPhoto">
          <div class="sheet-btn-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
          </div>
          <div class="sheet-btn-text">
            <strong>Tomar Foto con la Cámara</strong>
            <span>Abre la app de cámara para capturar fotos</span>
          </div>
        </label>

        <!-- Opción 2: Grabar Video con la Cámara -->
        <label for="inputNativeVideo" class="mobile-sheet-btn sheet-btn-burgundy" id="btnSheetVideo">
          <div class="sheet-btn-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
          </div>
          <div class="sheet-btn-text">
            <strong>Grabar Video con la Cámara</strong>
            <span>Graba un video corto del momento</span>
          </div>
        </label>
      </div>

      <button type="button" class="mobile-sheet-cancel" id="btnSheetCancel">
        Cancelar
      </button>
    </div>
  </div>

  <div class="toast-container" id="toastContainer"></div>

  <script src="assets/js/app.js"></script>
</body>
</html>
