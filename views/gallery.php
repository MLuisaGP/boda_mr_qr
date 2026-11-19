<!DOCTYPE html>
<html lang="es-MX">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Galería de Invitados · Michelle & René</title>
  
  <meta name="description" content="Explora todas las fotografías y videos capturados en tiempo real durante la boda de Michelle y René.">
  <meta name="theme-color" content="#1F281B">

  <!-- Open Graph -->
  <meta property="og:title" content="Galería de la Boda · Michelle & René">
  <meta property="og:description" content="Comparte tus fotos y revive los mejores momentos en nuestra galería en vivo.">
  <meta property="og:image" content="assets/img/hero-widescreen.jpg">

  <!-- Tipografías de Alta Gama y Estilos -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Alex+Brush&display=swap" rel="stylesheet">
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

        <!-- Resplandor de fondo -->
        <circle cx="250" cy="250" r="235" fill="url(#preloaderGlow)" />

        <!-- Anillos concéntricos de precisión relojera -->
        <circle cx="250" cy="250" r="210" fill="none" stroke="rgba(201, 160, 80, 0.18)" stroke-width="2" />
        <circle cx="250" cy="250" r="195" fill="none" stroke="rgba(201, 160, 80, 0.12)" stroke-width="1" stroke-dasharray="3, 5" />

        <!-- Anillo de progreso dinámico (Circunferencia: 1320) -->
        <circle id="preloader-ring-circle" cx="250" cy="250" r="210" fill="none"
                stroke="url(#preloaderGold)" stroke-width="3.5" stroke-linecap="round"
                stroke-dasharray="1320" stroke-dashoffset="1320"
                transform="rotate(-90 250 250)" />

        <!-- Marcadores cardinales de lujo -->
        <circle cx="250" cy="40" r="2.5" fill="#C9A050" />
        <circle cx="250" cy="460" r="2.5" fill="#C9A050" />
        <circle cx="40" cy="250" r="2.5" fill="#C9A050" />
        <circle cx="460" cy="250" r="2.5" fill="#C9A050" />

        <!-- MONOGRAMA CENTRAL "MyR" (MICHELLE & RENÉ) -->
        <g id="preloader-center-logo">
          <!-- Destello superior sutil -->
          <path d="M250 126 L252 134 L260 136 L252 138 L250 146 L248 138 L240 136 L248 134 Z" fill="#C9A050" opacity="0.85"/>

          <!-- Letra M -->
          <text x="190" y="270" font-family="'Cormorant Garamond', Georgia, serif" font-size="124" font-weight="600" fill="#1F281B" text-anchor="middle" letter-spacing="-3">M</text>
          
          <!-- Ampersand / Conector & -->
          <text x="250" y="262" font-family="'Alex Brush', cursive" font-size="68" fill="url(#preloaderGold)" text-anchor="middle">&amp;</text>
          
          <!-- Letra R -->
          <text x="310" y="270" font-family="'Cormorant Garamond', Georgia, serif" font-size="124" font-weight="600" fill="#1F281B" text-anchor="middle" letter-spacing="-3">R</text>

          <!-- Nombres y Fecha en relieve editorial -->
          <text x="250" y="324" font-family="'Plus Jakarta Sans', sans-serif" font-size="11.5" font-weight="600" fill="#53614E" text-anchor="middle" letter-spacing="5">MICHELLE &amp; RENÉ</text>
          <line x1="205" y1="340" x2="295" y2="340" stroke="rgba(201, 160, 80, 0.45)" stroke-width="1" />
          <text x="250" y="360" font-family="'Plus Jakarta Sans', sans-serif" font-size="9.5" font-weight="500" fill="#82917D" text-anchor="middle" letter-spacing="3.5">19 · DICIEMBRE · 2026</text>
        </g>
      </svg>

      <!-- Contador de porcentaje numérico -->
      <div id="preloader-percentage">0%</div>

      <!-- Botón Saltar -->
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
      <div class="brand-monogram">M&amp;R</div>
      <div class="brand-text">Michelle &amp; René</div>
    </a>
    <ul class="nav-links">
      <li><a href="/" class="nav-link">Inicio</a></li>
      <li><a href="/#historia" class="nav-link">Nuestra Historia</a></li>
      <li><a href="/#subir" class="nav-link">Subir Recuerdo</a></li>
      <li><a href="/galeria" class="nav-link active">Galería en Vivo</a></li>
      <li><a href="/firmas" class="nav-link">Libro de Firmas</a></li>
      <li>
        <div id="guestDisplayBadge" class="user-badge" style="display:none;" onclick="if(window.promptGuestName) window.promptGuestName(true); else document.getElementById('guestModal').classList.add('active');" title="Mi perfil de invitado">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span id="guestDisplayName">Invitado</span>
        </div>
      </li>
    </ul>
  </header>

  <main>
    <!-- ==================== ENCABEZADO DE GALERÍA (ESTILO WEDDING.JONGJEONGLEE.COM) ==================== -->
    <header class="gallery-screen-header">
      <div class="gallery-title">GALERÍA</div>
      <div class="gallery-subtitle">Comparte tus momentos con nosotros</div>

      <!-- Área de acciones de subida y cámara -->
      <div class="gallery-upload-area">
        <button type="button" class="btn-gallery-action btn-gallery-upload" id="btnGalleryUploadMain" title="Subir fotos o videos guardados">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          <span>Subir Fotos o Videos</span>
        </button>

        <button type="button" class="btn-gallery-action btn-gallery-camera" id="btnGalleryCameraMain" title="Tomar foto con la cámara">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
          <span>Tomar Foto</span>
        </button>

        <button type="button" class="btn-gallery-action btn-gallery-refresh" id="btnRefreshGallery" title="Refrescar fotos nuevas">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
        </button>
      </div>

      <!-- Pestañas de filtrado minimalistas -->
      <div class="gallery-tabs-row">
        <button type="button" class="tab-btn gallery-tab-item active" data-filter="all">Todos los Momentos</button>
        <button type="button" class="tab-btn gallery-tab-item" data-filter="my">Mis Fotos</button>
        <button type="button" class="tab-btn gallery-tab-item" data-filter="popular">Más Queridas ♥</button>
      </div>
    </header>

    <!-- Barra de progreso flotante durante subidas -->
    <div class="upload-progress-wrapper" id="uploadProgress" style="max-width:500px; margin:0 auto 20px; padding:0 20px;">
      <div class="upload-progress-bar-bg">
        <div class="upload-progress-bar-fill" id="progressBarFill"></div>
      </div>
      <div id="progressText" style="font-size:0.82rem; margin-top:8px; color:var(--color-olive); font-weight:600; text-align:center;">
        Subiendo recuerdo...
      </div>
    </div>

    <!-- ==================== GRID DE FOTOS ESTILO WEDDING.JONGJEONGLEE.COM ==================== -->
    <div class="gallery-grid-wrap">
      <div class="gallery-grid" id="galleryGrid">
        <!-- Renderizado dinámico vía app.js -->
      </div>

      <!-- Estado de carga -->
      <div id="galleryLoading" class="gallery-empty" style="display:none;">
        <div class="gallery-spinner"></div>
        <p>Cargando recuerdos de la boda...</p>
      </div>

      <!-- Estado vacío -->
      <div id="galleryEmpty" class="gallery-empty" style="display:none;">
        <div class="gallery-empty-icon">
          <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
        </div>
        <p class="gallery-empty-title">Aún no hay fotos.</p>
        <p class="gallery-empty-desc">¡Sé el primero en compartir un momento inolvidable!</p>
        <button type="button" class="btn-gallery-action btn-gallery-upload" onclick="document.getElementById('inputUploadDevice').click();" style="margin-top:16px;">
          Subir primera foto
        </button>
      </div>
    </div>
  </main>

  <!-- ==================== LIGHTBOX CINEMATOGRÁFICO DE PANTALLA COMPLETA ==================== -->
  <div class="gallery-lightbox" id="gallery-lightbox" role="dialog" aria-modal="true" aria-label="Visor de fotos">
    <!-- Botón de cierre flotante translúcido -->
    <button class="lightbox-close" id="lightboxClose" type="button" aria-label="Cerrar visor">&times;</button>
    
    <!-- Flechas de navegación prev/next -->
    <button class="lightbox-nav lightbox-prev" id="lightboxPrev" type="button" aria-label="Foto anterior">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
    </button>
    <button class="lightbox-nav lightbox-next" id="lightboxNext" type="button" aria-label="Siguiente foto">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
    </button>

    <!-- Contenido multimedia central -->
    <div class="lightbox-media-container" id="lightboxMediaContainer">
      <img id="lightboxImg" class="lightbox-media" src="" alt="Recuerdo de boda" style="display:none;" />
      <video id="lightboxVideo" class="lightbox-media" controls playsinline style="display:none;"></video>
    </div>

    <!-- Barra inferior con contador, autor y acciones -->
    <div class="lightbox-bottom">
      <div class="lightbox-meta">
        <span id="lightboxCounter" class="lightbox-counter">1 / 1</span>
        <span id="lightboxAuthor" class="lightbox-author">Invitado</span>
      </div>
      <div class="lightbox-actions">
        <button type="button" id="lightboxLikeBtn" class="lightbox-btn lightbox-like" title="Dar like">
          <span class="lb-heart">♥</span> <span id="lightboxLikeCount">0</span>
        </button>
        <a id="lightboxDownloadBtn" href="#" download class="lightbox-btn lightbox-download" title="Descargar imagen en alta resolución">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          <span>Descargar</span>
        </a>
        <button type="button" id="lightboxDeleteBtn" class="lightbox-btn lightbox-delete" title="Eliminar mi foto" style="display:none;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          <span>Eliminar</span>
        </button>
      </div>
    </div>
  </div>

  <!-- FOOTER ELEGANTE -->
  <footer style="background:#171D15; color:#E3EADF; padding:60px 24px 100px; text-align:center; border-top:1px solid rgba(201,160,80,0.25); margin-top:80px;">
    <div style="font-family:var(--font-script); font-size:3.4rem; color:var(--color-gold-light); margin-bottom:6px;">
      Michelle &amp; René
    </div>
    <p style="font-size:0.82rem; letter-spacing:0.25em; text-transform:uppercase; color:var(--color-gold); margin-bottom:24px;">
      19 de Diciembre de 2026
    </p>
    <div>
      <a href="/admin" style="color:rgba(201,160,80,0.7); text-decoration:none; font-size:0.75rem; letter-spacing:0.14em; text-transform:uppercase;">
        Acceso Exclusivo Novios →
      </a>
    </div>
  </footer>

  <!-- BOTTOM NAVIGATION BAR PARA TELÉFONOS MÓVILES (Estilo App Nativa) -->
  <nav class="mobile-app-nav" aria-label="Navegación móvil">
    <ul class="mobile-nav-items">
      <li>
        <a href="/" class="mobile-nav-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 6"></polyline></svg>
          <span>Inicio</span>
        </a>
      </li>
      <li>
        <a href="/galeria" class="mobile-nav-btn active">
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
        <a href="/firmas" class="mobile-nav-btn">
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

  <!-- Inputs invisibles para captura de fotos y videos -->
  <input type="file" id="inputUploadDevice" accept="image/*,video/*" style="position:fixed; top:-9999px; left:-9999px; opacity:0; width:1px; height:1px; pointer-events:none;" />
  <input type="file" id="inputNativePhoto" accept="image/*" capture="environment" style="position:fixed; top:-9999px; left:-9999px; opacity:0; width:1px; height:1px; pointer-events:none;" />
  <input type="file" id="inputNativeVideo" accept="video/*" capture="environment" style="position:fixed; top:-9999px; left:-9999px; opacity:0; width:1px; height:1px; pointer-events:none;" />

  <!-- HOJA DESPLEGABLE MÓVIL: SELECCIÓN ENTRE TOMAR FOTO O GRABAR VIDEO -->
  <div class="mobile-sheet-backdrop" id="cameraMobileSheet">
    <div class="mobile-sheet-card">
      <div class="mobile-sheet-drag-handle"></div>
      <div class="mobile-sheet-head">
        <div class="mobile-sheet-title">Capturar Momento Especial</div>
        <p class="mobile-sheet-desc">Selecciona cómo deseas compartir tu recuerdo:</p>
      </div>

      <div class="mobile-sheet-options">
        <label for="inputNativePhoto" class="mobile-sheet-btn sheet-btn-primary" id="btnSheetPhoto">
          <div class="sheet-btn-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
          </div>
          <div class="sheet-btn-text">
            <strong>Tomar Foto con la Cámara</strong>
            <span>Abre la app de cámara para capturar fotos</span>
          </div>
        </label>

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
