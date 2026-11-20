<?php
/**
 * Shared Modals: Guest Profile Modal, Fullscreen Lightbox, Toast Container
 */
?>
  <!-- MODAL DE PERFIL DEL INVITADO -->
  <div class="modal-backdrop" id="guestModal">
    <div class="modal-dialog">
      <button type="button" class="modal-close-btn" id="guestModalClose" title="Cerrar sin guardar cambios" style="display:none;">&times;</button>

      <div class="modal-icon-badge">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
      </div>
      <h3 class="modal-title">Tu Perfil de Invitado</h3>
      <p class="modal-subtitle">
        Escribe tu nombre para que tus fotos, videos y firmas queden guardados con tu sello.
      </p>

      <div class="modal-current-info" style="display:none;">
        Nombre registrado actualmente: <br><strong id="guestModalCurrentName">Invitado</strong>
      </div>

      <form id="guestForm">
        <div class="form-group" style="text-align:left;">
          <label for="guestNameInput" style="display:block; font-size:0.78rem; text-transform:uppercase; letter-spacing:0.1em; color:var(--color-olive); margin-bottom:6px; font-weight:600;">Tu nombre o familia</label>
          <input type="text" id="guestNameInput" class="form-control" placeholder="Ej. Familia Rodríguez" required autocomplete="name" />
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%; padding:14px;">
          Continuar →
        </button>
      </form>
    </div>
  </div>

  <!-- VISOR ESTILO INSTAGRAM DE PANTALLA COMPLETA -->
  <div class="gallery-lightbox" id="gallery-lightbox" role="dialog" aria-modal="true" aria-label="Visor de recuerdos">
    <!-- Cabecera superior estilo Instagram -->
    <div class="lightbox-header">
      <div class="lightbox-header-inner">
        <div class="lightbox-user">
          <div class="lightbox-avatar" id="lightboxAvatar" aria-hidden="true">MR</div>
          <div class="lightbox-user-info">
            <span id="lightboxAuthor" class="lightbox-author">Invitado</span>
            <span id="lightboxTime" class="lightbox-time">Hace instantes</span>
          </div>
        </div>
        <div class="lightbox-header-right">
          <span id="lightboxCounter" class="lightbox-counter">1 / 1</span>
          <button class="lightbox-close" id="lightboxClose" type="button" aria-label="Cerrar visor" title="Cerrar">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Escenario central del recuerdo -->
    <div class="lightbox-media-container" id="lightboxMediaContainer">
      <button class="lightbox-nav lightbox-prev" id="lightboxPrev" type="button" aria-label="Anterior">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </button>

      <img id="lightboxImg" class="lightbox-media" src="" alt="Recuerdo de boda" style="display:none;" />
      <video id="lightboxVideo" class="lightbox-media" controls playsinline preload="none" style="display:none;"></video>

      <div class="lightbox-heart-burst" id="lightboxHeartBurst" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
      </div>

      <button class="lightbox-nav lightbox-next" id="lightboxNext" type="button" aria-label="Siguiente">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </button>
    </div>

    <!-- Barra inferior de iconos estilo Instagram -->
    <div class="lightbox-bottom">
      <div class="lightbox-bottom-inner">
        <div class="lightbox-actions-row">
          <div class="lightbox-actions-left">
            <button type="button" id="lightboxLikeBtn" class="lightbox-icon-btn lightbox-like" aria-label="Dar me gusta" title="Me gusta">
              <svg class="lb-heart-svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            </button>
            <div class="lightbox-likes-text" id="lightboxLikesWrap">
              <strong id="lightboxLikeCount">0</strong>
              <span id="lightboxLikesLabel">me gusta</span>
            </div>
            <button type="button" id="lightboxStandbySelectBtn" class="lightbox-standby-select-btn" style="display:none;">
              <span class="lb-sel-check" aria-hidden="true">✓</span>
              <span id="lightboxStandbySelectLabel">Seleccionar para publicar</span>
            </button>
          </div>

          <div class="lightbox-actions-right">
            <a id="lightboxDownloadBtn" href="#" download class="lightbox-icon-btn lightbox-download" aria-label="Descargar en alta resolución" title="Descargar">
              <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            </a>
            <button type="button" id="lightboxDeleteBtn" class="lightbox-icon-btn lightbox-delete" aria-label="Eliminar mi recuerdo" title="Eliminar" style="display:none;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL DE CONFIRMACIÓN Y ALERTAS ELEGANTES -->
  <div class="app-confirm-backdrop" id="appConfirmModal" role="alertdialog" aria-modal="true" aria-labelledby="appConfirmTitle" aria-describedby="appConfirmMsg" aria-hidden="true">
    <div class="app-confirm-dialog is-danger" id="appConfirmDialog">
      <div class="app-confirm-ornament" aria-hidden="true">
        <span></span>
        <i>✦</i>
        <span></span>
      </div>
      <div class="app-confirm-icon" id="appConfirmIcon" aria-hidden="true">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
      </div>
      <h3 class="app-confirm-title" id="appConfirmTitle">¿Confirmar acción?</h3>
      <p class="app-confirm-msg" id="appConfirmMsg"></p>
      <div class="app-confirm-actions">
        <button type="button" class="app-confirm-btn app-confirm-cancel" id="appConfirmCancel">Cancelar</button>
        <button type="button" class="app-confirm-btn app-confirm-ok" id="appConfirmOk">Confirmar</button>
      </div>
    </div>
  </div>

  <!-- CONTENEDOR DE ALERTAS TOAST -->
  <div class="toast-container" id="toastContainer" aria-live="polite" aria-atomic="false"></div>

  <!-- AVISO ELEGANTE DE ORIENTACIÓN VERTICAL EN TELÉFONOS (BLOQUEO HORIZONTAL) -->
  <div class="orientation-lock-overlay" id="orientationLockOverlay" role="dialog" aria-modal="true" aria-labelledby="orientationLockTitle" aria-hidden="true">
    <div class="orientation-lock-card">
      <div class="orientation-lock-visual" aria-hidden="true">
        <div class="orientation-phone-frame">
          <span class="orientation-phone-notch"></span>
          <span class="orientation-phone-monogram">M&amp;R</span>
          <span class="orientation-phone-bar"></span>
        </div>
        <svg class="orientation-rotate-arrow" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
          <path d="M3 3v5h5"></path>
        </svg>
      </div>
      <div class="orientation-lock-copy">
        <div class="orientation-lock-eyebrow">
          <span></span>
          <i>✦</i>
          <span>Michelle &amp; René</span>
          <i>✦</i>
          <span></span>
        </div>
        <h2 class="orientation-lock-title" id="orientationLockTitle">Gira tu teléfono a vertical</h2>
        <p class="orientation-lock-desc">
          Esta experiencia está diseñada en formato vertical para que nada se desacomode al recorrer nuestra boda.
        </p>
      </div>
    </div>
  </div>
