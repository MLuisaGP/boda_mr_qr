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

  <!-- LIGHTBOX CINEMATOGRÁFICO DE PANTALLA COMPLETA -->
  <div class="gallery-lightbox" id="gallery-lightbox" role="dialog" aria-modal="true" aria-label="Visor de recuerdos">
    <button class="lightbox-close" id="lightboxClose" type="button" aria-label="Cerrar visor">&times;</button>
    <button class="lightbox-nav lightbox-prev" id="lightboxPrev" type="button" aria-label="Anterior">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
    </button>
    <button class="lightbox-nav lightbox-next" id="lightboxNext" type="button" aria-label="Siguiente">
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
        <button type="button" id="lightboxLikeBtn" class="lightbox-btn lightbox-like" title="Dar me gusta">
          <span class="lb-heart">♥</span> <span id="lightboxLikeCount">0</span>
        </button>
        <a id="lightboxDownloadBtn" href="#" download class="lightbox-btn lightbox-download" title="Descargar en alta resolución">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          <span>Descargar</span>
        </a>
        <button type="button" id="lightboxDeleteBtn" class="lightbox-btn lightbox-delete" title="Eliminar mi recuerdo" style="display:none;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          <span>Eliminar</span>
        </button>
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
