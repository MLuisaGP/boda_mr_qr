<?php
$pageTitle = 'Cámara y Recuerdos · Boda Michelle & René';
$pageDesc = 'Toma fotos, graba videos en vivo o sube tus recuerdos de la boda de Michelle y René.';
$themeColor = '#FAF7F2';
$activePage = 'camera';
$navTransparent = false;
?>
<!DOCTYPE html>
<html lang="es-MX">
<head>
<?php require __DIR__ . '/partials/pwa_head.php'; ?>
</head>
<body class="page-camera app-page-enter">

<?php require __DIR__ . '/partials/navbar.php'; ?>

  <main class="camera-hub-main">
    <section class="camera-hub-container">
      <!-- Encabezado y Cupo del Invitado -->
      <header class="camera-hub-header">
        <span class="section-tag">Álbum en Vivo</span>
        <h1 class="camera-hub-title">Comparte tus Momentos</h1>
        <p class="camera-hub-desc">
          Elige cómo capturar el instante. Puedes subir varios recuerdos (hasta 24 en total).
        </p>

        <!-- Tarjeta de Estado y Cupo del Invitado -->
        <div class="camera-quota-card">
          <div class="camera-quota-top">
            <div class="camera-quota-user">
              <div class="guest-avatar-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <div>
                <div class="camera-quota-label">Tu Álbum Personal</div>
                <div class="camera-quota-name" id="bannerGuestName">Identifícate para guardar tus recuerdos</div>
              </div>
            </div>
            <button type="button" class="camera-edit-profile-btn" onclick="if(window.promptGuestName) window.promptGuestName(true);">
              Cambiar
            </button>
          </div>

          <div class="camera-quota-meter">
            <div class="camera-quota-bar">
              <div class="camera-quota-fill" id="quotaProgressFill" style="width: 0%;"></div>
            </div>
            <div class="camera-quota-numbers">
              <span id="guestQuotaText">0 de 24 recuerdos</span>
              <span id="guestQuotaRemaining">Te quedan 24 disponibles</span>
            </div>
          </div>
        </div>
      </header>

      <!-- LAS 3 OPCIONES PRINCIPALES DE CAPTURA Y SUBIDA -->
      <div class="camera-options-grid">
        <!-- Opción 1: Tomar Fotos (Abre cámara directamente) -->
        <button type="button" class="camera-option-card option-photo" id="btnLivePhotoCamera">
          <div class="option-icon-wrap">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
          </div>
          <div class="option-body">
            <h3>Tomar Fotos</h3>
            <p>Abre la cámara al instante y toma una o varias fotos seguidas.</p>
          </div>
          <span class="option-pill">Cámara Directa</span>
        </button>

        <!-- Opción 2: Tomar Video (Abre cámara de video directamente) -->
        <button type="button" class="camera-option-card option-video" id="btnLiveVideoCamera">
          <div class="option-icon-wrap">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
          </div>
          <div class="option-body">
            <h3>Tomar Video</h3>
            <p>Abre la cámara en modo video y graba uno o varios clips cortos.</p>
          </div>
          <span class="option-pill">Video en Vivo</span>
        </button>

        <!-- Opción 3: Subir de Galería (Selección múltiple de fotos y videos) -->
        <button type="button" class="camera-option-card option-gallery" id="btnUploadFromDevice">
          <div class="option-icon-wrap">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
          </div>
          <div class="option-body">
            <h3>Subir de Galería</h3>
            <p>Selecciona varias fotos o videos guardados en tu teléfono.</p>
          </div>
          <span class="option-pill">Selección Múltiple</span>
        </button>
      </div>

      <!-- Input exclusivo para la opción 3 (Subir de Galería) con soporte múltiple -->
      <input type="file" id="inputUploadDevice" accept="image/*,video/*" multiple style="position:fixed; top:-9999px; left:-9999px; opacity:0; width:1px; height:1px; pointer-events:none;" />

      <!-- Barra de Progreso de Subida (Por lotes) -->
      <div class="upload-progress-wrapper camera-upload-progress" id="uploadProgress" style="display:none;">
        <div class="upload-progress-bar-bg">
          <div class="upload-progress-bar-fill" id="progressBarFill"></div>
        </div>
        <div id="progressText" class="camera-progress-label">Subiendo recuerdos...</div>
      </div>

      <!-- GESTIÓN DE FOTOS Y VIDEOS SUBIDOS POR EL INVITADO -->
      <section class="my-uploads-section" id="myUploadsSection">
        <div class="my-uploads-head">
          <div>
            <h2 class="my-uploads-title">Gestionar mis Fotos y Videos</h2>
            <p class="my-uploads-sub">Revisa, descarga o elimina los recuerdos que has compartido.</p>
          </div>
          <div class="my-uploads-actions">
            <button type="button" class="btn-mini-refresh" id="btnRefreshMyUploads" title="Actualizar mis recuerdos">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
            </button>
            <a href="/galeria" class="btn-mini-gallery app-nav-link">Ver Galería ↗</a>
          </div>
        </div>

        <div class="my-uploads-grid" id="myUploadsGrid">
          <!-- Renderizado dinámico por app.js -->
        </div>

        <div class="my-uploads-empty" id="myUploadsEmpty" style="display:none;">
          <div class="my-uploads-empty-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
          </div>
          <h3>Aún no has subido recuerdos</h3>
          <p>Usa cualquiera de las tres opciones de arriba para empezar a llenar el álbum de Michelle &amp; René.</p>
        </div>
      </section>
    </section>
  </main>

  <!-- VISOR DE CÁMARA EN VIVO FULLSCREEN (SIN OPCIÓN DE SUBIR ARCHIVOS) -->
  <div class="live-camera-modal" id="liveCameraModal" role="dialog" aria-modal="true" aria-label="Cámara de la boda">
    <!-- Barra Superior de la Cámara -->
    <div class="live-cam-topbar">
      <div class="live-cam-mode-pill" id="liveCamModePill">
        <span class="camera-live-dot"></span>
        <span id="liveCamModeText">Cámara de Fotos</span>
      </div>

      <div class="live-cam-top-right">
        <span class="live-cam-quota-chip" id="liveCamQuotaChip">0 / 24</span>
        <button type="button" class="live-cam-icon-btn" id="btnCameraFlip" title="Cambiar cámara (Frontal / Trasera)" aria-label="Cambiar cámara">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1"><path d="M20 10c0-4.418-3.582-8-8-8s-8 3.582-8 8c0 1.954.703 3.743 1.87 5.13L4 17h6v-6L8.43 12.57C7.54 11.66 7 10.4 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.4-.54 2.66-1.43 3.57L14 11v6h6l-1.87-1.87C19.297 13.743 20 11.954 20 10z"></path></svg>
        </button>
        <button type="button" class="live-cam-icon-btn" id="btnCameraClose" title="Cerrar cámara" aria-label="Cerrar cámara">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
    </div>

    <!-- Visor en Vivo -->
    <div class="live-cam-viewport">
      <video id="cameraVideo" playsinline autoplay muted></video>
      <canvas id="cameraCanvas" style="display:none;"></canvas>
      <div class="camera-flash" id="cameraFlash"></div>

      <!-- Indicador REC (Modo Video) -->
      <div class="camera-rec-badge" id="cameraRecBadge" style="display:none;">
        <span class="rec-dot"></span>
        <span id="cameraRecTimer">00:00</span>
        <span class="rec-limit-label">/ 00:15</span>
      </div>

      <!-- Estado de Permiso / Solicitud de Cámara (Nunca muestra subida de archivos) -->
      <div class="live-cam-permission" id="cameraPermissionOverlay" style="display:none;">
        <div class="live-cam-perm-card">
          <div class="live-cam-perm-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
          </div>
          <h3 id="cameraPermTitle">Permiso de Cámara Necesario</h3>
          <p id="cameraPermMessage">
            Autoriza el acceso a la cámara (y micrófono para video) en tu teléfono para capturar tus recuerdos directamente.
          </p>
          <button type="button" class="btn btn-primary" id="btnRetryCameraPermission">
            Permitir y Abrir Cámara
          </button>
        </div>
      </div>

      <!-- Vista Previa Rápida de un Elemento de la Cola -->
      <div class="live-cam-item-preview" id="cameraItemPreview" style="display:none;">
        <img id="cameraItemPreviewImg" src="" alt="Vista previa" style="display:none;" />
        <video id="cameraItemPreviewVideo" playsinline controls style="display:none;"></video>
        <div class="live-cam-preview-actions">
          <button type="button" class="btn btn-outline" id="btnPreviewClose">Seguir capturando</button>
          <button type="button" class="btn btn-danger-soft" id="btnPreviewRemove">Eliminar este</button>
        </div>
      </div>
    </div>

    <!-- Panel Inferior: Cola Multi-Captura + Disparador + Subir Lote -->
    <div class="live-cam-bottom">
      <!-- Carrete de Capturas Múltiples de la Sesión -->
      <div class="live-cam-tray-wrap" id="cameraCaptureTrayWrap" style="display:none;">
        <div class="live-cam-tray" id="cameraCaptureTray"></div>
      </div>

      <div class="live-cam-controls-row">
        <div class="live-cam-left-slot">
          <span class="live-cam-hint" id="liveCamHint">Toca para capturar</span>
        </div>

        <!-- Botón Disparador Foto / Grabar Video -->
        <div class="live-cam-center-slot">
          <button type="button" class="camera-shutter-btn" id="btnCameraShutter" aria-label="Tomar foto">
            <span class="shutter-inner"></span>
          </button>

          <button type="button" class="camera-record-btn" id="btnCameraRecord" style="display:none;" aria-label="Grabar o detener video">
            <span class="record-inner"></span>
          </button>
        </div>

        <!-- Botón Subir Lote Capturado -->
        <div class="live-cam-right-slot">
          <button type="button" class="live-cam-upload-btn" id="btnUploadCapturedBatch" style="display:none;">
            <span>Subir</span>
            <span class="upload-batch-badge" id="uploadBatchCount">0</span>
          </button>
        </div>
      </div>
    </div>
  </div>

<?php require __DIR__ . '/partials/shared_modals.php'; ?>

  <script src="/assets/js/app.js?v=4"></script>
</body>
</html>
