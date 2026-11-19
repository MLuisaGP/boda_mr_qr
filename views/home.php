<!DOCTYPE html>
<html lang="es-MX">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Boda Michelle & René · 19 de Diciembre 2026</title>
  
  <meta name="description" content="Celebra con nosotros la boda de Michelle y René. Comparte tus fotos, videos y mejores deseos en nuestra galería en vivo.">
  <meta name="theme-color" content="#4A5842">

  <!-- Open Graph -->
  <meta property="og:title" content="Boda Michelle & René">
  <meta property="og:description" content="Sube tus fotos y videos en tiempo real para crear juntos el álbum de nuestra boda.">
  <meta property="og:image" content="assets/img/hero-widescreen.jpg">

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
      <div class="brand-monogram">M&R</div>
      <div class="brand-text">Michelle & René</div>
    </a>
    <ul class="nav-links">
      <li><a href="/" class="nav-link active">Inicio</a></li>
      <li><a href="/#historia" class="nav-link">Nuestra Historia</a></li>
      <li><a href="/#subir" class="nav-link">Subir Recuerdo</a></li>
      <li><a href="/galeria" class="nav-link">Galería en Vivo</a></li>
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
    <!-- HERO SECTION: PORTADA CINEMATOGRÁFICA Y ROMÁNTICA -->
    <section class="hero-section" id="inicio">
      <div class="hero-bg-frame">
        <picture>
          <source media="(max-width: 768px)" srcset="assets/img/hero-portrait.jpg">
          <img src="assets/img/hero-widescreen.jpg" alt="Michelle y René" class="hero-image">
        </picture>
        <div class="hero-overlay"></div>
      </div>

      <div class="hero-content">
        <p class="hero-eyebrow">Nuestra Boda</p>
        <h1 class="hero-title">Michelle <span>&</span> René</h1>
        <p class="hero-subtitle">
          "Unimos nuestras vidas para siempre y queremos que cada mirada, risa y brindis se quede guardado en nuestro corazón."
        </p>

        <div class="hero-date-badge">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F4E2B7" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          <span>19 DE DICIEMBRE DE 2026</span>
        </div>

        <!-- Reloj Cuenta Regresiva de Lujo -->
        <div class="countdown-box" aria-label="Cuenta regresiva de la boda">
          <div class="countdown-item">
            <div class="countdown-num" id="cd-days">--</div>
            <div class="countdown-lbl">Días</div>
          </div>
          <div class="countdown-item">
            <div class="countdown-num" id="cd-hours">--</div>
            <div class="countdown-lbl">Horas</div>
          </div>
          <div class="countdown-item">
            <div class="countdown-num" id="cd-mins">--</div>
            <div class="countdown-lbl">Min</div>
          </div>
          <div class="countdown-item">
            <div class="countdown-num" id="cd-secs">--</div>
            <div class="countdown-lbl">Seg</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== SECCIÓN INTERACTIVA: NUESTRA HISTORIA EN IMÁGENES ==================== -->
    <section class="section-wrapper story-showcase-section" id="historia">
      <div class="section-head">
        <span class="section-tag">Nuestra Historia de Amor</span>
        <h2 class="section-title">Momentos Que Nos Unieron</h2>
        <div class="section-divider">
          <span class="divider-line"></span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          <span class="divider-line"></span>
        </div>
        <p class="section-desc">
          Cada fotografía guarda un capítulo de nuestro viaje juntos. Haz clic en las fotografías pequeñas de abajo para explorar cada recuerdo.
        </p>
      </div>

      <!-- VISOR PRINCIPAL DEL CARRUSEL (GRANDE Y CINEMATOGRÁFICO) -->
      <div class="story-carousel-container" id="storyCarouselContainer">
        

        <div class="story-stage" id="storyStage">
          <!-- Slide 1 -->
          <div class="story-slide active" data-index="0">
            <img src="assets/img/hero-widescreen.jpg" alt="Donde Todo Comenzó" class="story-slide-img" />
            <div class="story-slide-overlay">
              <div class="story-slide-card">
                <span class="story-slide-tag">Capítulo 01 · El Comienzo</span>
                <h3 class="story-slide-title">Donde Todo Comenzó</h3>
                <p class="story-slide-desc">El primer instante en que nuestras miradas coincidieron y supimos que comenzaba la aventura más hermosa de nuestras vidas.</p>
              </div>
            </div>
          </div>

          <!-- Slide 2 -->
          <div class="story-slide" data-index="1">
            <img src="assets/img/couple-story-1.jpg" alt="Aventuras de la Mano" class="story-slide-img" />
            <div class="story-slide-overlay">
              <div class="story-slide-card">
                <span class="story-slide-tag">Capítulo 02 · Viajes & Horizontes</span>
                <h3 class="story-slide-title">Aventuras de la Mano</h3>
                <p class="story-slide-desc">Descubrir nuevos paisajes y caminos juntos nos enseñó que nuestro lugar favorito siempre es donde estemos el uno con el otro.</p>
              </div>
            </div>
          </div>

          <!-- Slide 3 -->
          <div class="story-slide" data-index="2">
            <img src="assets/img/couple-story-2.jpg" alt="Cómplices de Vida" class="story-slide-img" />
            <div class="story-slide-overlay">
              <div class="story-slide-card">
                <span class="story-slide-tag">Capítulo 03 · Alegrías Compartidas</span>
                <h3 class="story-slide-title">Cómplices de Vida</h3>
                <p class="story-slide-desc">En cada risa sincera, cada café por la mañana y cada momento sencillo descubrimos la magia de amarnos sin condiciones.</p>
              </div>
            </div>
          </div>

          <!-- Slide 4 -->
          <div class="story-slide" data-index="3">
            <img src="assets/img/couple-story-3.jpg" alt="El Sí, Para Siempre" class="story-slide-img" />
            <div class="story-slide-overlay">
              <div class="story-slide-card">
                <span class="story-slide-tag">Capítulo 04 · La Propuesta</span>
                <h3 class="story-slide-title">El "Sí", Para Siempre</h3>
                <p class="story-slide-desc">Bajo el cielo y con el corazón latiendo a mil, una pregunta selló nuestra promesa de caminar juntos por toda la eternidad.</p>
              </div>
            </div>
          </div>

          <!-- Slide 5 -->
          <div class="story-slide" data-index="4">
            <img src="assets/img/couple-story-4.jpg" alt="Paso a Paso" class="story-slide-img" />
            <div class="story-slide-overlay">
              <div class="story-slide-card">
                <span class="story-slide-tag">Capítulo 05 · Nuestro Camino</span>
                <h3 class="story-slide-title">Paso a Paso</h3>
                <p class="story-slide-desc">Creyendo en los mismos sueños y edificando día a día un amor sólido, noble y lleno de ternura.</p>
              </div>
            </div>
          </div>

          <!-- Slide 6 -->
          <div class="story-slide" data-index="5">
            <img src="assets/img/couple-story-5.jpg" alt="Amor Inquebrantable" class="story-slide-img" />
            <div class="story-slide-overlay">
              <div class="story-slide-card">
                <span class="story-slide-tag">Capítulo 06 · Complicidad</span>
                <h3 class="story-slide-title">Amor Inquebrantable</h3>
                <p class="story-slide-desc">El abrazo donde todo se calma, las manos que no se sueltan y la certeza de haber encontrado a la persona correcta.</p>
              </div>
            </div>
          </div>

          <!-- Slide 7 -->
          <div class="story-slide" data-index="6">
            <img src="assets/img/couple-portrait.jpg" alt="A Punto del Gran Paso" class="story-slide-img" />
            <div class="story-slide-overlay">
              <div class="story-slide-card">
                <span class="story-slide-tag">Capítulo 07 · Rumbo al Altar</span>
                <h3 class="story-slide-title">A Punto de Dar el Gran Paso</h3>
                <p class="story-slide-desc">Este 19 de Diciembre de 2026 daremos el paso más importante de nuestras vidas y no podríamos hacerlo sin ti.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Controles de navegación flotantes -->
        <button type="button" class="story-nav-btn story-prev" id="storyPrevBtn" title="Foto anterior" aria-label="Foto anterior">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <button type="button" class="story-nav-btn story-next" id="storyNextBtn" title="Siguiente foto" aria-label="Siguiente foto">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>

        <!-- Contador flotante -->
        <div class="story-badge-indicator" id="storyBadgeIndicator">
          <span id="storyCurrentIndex">01</span> / <span id="storyTotalIndex">07</span>
        </div>
      </div>

      <!-- SELECTOR DE MINIATURAS INTERACTIVAS (FOTOS CHICAS PARA SELECCIONAR) -->
      <div class="story-thumbnails-wrapper">
        <div class="story-thumbnails-track" id="storyThumbnailsTrack">
          <div class="story-thumb-item active" data-index="0" title="Capítulo 01: Donde Todo Comenzó">
            <img src="assets/img/hero-widescreen.jpg" alt="Miniatura 1" loading="lazy" />
            <div class="story-thumb-overlay"><span class="story-thumb-num">01 · Inicio</span></div>
          </div>
          <div class="story-thumb-item" data-index="1" title="Capítulo 02: Aventuras de la Mano">
            <img src="assets/img/couple-story-1.jpg" alt="Miniatura 2" loading="lazy" />
            <div class="story-thumb-overlay"><span class="story-thumb-num">02 · Viajes</span></div>
          </div>
          <div class="story-thumb-item" data-index="2" title="Capítulo 03: Cómplices de Vida">
            <img src="assets/img/couple-story-2.jpg" alt="Miniatura 3" loading="lazy" />
            <div class="story-thumb-overlay"><span class="story-thumb-num">03 · Risas</span></div>
          </div>
          <div class="story-thumb-item" data-index="3" title="Capítulo 04: El Sí, Para Siempre">
            <img src="assets/img/couple-story-3.jpg" alt="Miniatura 4" loading="lazy" />
            <div class="story-thumb-overlay"><span class="story-thumb-num">04 · El Sí</span></div>
          </div>
          <div class="story-thumb-item" data-index="4" title="Capítulo 05: Paso a Paso">
            <img src="assets/img/couple-story-4.jpg" alt="Miniatura 5" loading="lazy" />
            <div class="story-thumb-overlay"><span class="story-thumb-num">05 · Metas</span></div>
          </div>
          <div class="story-thumb-item" data-index="5" title="Capítulo 06: Amor Inquebrantable">
            <img src="assets/img/couple-story-5.jpg" alt="Miniatura 6" loading="lazy" />
            <div class="story-thumb-overlay"><span class="story-thumb-num">06 · Unión</span></div>
          </div>
          <div class="story-thumb-item" data-index="6" title="Capítulo 07: Rumbo al Altar">
            <img src="assets/img/couple-portrait.jpg" alt="Miniatura 7" loading="lazy" />
            <div class="story-thumb-overlay"><span class="story-thumb-num">07 · La Boda</span></div>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== SECCIÓN DE SUBIDA: ÁLBUM COLABORATIVO (ESTILO VERSION 1 ELEGANTE) ==================== -->
    <section class="section-wrapper upload-main-section" id="subir">
      <div class="section-head">
        <span class="section-tag">Álbum Colaborativo</span>
        <h2 class="section-title">Comparte tus Momentos</h2>
        <div class="section-divider">
          <span class="divider-line"></span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
          <span class="divider-line"></span>
        </div>
        <p class="section-desc">
          Toma una foto en vivo o sube las imágenes y videos que tomaste durante la fiesta para crear juntos nuestro álbum de bodas.
        </p>
      </div>

      <div class="upload-card-wrapper">
        <!-- Banner del invitado y cuota de recuerdos -->
        <div class="guest-status-banner">
          <div class="guest-info-side">
            <div class="guest-avatar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
            </div>
            <div class="guest-texts">
              <span class="guest-album-tag">Tu Álbum Personal</span>
              <h3 class="guest-album-title" id="bannerGuestName">Comparte tus momentos con nosotros</h3>
            </div>
          </div>
          <div class="quota-pill" id="guestQuotaPill">
            <span id="guestQuotaText">0 de 25 recuerdos</span>
          </div>
        </div>

        <!-- Dropzone Interactivo Grandioso (Como en Version 1 pero con diseño moderno) -->
        <div class="upload-dropzone" id="uploadDropzone">
          <div class="dropzone-icon-circle">
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
          </div>
          <h3 class="dropzone-title">Arrastra tus fotos aquí o tómalas ahora</h3>
          <p class="dropzone-subtitle">Fotos y videos en alta calidad (hasta 2MB cada uno · máx. 25 archivos por invitado)</p>

          <div class="upload-two-buttons">
            <!-- Botón 1: Subir desde Galería / Dispositivo -->
            <button type="button" class="btn btn-upload-gallery" id="btnUploadFromDevice" title="Subir fotos o videos guardados">
              <span class="btn-action-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              </span>
              <span class="btn-action-label">Subir de Galería</span>
            </button>

            <!-- Botón 2: Tomar con la Cámara -->
            <button type="button" class="btn btn-upload-camera" id="btnCaptureFromCamera" title="Tomar foto o video con la cámara">
              <span class="btn-action-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
              </span>
              <span class="btn-action-label">Tomar con Cámara</span>
            </button>
          </div>

          <!-- Inputs invisibles asociados -->
          <input type="file" id="inputUploadDevice" accept="image/*,video/*" style="position:fixed; top:-9999px; left:-9999px; opacity:0; width:1px; height:1px; pointer-events:none;" />
          <input type="file" id="inputNativePhoto" accept="image/*" capture="environment" style="position:fixed; top:-9999px; left:-9999px; opacity:0; width:1px; height:1px; pointer-events:none;" />
          <input type="file" id="inputNativeVideo" accept="video/*" capture="environment" style="position:fixed; top:-9999px; left:-9999px; opacity:0; width:1px; height:1px; pointer-events:none;" />
        </div>

        <!-- Barra de Progreso de Subida Animada -->
        <div class="upload-progress-wrapper" id="uploadProgress">
          <div class="upload-progress-bar-bg">
            <div class="upload-progress-bar-fill" id="progressBarFill"></div>
          </div>
          <div id="progressText" style="font-size:0.86rem; margin-top:10px; color:var(--color-olive); font-weight:600; text-align:center;">
            Subiendo momento especial...
          </div>
        </div>
      </div>
    </section>

    <!-- GALERÍA COLECTIVA EN TIEMPO REAL (VISTA PREVIA Y ACCESO RÁPIDO) -->
    <section class="section-wrapper" id="galeria">
      <div class="section-head">
        <span class="section-tag">Galería de Invitados</span>
        <h2 class="section-title">Momentos Inolvidables</h2>
        <div class="section-divider">
          <span class="divider-line"></span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
          <span class="divider-line"></span>
        </div>
        <p class="section-desc">
          Revive cada sonrisa, cada baile y cada abrazo capturado por todos nuestros invitados en tiempo real.
        </p>
      </div>

      <!-- Filtros y botón manual de refresco de la galería -->
      <div class="gallery-controls-bar">
        <div class="gallery-tabs">
          <button class="tab-btn active" data-filter="all">Todos los Momentos</button>
          <button class="tab-btn" data-filter="my">Mis Fotos</button>
          <button class="tab-btn" data-filter="popular">Más Queridas ♥</button>
        </div>
        <button type="button" class="btn-refresh-gallery" id="btnRefreshGallery" title="Buscar nuevas fotos subidas recientemente">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
          <span>Refrescar</span>
        </button>
        <a href="/galeria" class="tab-btn" style="background:#FFF; color:var(--color-olive); border-color:var(--color-gold); text-decoration:none;" title="Ver la galería en pantalla completa estilo Pinterest">
          Abrir Página de Galería ↗
        </a>
      </div>

      <!-- Grid de fotos y videos (Estilo Pinterest) -->
      <div class="gallery-grid" id="galleryGrid">
        <!-- Renderizado dinámico vía app.js -->
      </div>

      <div id="galleryEmpty" style="display:none; text-align:center; padding:50px 20px;">
        <p style="font-family:var(--font-serif); font-size:1.6rem; color:var(--color-burgundy); margin-bottom:8px;">
          ¡Aún no hay fotos en esta sección!
        </p>
        <p style="color:var(--color-text-secondary); max-width:400px; margin:0 auto 20px;">
          Sé el primero en estrenar el álbum de la boda compartiendo tu fotografía o video.
        </p>
        <button class="btn btn-primary" onclick="document.getElementById('inputUploadDevice').click();">
          Subir primer recuerdo
        </button>
      </div>
    </section>

    <!-- LIBRO DE FIRMAS Y BUENOS DESEOS -->
    <!-- ==================== LIBRO DE FIRMAS REDISEÑADO: LIBRO DE HONOR Y DEDICATORIAS ==================== -->
    <section class="section-wrapper guestbook-section" id="libro">
      <div class="section-head">
        <span class="section-tag">Libro de Honor &amp; Recuerdos</span>
        <h2 class="section-title">Dedicatorias de Amor</h2>
        <div class="section-divider">
          <span class="divider-line"></span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          <span class="divider-line"></span>
        </div>
        <p class="section-desc">
          Tus palabras y bendiciones son el regalo más hermoso para el nuevo hogar de Michelle &amp; René.
        </p>
      </div>

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
              <textarea id="gbMessage" class="gb-textarea-field" placeholder="Escribe aquí tu dedicatoria con todo tu cariño..." required></textarea>
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
          <a href="/firmas" class="gb-chip-btn" style="text-decoration:none; font-weight:600;">
            Ver Libro Completo ↗
          </a>
        </div>

        <!-- Muro de Cartas de Amor -->
        <div class="guestbook-letters-grid" id="guestbookList">
          <!-- Renderizado dinámico vía app.js -->
        </div>
      </div>
    </section>
  </main>

  <!-- FOOTER ELEGANTE -->
  <footer style="background:#1E271A; color:#E3EADF; padding:50px 24px 90px; text-align:center; border-top:1px solid rgba(212,175,55,0.3);">
    <div style="font-family:var(--font-script); font-size:3.2rem; color:var(--color-gold-light); margin-bottom:6px;">
      Michelle & René
    </div>
    <p style="font-size:0.85rem; letter-spacing:0.25em; text-transform:uppercase; color:var(--color-gold); margin-bottom:20px;">
      19 de Diciembre de 2026
    </p>
    <p style="font-size:0.92rem; color:#BDCAB8; max-width:500px; margin:0 auto 30px;">
      Gracias por ser parte indispensable de nuestra historia de amor.
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
        <a href="/" class="mobile-nav-btn active">
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

  <!-- MODAL DE INGRESO DEL INVITADO (Con opción de cerrar y visualización de nombre actual) -->
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

  <!-- ==================== LIGHTBOX CINEMATOGRÁFICO DE PANTALLA COMPLETA ==================== -->
  <div class="gallery-lightbox" id="gallery-lightbox" role="dialog" aria-modal="true" aria-label="Visor de fotos">
    <button class="lightbox-close" id="lightboxClose" type="button" aria-label="Cerrar visor">&times;</button>
    <button class="lightbox-nav lightbox-prev" id="lightboxPrev" type="button" aria-label="Foto anterior">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
    </button>
    <button class="lightbox-nav lightbox-next" id="lightboxNext" type="button" aria-label="Siguiente foto">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
    </button>
    <div class="lightbox-media-container" id="lightboxMediaContainer">
      <img id="lightboxImg" class="lightbox-media" src="" alt="Recuerdo de boda" style="display:none;" />
      <video id="lightboxVideo" class="lightbox-media" controls playsinline style="display:none;"></video>
    </div>
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

  <!-- MODAL DE CÁMARA EN VIVO (VISOR DIRECTO PARA FOTOS Y VIDEOS) -->
  <div class="camera-modal-backdrop" id="cameraModal">
    <div class="camera-modal-container">
      <div class="camera-modal-header">
        <div class="camera-title-wrap">
          <span class="camera-live-dot"></span>
          <span class="camera-title">Cámara de la Boda</span>
        </div>
        <div class="camera-header-actions">
          <button type="button" class="camera-icon-btn" id="btnCameraFlip" title="Cambiar de cámara (Frontal / Trasera)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 10c0-4.418-3.582-8-8-8s-8 3.582-8 8c0 1.954.703 3.743 1.87 5.13L4 17h6v-6L8.43 12.57C7.54 11.66 7 10.4 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.4-.54 2.66-1.43 3.57L14 11v6h6l-1.87-1.87C19.297 13.743 20 11.954 20 10z"></path></svg>
          </button>
          <button type="button" class="camera-icon-btn" id="btnCameraClose" title="Cerrar cámara">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>

      <div class="camera-viewport-wrap">
        <video id="cameraVideo" playsinline autoplay muted></video>
        <canvas id="cameraCanvas" style="display:none;"></canvas>

        <div class="camera-flash" id="cameraFlash"></div>

        <div class="camera-rec-badge" id="cameraRecBadge" style="display:none;">
          <span class="rec-dot"></span>
          <span id="cameraRecTimer">00:00</span>
        </div>

        <!-- Vista previa de la captura -->
        <div class="camera-preview-overlay" id="cameraPreviewOverlay" style="display:none;">
          <img id="cameraPreviewImg" src="" alt="Foto capturada" style="display:none;" />
          <video id="cameraPreviewVideo" playsinline controls style="display:none;"></video>
          <div class="camera-preview-bar">
            <button type="button" class="btn btn-outline btn-sm" id="btnCameraRetake">
              ↺ Tomar otra
            </button>
            <button type="button" class="btn btn-primary btn-sm" id="btnCameraConfirm">
              ✓ Subir Recuerdo
            </button>
          </div>
        </div>
      </div>

      <div class="camera-controls-panel">
        <div class="camera-mode-tabs">
          <button type="button" class="camera-mode-btn active" data-mode="photo" id="modePhotoBtn">Foto</button>
          <button type="button" class="camera-mode-btn" data-mode="video" id="modeVideoBtn">Video</button>
        </div>

        <div class="camera-shutter-row">
          <!-- Disparador de foto -->
          <button type="button" class="camera-shutter-btn" id="btnCameraShutter" title="Capturar foto">
            <span class="shutter-inner"></span>
          </button>

          <!-- Botón de grabar video (modo video) -->
          <button type="button" class="camera-record-btn" id="btnCameraRecord" style="display:none;" title="Grabar video">
            <span class="record-inner"></span>
          </button>
        </div>

        <div class="camera-native-fallback">
          <span class="camera-native-title">¿Prefieres la app de cámara de tu celular?</span>
          <div class="camera-native-buttons">
            <button type="button" class="camera-pill-btn" id="btnLaunchNativePhoto">
              📸 Cámara de Fotos
            </button>
            <button type="button" class="camera-pill-btn" id="btnLaunchNativeVideo">
              🎥 Cámara de Video
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>


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

    <!-- Contenedor de Alertas Toast Elegantes -->
  <div class="toast-container" id="toastContainer"></div>

  <!-- Scripts -->
  <script src="assets/js/app.js"></script>
</body>
</html>
