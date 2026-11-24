<?php
$pageTitle = 'Cámara y Recuerdos · Boda Michelle & René';
$pageDesc = 'Toma fotos, graba videos en vivo o elige tus mejores recuerdos de la boda de Michelle y René.';
$themeColor = '#FAF7F2';
$activePage = 'camera';
$navTransparent = false;
$uploadsClosed = !empty($uploadsClosed);
$uploadDeadlineIso = (string) ($uploadDeadlineIso ?? '2026-12-21T23:59:59-06:00');
$uploadDeadlineLabel = (string) ($uploadDeadlineLabel ?? '21 de diciembre de 2026');
?>
<!DOCTYPE html>
<html lang="es-MX">
<head>
<?php require __DIR__ . '/partials/pwa_head.php'; ?>
</head>
<body class="page-camera app-page-enter<?= $uploadsClosed ? ' is-uploads-closed' : '' ?>"
      data-uploads-closed="<?= $uploadsClosed ? '1' : '0' ?>"
      data-upload-deadline="<?= htmlspecialchars($uploadDeadlineIso, ENT_QUOTES, 'UTF-8') ?>">

<?php require __DIR__ . '/partials/preloader.php'; ?>

<?php require __DIR__ . '/partials/navbar.php'; ?>

  <main class="camera-hub-main">
    <section class="camera-hub-container">
      <!-- Encabezado y Cupo del Invitado -->
      <header class="camera-hub-header">
        <span class="section-tag">Álbum en Vivo</span>
        <h1 class="camera-hub-title">Comparte tus Momentos</h1>
        <p class="camera-hub-desc">
          Toma varias fotos o videos, elige tus favoritos y publícalos al instante (hasta 24 recuerdos, máx. 4 videos de 20 s), o sube directo desde tu galería. Disponible hasta el <?= htmlspecialchars($uploadDeadlineLabel, ENT_QUOTES, 'UTF-8') ?>.
        </p>

      </header>

      <!-- AVISO DE CIERRE DE SUBIDAS (DESPUÉS DEL 21 DE DICIEMBRE DE 2026) -->
      <div class="upload-closed-banner" id="uploadClosedBanner" style="display:<?= $uploadsClosed ? 'flex' : 'none' ?>;" role="status">
        <div class="upload-closed-icon" aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        </div>
        <div class="upload-closed-body">
          <h3>El periodo de subida cerró el <?= htmlspecialchars($uploadDeadlineLabel, ENT_QUOTES, 'UTF-8') ?></h3>
          <p>Ya no es posible subir nuevas fotos ni videos al álbum, pero puedes seguir explorando y descargando todos los recuerdos compartidos.</p>
          <a href="/galeria" class="btn-mini-gallery app-nav-link" style="display:inline-flex; margin-top:10px;">Explorar Galería ↗</a>
        </div>
      </div>

      <!-- LAS 3 OPCIONES PRINCIPALES DE CAPTURA (GUARDAN EN ESPERA EN CACHÉ LOCAL) -->
      <div class="camera-options-grid" id="cameraOptionsGrid" style="<?= $uploadsClosed ? 'display:none;' : '' ?>">
        <!-- Opción 1: Tomar Fotos (Abre cámara nativa del teléfono) -->
        <button type="button" class="camera-option-card option-photo" id="btnLivePhotoCamera"<?= $uploadsClosed ? ' disabled' : '' ?>>
          <div class="option-icon-wrap">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
          </div>
          <div class="option-body">
            <h3>Tomar Foto</h3>
            <p>Usa la cámara de tu teléfono y elige cuáles publicar.</p>
          </div>
          <span class="option-pill">Cámara</span>
        </button>

        <!-- Opción 2: Tomar Video (Abre cámara nativa de video del teléfono) -->
        <button type="button" class="camera-option-card option-video" id="btnLiveVideoCamera"<?= $uploadsClosed ? ' disabled' : '' ?>>
          <div class="option-icon-wrap">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
          </div>
          <div class="option-body">
            <h3>Tomar Video</h3>
            <p>Graba con la cámara de tu teléfono (máx. 20 s) y elige cuáles publicar.</p>
          </div>
          <span class="option-pill">Hasta 20s</span>
        </button>

        <!-- Opción 3: Subir de Galería (Selección múltiple y publicación inmediata) -->
        <button type="button" class="camera-option-card option-gallery" id="btnUploadFromDevice"<?= $uploadsClosed ? ' disabled' : '' ?>>
          <div class="option-icon-wrap">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
          </div>
          <div class="option-body">
            <h3>Subir de Galería</h3>
            <p>Elige varias fotos o videos y publícalos al instante.</p>
          </div>
          <span class="option-pill">Directo</span>
        </button>
      </div>

      <!-- Inputs ocultos: cámara nativa (foto/video) y galería múltiple -->
      <input type="file" id="inputNativePhotoCamera" class="sr-only-file-input" accept="image/*" capture="environment" tabindex="-1" aria-hidden="true" />
      <input type="file" id="inputNativeVideoCamera" class="sr-only-file-input" accept="video/*" capture="environment" tabindex="-1" aria-hidden="true" />
      <input type="file" id="inputUploadDevice" class="sr-only-file-input" accept="image/*,video/*" multiple tabindex="-1" aria-hidden="true" />

      <!-- Barra de Progreso de Publicación / Subida (Por lotes) -->
      <div class="upload-progress-wrapper camera-upload-progress" id="uploadProgress" style="display:none;">
        <div class="upload-progress-bar-bg">
          <div class="upload-progress-bar-fill" id="progressBarFill"></div>
        </div>
        <div id="progressText" class="camera-progress-label">Optimizando y publicando recuerdos...</div>
      </div>

      <!-- CARRETE EN ESPERA (CACHÉ LOCAL ANTES DE PUBLICAR A R2) -->
      <section class="standby-section" id="standbySection" style="<?= $uploadsClosed ? 'display:none;' : '' ?>">
        <div class="standby-head">
          <div class="standby-title-group">
            <div class="standby-title-row">
              <h2 class="standby-title">En Espera · Galería Temporal</h2>
              <span class="standby-count-pill" id="standbyTotalBadge">0 guardados</span>
            </div>

            <p class="standby-cache-note">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              <span>Se guardan en la caché de tu navegador: si borras las cookies o datos del sitio antes de publicar, se eliminarán.</span>
            </p>
          </div>
        </div>

        <!-- Barra de Selección y Botón Publicar -->
        <div class="standby-toolbar" id="standbyToolbar" style="display:none;">
          <div class="standby-selection-info">
            <span class="standby-sel-counter" id="standbySelectionSummary">0 seleccionados · 0/4 videos</span>
            <div class="standby-quick-actions">
              <button type="button" class="btn-standby-ghost" id="btnStandbyAutoSelect">Auto-elegir</button>
              <button type="button" class="btn-standby-ghost" id="btnStandbyDeselectAll">Desmarcar</button>
              <button type="button" class="btn-standby-ghost is-danger" id="btnStandbyClearAll">Vaciar</button>
            </div>
          </div>

          <button type="button" class="btn-publish-standby" id="btnPublishStandby" disabled>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"></path><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            <span id="btnPublishStandbyLabel">Publicar seleccionados</span>
          </button>
        </div>

        <div class="standby-grid" id="standbyGrid">
          <!-- Renderizado dinámico por app.js -->
        </div>

        <div class="standby-empty" id="standbyEmpty">
          <div class="standby-empty-icon" aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
          </div>
          <h3>Tu carrete en espera está vacío</h3>
          <p>Toma fotos, graba videos o agrega desde tu galería. Aquí podrás revisarlos con calma y elegir los mejores antes de publicarlos.</p>
        </div>

          <div class="camera-quota-meter">
            <div class="camera-quota-bar">
              <div class="camera-quota-fill" id="quotaProgressFill" style="width: 0%;"></div>
              <div class="camera-quota-fill-selected" id="quotaSelectedFill" style="left: 0%; width: 0%;"></div>
            </div>
            <div class="camera-quota-numbers">
              <span id="guestQuotaText">0 de 24 publicados · 0/4 videos</span>
              <span id="guestQuotaRemaining">Te quedan 24 (máx. 4 videos)</span>
            </div>
          </div>
      </section>

      <!-- GESTIÓN DE FOTOS Y VIDEOS YA PUBLICADOS POR EL INVITADO -->
      <section class="my-uploads-section" id="myUploadsSection">
        <div class="my-uploads-head">
          <div>
            <h2 class="my-uploads-title">Mis Recuerdos Publicados</h2>
            </div>
          <div class="my-uploads-actions">
            <button type="button" class="btn-mini-refresh" id="btnRefreshMyUploads" title="Actualizar mis recuerdos">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
            </button>
          </div>
        </div>

        <div class="my-uploads-grid" id="myUploadsGrid">
          <!-- Renderizado dinámico por app.js -->
        </div>

        <div class="my-uploads-empty" id="myUploadsEmpty" style="display:none;">
          <div class="my-uploads-empty-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
          </div>
          <h3>Aún no has publicado recuerdos</h3>
          <p>Captura tus momentos, elige tus favoritos y pulsa <strong>Publicar</strong> para compartirlos.</p>
        </div>
      </section>
    </section>
  </main>

  <!-- MODAL DE SELECCIÓN POST-CAPTURA (ELEGIR QUÉ PUBLICAR O GUARDAR EN TEMPORALES) -->
  <div class="capture-review-modal" id="captureReviewModal" role="dialog" aria-modal="true" aria-labelledby="captureReviewTitle">
    <div class="capture-review-shell">
      <header class="capture-review-header">
        <div class="capture-review-heading">
          <h2 class="capture-review-title" id="captureReviewTitle">Elige qué publicar</h2>
          <p class="capture-review-subtitle" id="captureReviewSubtitle">0 seleccionados</p>
        </div>
        <button type="button" class="capture-review-close" id="btnReviewCancelTop" title="Cancelar y guardar en temporales" aria-label="Cancelar y guardar en temporales">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </header>

      <div class="capture-review-toolbar" id="captureReviewToolbar">
        <span class="capture-review-count" id="captureReviewCountText">0 capturas</span>
        <div class="capture-review-quick-actions">
          <button type="button" class="btn-standby-ghost" id="btnReviewSelectAll">Elegir todo</button>
          <button type="button" class="btn-standby-ghost" id="btnReviewDeselectAll">Desmarcar</button>
        </div>
      </div>

      <div class="capture-review-body">
        <div class="capture-review-grid" id="captureReviewGrid"></div>
        <div class="capture-review-empty" id="captureReviewEmpty" style="display:none;">
          <p>Eliminaste todas las capturas de esta sesión.</p>
          <button type="button" class="btn btn-primary" id="btnReviewEmptyRetake">Volver a capturar</button>
        </div>
      </div>

      <footer class="capture-review-footer">
        <p class="capture-review-note">Las capturas que no publiques (o si cancelas) quedarán guardadas en tu <strong>Galería Temporal</strong>.</p>
        <div class="capture-review-secondary-row">
          <button type="button" class="capture-review-btn-more" id="btnReviewCaptureMore">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
            <span id="btnReviewCaptureMoreLabel">Tomar más fotos</span>
          </button>
          <button type="button" class="capture-review-btn-cancel" id="btnReviewSaveLater">
            Cancelar
          </button>
        </div>
        <button type="button" class="capture-review-btn-publish" id="btnReviewPublishNow" disabled>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"></path><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          <span id="btnReviewPublishLabel">Publicar ahora</span>
        </button>
      </footer>
    </div>
  </div>

<?php require __DIR__ . '/partials/shared_modals.php'; ?>

  <script src="/assets/js/vendor/browser-image-compression.js?v=2.0.2"></script>
  <script src="/assets/js/media-download.js?v=1"></script>
  <script src="/assets/js/app.js?v=57"></script>
</body>
</html>
