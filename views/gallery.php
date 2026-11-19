<?php
$pageTitle = 'Galería de Fotos · Boda Michelle & René';
$pageDesc = 'Explora todas las fotografías y videos capturados en vivo durante la boda de Michelle y René.';
$themeColor = '#FAF7F2';
$activePage = 'gallery';
$navTransparent = false;
?>
<!DOCTYPE html>
<html lang="es-MX">
<head>
<?php require __DIR__ . '/partials/pwa_head.php'; ?>
</head>
<body class="page-gallery app-page-enter">

<?php require __DIR__ . '/partials/navbar.php'; ?>

  <main class="gallery-page-main">
    <!-- ENCABEZADO ELEGANTE DE GALERÍA -->
    <header class="gallery-screen-header">
      <div class="gallery-title">GALERÍA</div>
      <div class="gallery-subtitle">Recuerdos capturados en vivo por nuestros invitados</div>

      <!-- Acciones Rápidas -->
      <div class="gallery-upload-area">
        <a href="/camara" class="btn-gallery-action btn-gallery-upload app-nav-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
          <span>Comparte tus momentos</span>
        </a>

        <button type="button" class="btn-gallery-action btn-gallery-refresh" id="btnRefreshGallery" title="Refrescar galería">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
        </button>
      </div>

      <!-- Pestañas de Filtrado -->
      <div class="gallery-tabs-row">
        <button type="button" class="tab-btn gallery-tab-item active" data-filter="all">Todos</button>
        <button type="button" class="tab-btn gallery-tab-item" data-filter="my">Mis Fotos</button>
        <button type="button" class="tab-btn gallery-tab-item" data-filter="popular">Más Queridas ♥</button>
      </div>
    </header>

    <!-- GRID DE GALERÍA DE ALTA GAMA -->
    <section class="gallery-grid-wrap">
      <div id="gallery-loading-state" class="gallery-empty" style="display:none;">
        <div class="gallery-spinner"></div>
        <p style="font-size:0.85rem; color:#6A7B61; letter-spacing:1px; text-transform:uppercase;">Cargando recuerdos...</p>
      </div>

      <div class="gallery-grid" id="galleryGrid">
        <!-- Renderizado dinámico con animación en cascada vía app.js -->
      </div>

      <div id="galleryEmpty" class="gallery-empty" style="display:none;">
        <div class="gallery-empty-icon">
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
        </div>
        <h3 class="gallery-empty-title">Aún no hay recuerdos aquí</h3>
        <p class="gallery-empty-desc">Sé el primero en compartir un momento especial de la boda.</p>
        <a href="/camara" class="btn-gallery-action btn-gallery-upload app-nav-link" style="margin-top:20px;">
          Abrir Cámara y Subir
        </a>
      </div>
    </section>
  </main>

<?php require __DIR__ . '/partials/shared_modals.php'; ?>

  <script src="/assets/js/app.js?v=4"></script>
</body>
</html>
