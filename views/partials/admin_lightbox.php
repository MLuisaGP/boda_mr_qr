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
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  </div>

  <!-- Escenario central del recuerdo -->
  <div class="lightbox-media-container" id="lightboxMediaContainer">
    <button class="lightbox-nav lightbox-prev" id="lightboxPrev" type="button" aria-label="Anterior">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </button>

    <img id="lightboxImg" class="lightbox-media" src="" alt="Recuerdo de boda" style="display:none;" />
    <video id="lightboxVideo" class="lightbox-media" controls playsinline preload="none" style="display:none;"></video>

<button class="lightbox-nav lightbox-next" id="lightboxNext" type="button" aria-label="Siguiente">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </button>
  </div>

  <!-- Barra inferior de iconos estilo Instagram -->
  <div class="lightbox-bottom">
    <div class="lightbox-bottom-inner">
      <div class="lightbox-actions-row">
        <div class="lightbox-actions-left">
          <button type="button" id="lightboxLikeBtn" class="lightbox-icon-btn lightbox-like" aria-label="Me gusta de los invitados" title="Me gusta de los invitados" disabled>
            <svg class="lb-heart-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>

          <div class="lightbox-likes-text" id="lightboxLikesWrap">
            <strong id="lightboxLikeCount">0</strong>
            <span id="lightboxLikesLabel">me gusta</span>
          </div>
          <a id="lightboxDownloadBtn" href="#" download class="lightbox-icon-btn lightbox-download" aria-label="Descargar en alta resolución" title="Descargar">
            <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </a>
</div>

        <div class="lightbox-actions-right">

          <button type="button" id="lightboxDeleteBtn" class="lightbox-icon-btn lightbox-delete" aria-label="Eliminar recuerdo permanentemente" title="Eliminar recuerdo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
