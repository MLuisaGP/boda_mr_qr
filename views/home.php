<?php
$pageTitle = 'Boda Michelle & René · 19 de Diciembre 2026';
$pageDesc = 'Celebra con nosotros la boda de Michelle y René. Comparte tus fotos, videos y firma nuestro libro de recuerdos.';
$themeColor = '#171E14';
$activePage = 'home';
$homeFloatingMenu = true;
$uploadsClosed = !empty($uploadsClosed);
$uploadDeadlineIso = (string) ($uploadDeadlineIso ?? '2026-12-21T23:59:59-06:00');
?>
<!DOCTYPE html>
<html lang="es-MX" class="home-no-scroll">
<head>
<?php require __DIR__ . '/partials/pwa_head.php'; ?>
</head>
<body class="page-home app-page-enter<?= $uploadsClosed ? ' is-uploads-closed' : '' ?>"
      data-uploads-closed="<?= $uploadsClosed ? '1' : '0' ?>"
      data-upload-deadline="<?= htmlspecialchars($uploadDeadlineIso, ENT_QUOTES, 'UTF-8') ?>">

  <!-- PRELOADER ELEGANTE (SOLO PRIMERA ENTRADA DE LA SESIÓN) -->
  <div id="interactive-preloader" aria-label="Cargando experiencia de boda" style="display:none;">
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
        <g id="preloader-center-logo"><image href="/assets/img/m&amp;r.svg" x="110" y="118" width="280" height="250" class="preloader-monogram" /></g>
      </svg>
      <div id="preloader-percentage">0%</div>
      <button id="pl-skip-btn" type="button" title="Entrar">Entrar</button>
    </div>
  </div>
  <script>
    (function () {
      var p = document.getElementById('interactive-preloader');
      if (!p) return;
      if (!sessionStorage.getItem('boda_mr_preloaded')) {
        p.style.display = 'flex';
        document.body.classList.add('loading');
      }
    })();
  </script>

<?php require __DIR__ . '/partials/navbar.php'; ?>

  <main class="app-main-home">
    <!-- PORTADA APP FULLSCREEN SIN SCROLL: FOTOS DE LOS NOVIOS CON TRANSICIÓN TENUE + PÉTALOS DE CEREZO + 3 BOTONES -->
    <section class="hero-section hero-app-cover" id="inicio">
      <!-- Fondo Slideshow con Transición Tenue entre las Fotos Seleccionadas de los Novios -->
      <div class="hero-bg-frame hero-slideshow" id="heroSlideshow" aria-hidden="true">
        <div class="hero-slide is-active">
          <img src="/assets/img/couple-portrait.jpg" alt="Michelle y René" class="hero-image">
        </div>
        <div class="hero-slide">
          <img src="/assets/img/couple-story-3.jpg" alt="Michelle y René" class="hero-image" loading="lazy">
        </div>
        <div class="hero-slide">
          <img src="/assets/img/imagen_5.jpeg" alt="Michelle y René" class="hero-image" loading="lazy">
        </div>
        <div class="hero-slide">
          <img src="/assets/img/imagen_4.jpeg" alt="Michelle y René" class="hero-image" loading="lazy">
        </div>
        <div class="hero-slide">
          <img src="/assets/img/imagen_2.jpeg" alt="Michelle y René" class="hero-image" loading="lazy">
        </div>

        <!-- Degradado suave concentrado en la parte inferior para lucir mejor a los novios -->
        <div class="hero-overlay hero-overlay-lower"></div>
      </div>

      <!-- Lluvia Tenue de Pétalos de Cerezo -->
      <canvas id="petalsCanvas" class="hero-petals-canvas" aria-hidden="true"></canvas>

      <!-- Contenido Posicionado Más Abajo para Destacar la Foto de los Novios -->
      <div class="hero-content hero-content-lower">
        <div class="hero-date-pill">
          <span class="hero-pill-dot"></span>
          <span>Nuestra Boda · 19 de Diciembre 2026</span>
          <span class="hero-pill-dot"></span>
        </div>

        <h1 class="hero-title">Michelle <span class="hero-amp"><img src="/assets/img/c-&amp;.svg" alt="&amp;" width="466" height="432"></span> René</h1>

        <p class="hero-subtitle">
          Gracias por celebrar con nosotros este día inolvidable. Captura cada sonrisa y déjanos tu recuerdo para siempre.
        </p>

        <!-- 3 BOTONES PRINCIPALES SOBRE LA IMAGEN -->
        <div class="hero-action-buttons">
          <?php if (!$uploadsClosed): ?>
          <a href="/camara" class="hero-btn hero-btn-moments app-nav-link" data-upload-cta="1">
            <span class="hero-btn-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
            </span>
            <span>Captura tus momentos</span>
          </a>
          <?php endif; ?>

          <div class="hero-btn-secondary-row">
            <a href="/firmas" class="hero-btn hero-btn-glass app-nav-link">
              <span class="hero-btn-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
              </span>
              <span>Libro de Firmas</span>
            </a>

            <a href="/galeria" class="hero-btn hero-btn-glass app-nav-link">
              <span class="hero-btn-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              </span>
              <span>Galería</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  </main>

<?php require __DIR__ . '/partials/shared_modals.php'; ?>

  <script src="/assets/js/app.js?v=25"></script>
</body>
</html>
