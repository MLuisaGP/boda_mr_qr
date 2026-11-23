/**
 * BODA MICHELLE & RENÉ — Panel de Administración (Novios y Organizadores)
 */

(function () {
  'use strict';

  const adminMenuToggle = document.getElementById('adminMenuToggle');
  const adminUserMenu = document.getElementById('adminUserMenu');
  const adminHeader = document.querySelector('.admin-header');
  const adminCompact = window.matchMedia('(max-width: 1000px)');
  function setAdminMenuOpen(open, restoreFocus = false) {
    if (!adminMenuToggle || !adminUserMenu || !adminHeader) return;
    adminHeader.classList.toggle('is-menu-open', open);
    adminMenuToggle.setAttribute('aria-expanded', String(open));
    adminMenuToggle.setAttribute('aria-label', open ? 'Cerrar menu de administracion' : 'Abrir menu de administracion');
    adminUserMenu.inert = adminCompact.matches && !open;
    if (restoreFocus) adminMenuToggle.focus();
  }
  if (adminMenuToggle) {
    adminMenuToggle.addEventListener('click', () => setAdminMenuOpen(adminMenuToggle.getAttribute('aria-expanded') !== 'true'));
    adminCompact.addEventListener('change', () => setAdminMenuOpen(false));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && adminMenuToggle.getAttribute('aria-expanded') === 'true') { setAdminMenuOpen(false, true); }
    });
    setAdminMenuOpen(false);
  }

  let allMediaItems = [];
  let visibleMediaItems = [];
  const selectedMediaIds = new Set();
  let allGuestbookEntries = [];
  let adminMediaPage = 0;
  let adminMediaTotal = 0;
  let adminMediaHasMore = false;
  let adminMediaLoading = false;
  const mediaSearch = document.getElementById('adminMediaSearch');
  const mediaType = document.getElementById('adminMediaType');
  const mediaSort = document.getElementById('adminMediaSort');
  const mediaResults = document.getElementById('adminMediaResults');
  const selectVisibleCheckbox = document.getElementById('adminSelectVisible');
  const selectionCountEl = document.getElementById('adminSelectionCount');
  const btnClearSelection = document.getElementById('btnClearSelection');
  const selectionActionsEl = document.getElementById('adminSelectionActions');
  const btnZipSelected = document.getElementById('btnZipSelected');
  const btnDeleteSelected = document.getElementById('btnDeleteSelected');
  const guestbookSearch = document.getElementById('adminGuestbookSearch');
  const guestbookResults = document.getElementById('adminGuestbookResults');
  const btnExportGuestbookPdf = document.getElementById('btnExportGuestbookPdf');
  const loadMoreButton = document.getElementById('btnAdminLoadMore');

  // DOM Elements
  const statMedia = document.getElementById('statMedia');
  const statGuestbook = document.getElementById('statGuestbook');
  const statGuests = document.getElementById('statGuests');
  const statStorage = document.getElementById('statStorage');

  const mediaGrid = document.getElementById('adminMediaGrid');
  const guestbookTableBody = document.getElementById('adminGuestbookBody');

  const btnOpenR2Guide = document.getElementById('btnOpenR2Guide');
  const r2GuideModal = document.getElementById('adminR2GuideModal');
  const r2GuideModalClose = document.getElementById('r2GuideModalClose');
  const r2GuideModalOk = document.getElementById('r2GuideModalOk');

  const tabButtons = document.querySelectorAll('.admin-tab');
  const sectionMedia = document.getElementById('sectionMedia');
  const sectionGuestbook = document.getElementById('sectionGuestbook');
  const sectionQR = document.getElementById('sectionQR');

  // Modals
  const msgModal = document.getElementById('adminMsgModal');
  const msgModalAuthor = document.getElementById('msgModalAuthor');
  const msgModalBody = document.getElementById('msgModalBody');
  const msgModalClose = document.getElementById('msgModalClose');

  const confirmModal = document.getElementById('adminConfirmModal');
  const confirmModalText = document.getElementById('confirmModalText');
  const btnConfirmOk = document.getElementById('btnConfirmOk');
  const btnConfirmCancel = document.getElementById('btnConfirmCancel');
  const deleteProgressModal = document.getElementById('adminDeleteProgressModal');
  const deleteProgressTitle = document.getElementById('deleteProgressTitle');
  const deleteProgressStage = document.getElementById('deleteProgressStage');
  const deleteProgressPercent = document.getElementById('deleteProgressPercent');
  const deleteProgressBar = document.getElementById('deleteProgressBar');
  const deleteProgressFill = document.getElementById('deleteProgressFill');
  const deleteProgressStatus = document.getElementById('deleteProgressStatus');
  const deleteProgressWrap = document.getElementById('deleteProgressWrap');
  let deleteProgressTimer = null;
  let deleteProgressValue = 0;
  let deleteProgressCap = 0;
  let confirmCallback = null;

  const btnPrintCard = document.getElementById('btnPrintCard');
  const qrUrlInput = document.getElementById('qrUrlInput');
  const qrImg = document.getElementById('qrImg');
  const adminToastContainer = document.getElementById('adminToastContainer');

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // =====================================================================
  // 0. NOTIFICACIONES TOAST DEL PANEL (DARK VELVET & CHAMPAGNE GOLD)
  // =====================================================================
  function dismissAdminToast(toast) {
    if (!toast || toast.dataset.dismissing === '1') return;
    toast.dataset.dismissing = '1';
    if (toast._timerId) {
      clearTimeout(toast._timerId);
      toast._timerId = null;
    }
    toast.classList.add('is-leaving');
    setTimeout(() => toast.remove(), 290);
  }

  function showAdminToast(message, type = 'info', title = '', options = {}) {
    if (!adminToastContainer) return null;

    const validTypes = ['success', 'error', 'warning', 'info'];
    const safeType = validTypes.includes(type) ? type : 'info';
    const defaultDuration = safeType === 'error' ? 5200 : 4000;
    const duration = Number(options.duration) > 0 ? Number(options.duration) : defaultDuration;

    const activeToasts = Array.from(adminToastContainer.querySelectorAll('.admin-toast:not(.is-leaving)'));
    while (activeToasts.length >= 3) {
      dismissAdminToast(activeToasts.shift());
    }

    const icons = {
      success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
      error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
      warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
      info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z"></path></svg>'
    };

    const defaultTitles = {
      success: 'Acción completada',
      error: 'Ocurrió un error',
      warning: 'Atención',
      info: 'Panel M&R'
    };

    const toast = document.createElement('div');
    toast.className = `admin-toast admin-toast-${safeType}`;
    toast.setAttribute('role', safeType === 'error' || safeType === 'warning' ? 'alert' : 'status');
    toast.style.setProperty('--atoast-duration', `${duration}ms`);

    const heading = title || defaultTitles[safeType];
    toast.innerHTML = `
      <div class="admin-toast-icon" aria-hidden="true">${icons[safeType]}</div>
      <div class="admin-toast-content">
        <div class="admin-toast-title">${escapeHtml(heading)}</div>
        <div class="admin-toast-msg">${escapeHtml(message)}</div>
      </div>
      <button type="button" class="admin-toast-close" aria-label="Cerrar notificación">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
      <div class="admin-toast-progress" aria-hidden="true"><div class="admin-toast-progress-bar"></div></div>
    `;

    let remaining = duration;
    let startedAt = Date.now();

    const startTimer = () => {
      startedAt = Date.now();
      toast.classList.remove('is-paused');
      toast._timerId = setTimeout(() => dismissAdminToast(toast), remaining);
    };

    const pauseTimer = () => {
      if (!toast._timerId) return;
      clearTimeout(toast._timerId);
      toast._timerId = null;
      remaining = Math.max(400, remaining - (Date.now() - startedAt));
      toast.classList.add('is-paused');
    };

    toast.addEventListener('mouseenter', pauseTimer);
    toast.addEventListener('mouseleave', () => {
      if (toast.dataset.dismissing !== '1') startTimer();
    });

    const closeBtn = toast.querySelector('.admin-toast-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dismissAdminToast(toast);
      });
    }

    adminToastContainer.appendChild(toast);
    startTimer();
    return toast;
  }

  window.showAdminToast = showAdminToast;

  // =====================================================================
  // 1. MODALES Y DIÁLOGOS ELEGANTES
  // =====================================================================
  function closeConfirmModal() {
    if (!confirmModal) return;
    confirmModal.classList.remove('active');
    confirmCallback = null;
  }

  function showConfirm(message, callback) {
    if (!confirmModal) return;
    confirmModalText.textContent = message;
    confirmCallback = callback;
    confirmModal.classList.add('active');
    if (btnConfirmCancel) {
      setTimeout(() => btnConfirmCancel.focus(), 60);
    }
  }

  if (btnConfirmCancel) {
    btnConfirmCancel.addEventListener('click', closeConfirmModal);
  }

  if (confirmModal) {
    confirmModal.addEventListener('click', (e) => {
      if (e.target === confirmModal) closeConfirmModal();
    });
  }

  if (btnConfirmOk) {
    btnConfirmOk.addEventListener('click', () => {
      confirmModal.classList.remove('active');
      if (confirmCallback) {
        const fn = confirmCallback;
        confirmCallback = null;
        fn();
      }
    });
  }

  function openMessageModal(author, message) {
    if (!msgModal) return;
    msgModalAuthor.textContent = author;
    msgModalBody.textContent = message;
    msgModal.classList.add('active');
  }

  if (msgModalClose) {
    msgModalClose.addEventListener('click', () => msgModal.classList.remove('active'));
  }

  if (msgModal) {
    msgModal.addEventListener('click', (e) => {
      if (e.target === msgModal) msgModal.classList.remove('active');
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (confirmModal && confirmModal.classList.contains('active')) {
      e.preventDefault();
      closeConfirmModal();
    } else if (msgModal && msgModal.classList.contains('active')) {
      e.preventDefault();
      msgModal.classList.remove('active');
    } else if (r2GuideModal && r2GuideModal.classList.contains('active')) {
      e.preventDefault();
      r2GuideModal.classList.remove('active');
    }
  });

  if (btnOpenR2Guide && r2GuideModal) {
    btnOpenR2Guide.addEventListener('click', () => {
      r2GuideModal.classList.add('active');
    });
  }
  if (r2GuideModalClose && r2GuideModal) {
    r2GuideModalClose.addEventListener('click', () => r2GuideModal.classList.remove('active'));
  }
  if (r2GuideModalOk && r2GuideModal) {
    r2GuideModalOk.addEventListener('click', () => r2GuideModal.classList.remove('active'));
  }
  if (r2GuideModal) {
    r2GuideModal.addEventListener('click', (e) => {
      if (e.target === r2GuideModal) r2GuideModal.classList.remove('active');
    });
  }
  // =====================================================================
  // 2. CARGA DE MÉTRICAS Y ESTADÍSTICAS
  // =====================================================================
  async function loadStats() {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.success && data.stats) {
        if (statMedia) statMedia.textContent = data.stats.total_media;
        if (statGuestbook) statGuestbook.textContent = data.stats.total_guestbook;
        if (statGuests) statGuests.textContent = data.stats.total_guests;
        if (statStorage) statStorage.textContent = data.stats.storage_mb + ' MB';
      } else { throw new Error('No se pudieron cargar las cifras'); }
    } catch (e) {
      [statMedia, statGuestbook, statGuests, statStorage].filter(Boolean).forEach((element) => { element.textContent = '—'; element.title = 'No se pudo cargar. Pulsa Actualizar panel.'; });
    }
  }

  // =====================================================================
  // 3. GESTIÓN MULTIMEDIA (Thumbnails R2, Descarga Individual y Borrado)
  // =====================================================================
  async function downloadSingleMedia(url, fileName) {
    if (!url || !/^https?:\/\//i.test(url) || url.startsWith(window.location.origin)) {
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'recuerdo_boda';
      document.body.appendChild(a);
      a.click();
      a.remove();
      return;
    }
    try {
      const res = await fetch(url, { mode: 'cors' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName || 'recuerdo_boda';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2500);
    } catch (e) {
      window.open(url, '_blank', 'noopener');
    }
  }

  function filterAdminMedia(items, query, type, sort) {
    const needle = query.trim().toLocaleLowerCase('es');
    const filtered = items.filter((item) => {
      const photo = item.media_type !== 'video';
      return (type === 'all' || (type === 'image' ? photo : !photo)) &&
        (!needle || [item.guest_name, item.original_name].some((value) => String(value || '').toLocaleLowerCase('es').includes(needle)));
    });
    return filtered.sort((a,b) => sort === 'popular' ? Number(b.likes_count || 0) - Number(a.likes_count || 0) : sort === 'oldest' ? Number(a.id) - Number(b.id) : Number(b.id) - Number(a.id));
  }

  function syncSelectionUI() {
    const count = selectedMediaIds.size;
    if (selectionCountEl) {
      selectionCountEl.textContent = count === 1 ? '1 seleccionado' : count + ' seleccionados';
    }
    if (btnClearSelection) btnClearSelection.hidden = count === 0;
    if (selectionActionsEl) selectionActionsEl.hidden = count === 0;
    if (btnZipSelected) btnZipSelected.disabled = count === 0;
    if (btnDeleteSelected) btnDeleteSelected.disabled = count === 0 || deletingMedia;

    if (selectVisibleCheckbox) {
      const visibleCount = visibleMediaItems.length;
      const visibleSelected = visibleMediaItems.filter((item) => selectedMediaIds.has(Number(item.id))).length;
      selectVisibleCheckbox.disabled = visibleCount === 0;
      selectVisibleCheckbox.checked = visibleCount > 0 && visibleSelected === visibleCount;
      selectVisibleCheckbox.indeterminate = visibleSelected > 0 && visibleSelected < visibleCount;
    }
  }

  function toggleMediaSelection(id, checked) {
    const numId = Number(id);
    if (!Number.isInteger(numId) || numId <= 0) return;
    if (checked) selectedMediaIds.add(numId);
    else selectedMediaIds.delete(numId);
    const card = mediaGrid ? mediaGrid.querySelector('.admin-media-card[data-id="' + numId + '"]') : null;
    if (card) {
      card.classList.toggle('selected', checked);
      const cb = card.querySelector('.admin-media-checkbox');
      if (cb && cb.checked !== checked) cb.checked = checked;
    }
    syncSelectionUI();
  }

  function applyMediaFilters() {
    const items = filterAdminMedia(allMediaItems, mediaSearch ? mediaSearch.value : '', mediaType ? mediaType.value : 'all', mediaSort ? mediaSort.value : 'recent');
    visibleMediaItems = items;
    renderMediaGrid(items);
    syncSelectionUI();
    if (mediaResults) mediaResults.textContent = items.length + ' visibles de ' + allMediaItems.length + ' cargados de ' + adminMediaTotal + ' en total' + (adminMediaHasMore ? '. Hay más recuerdos por cargar.' : '');
    if (loadMoreButton) { loadMoreButton.hidden = !adminMediaHasMore; loadMoreButton.disabled = adminMediaLoading; }
  }

  async function loadMedia(more = false) {
    if (!mediaGrid || adminMediaLoading) return;
    adminMediaLoading = true;
    mediaGrid.setAttribute('aria-busy', 'true');
    if (loadMoreButton) loadMoreButton.disabled = true;
    if (!allMediaItems.length) mediaGrid.innerHTML = '<div class="admin-state" role="status"><span class="admin-loader" aria-hidden="true"></span><p>Cargando recuerdos...</p></div>';
    try {
      const nextPage = more ? adminMediaPage + 1 : 1;
      const res = await fetch('/api/media?limit=48&page=' + nextPage);
      const data = await res.json();
      if (!res.ok || !data.success || !Array.isArray(data.items)) throw new Error('No se pudo cargar el álbum');
      const merged = more ? [...allMediaItems, ...data.items] : data.items;
      allMediaItems = Array.from(new Map(merged.map((item) => [Number(item.id), item])).values());
      adminMediaPage = Number(data.page || nextPage);
      adminMediaTotal = Number(data.total ?? allMediaItems.length);
      adminMediaHasMore = Boolean(data.has_more);
      applyMediaFilters();
    } catch (error) {
      if (!allMediaItems.length) mediaGrid.innerHTML = '<div class="admin-state"><p>No pudimos cargar los recuerdos.</p><button type="button" class="admin-btn admin-btn-outline" data-admin-retry="media">Reintentar</button></div>';
      if (mediaResults) mediaResults.textContent = 'Error al cargar. Puedes reintentar con Actualizar panel.';
      if (more) showAdminToast('No se pudieron cargar más recuerdos. Inténtalo otra vez.', 'error', 'Sin conexión');
    } finally {
      adminMediaLoading = false;
      mediaGrid.setAttribute('aria-busy', 'false');
      if (loadMoreButton) { loadMoreButton.disabled = false; loadMoreButton.hidden = !adminMediaHasMore; }
    }
  }

  const mediaLightbox = document.getElementById('gallery-lightbox');
  const lb = (id) => document.getElementById(id);
  let previewItems = [], previewIndex = 0;
  let deletingMedia = false;
  let previewReturnFocus = null;

  function clearPreviewMedia() {
    const video = lb('lightboxVideo');
    video.pause();
    video.removeAttribute('src');
    video.removeAttribute('poster');
    video.load();
    video.style.display = 'none';
    lb('lightboxImg').removeAttribute('src');
    lb('lightboxImg').style.display = 'none';
  }

  function closeMediaPreview() {
    mediaLightbox.classList.remove('active');
    clearPreviewMedia();
    if (previewReturnFocus && previewReturnFocus.isConnected) previewReturnFocus.focus();
  }

  function openMediaPreview(items, index) {
    if (!items.length) return;
    if (!mediaLightbox.classList.contains('active')) previewReturnFocus = document.activeElement;
    previewItems = items;
    previewIndex = (index + items.length) % items.length;
    const item = items[previewIndex];
    clearPreviewMedia();
    const media = lb(item.media_type === 'video' ? 'lightboxVideo' : 'lightboxImg');
    if (item.media_type === 'video' && item.thumb_url) media.poster = item.thumb_url;
    media.src = item.url;
    media.style.display = 'block';
    lb('lightboxImg').alt = 'Recuerdo de ' + (item.guest_name || 'Invitado');
    lb('lightboxAuthor').textContent = item.guest_name || 'Invitado';
    lb('lightboxAvatar').textContent = (item.guest_name || 'Invitado').trim().split(/\s+/).slice(0,2).map(n => n[0]).join('').toUpperCase();
    lb('lightboxTime').textContent = item.created_at || '';
    lb('lightboxLikeCount').textContent = item.likes_count || 0;
    lb('lightboxCounter').textContent = (previewIndex + 1) + ' / ' + items.length;
    lb('lightboxPrev').hidden = lb('lightboxNext').hidden = items.length < 2;
    lb('lightboxDownloadBtn').href = item.url;
    mediaLightbox.classList.add('active');
  }

  function confirmMediaDeletion(item) {
    if (deletingMedia) return;
    showConfirm('¿Eliminar este recuerdo de ' + (item.guest_name || 'Invitado') + '? Se borrará permanentemente. Esta acción no se puede deshacer.', () => deleteMedia(item.id));
  }

  lb('lightboxClose').addEventListener('click', closeMediaPreview);
  lb('lightboxPrev').addEventListener('click', () => openMediaPreview(previewItems, previewIndex - 1));
  lb('lightboxNext').addEventListener('click', () => openMediaPreview(previewItems, previewIndex + 1));
  lb('lightboxDownloadBtn').addEventListener('click', (event) => {
    event.preventDefault();
    const item = previewItems[previewIndex];
    if (item) downloadSingleMedia(item.url, item.original_name);
  });
  lb('lightboxDeleteBtn').addEventListener('click', () => {
    const item = previewItems[previewIndex];
    if (item) confirmMediaDeletion(item);
  });
  mediaLightbox.addEventListener('click', (event) => {
    if (event.target === mediaLightbox || event.target === lb('lightboxMediaContainer')) closeMediaPreview();
  });
  document.addEventListener('keydown', (event) => {
    if (!mediaLightbox.classList.contains('active') || confirmModal.classList.contains('active') || event.defaultPrevented) return;
    if (event.key === 'Escape') closeMediaPreview();
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      if (event.target === lb('lightboxVideo')) return;
      event.preventDefault();
      openMediaPreview(previewItems, previewIndex + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });

  function renderMediaGrid(items) {
    mediaGrid.innerHTML = '';

    if (!items || items.length === 0) {
      mediaGrid.innerHTML = '<div class="admin-state"><h3>' + (allMediaItems.length ? 'No hay coincidencias' : 'El álbum está por comenzar') + '</h3><p>' + (allMediaItems.length ? 'Prueba otro nombre o cambia el tipo de archivo.' : 'Los recuerdos aparecerán aquí cuando los invitados los publiquen.') + '</p></div>';
      return;
    }

    items.forEach(item => {
      const card = document.createElement('div');
      const isSelected = selectedMediaIds.has(Number(item.id));
      card.className = 'admin-media-card' + (isSelected ? ' selected' : '');
      card.dataset.id = item.id;

      const isVideo = item.media_type === 'video';
      const previewSrc = item.thumb_url || item.url;
      card.innerHTML = `
        <label class="admin-card-select-wrap" title="Seleccionar recuerdo">
          <input type="checkbox" class="admin-checkbox admin-media-checkbox" data-id="${item.id}" ${isSelected ? 'checked' : ''} aria-label="Seleccionar recuerdo de ${escapeHtml(item.guest_name || 'Invitado')}">
        </label>
        ${isVideo ? `<div class="admin-card-type-badge" aria-hidden="true"><span>VIDEO</span></div>` : ''}
        ${isVideo && !item.thumb_url ? `
          <video class="admin-media-preview" src="${escapeHtml(item.url)}" preload="metadata" muted></video>
        ` : `
          <img class="admin-media-preview" src="${escapeHtml(previewSrc)}" alt="${escapeHtml(item.original_name)}" loading="lazy" />
        `}
        <div class="admin-media-meta">
          <div class="admin-media-caption">
            <div class="admin-media-author" title="${escapeHtml(item.guest_name || 'Invitado')}">${escapeHtml(item.guest_name || 'Invitado')}</div>
            <span class="admin-media-likes" aria-label="${Number(item.likes_count) || 0} me gusta">&#9825; ${Number(item.likes_count) || 0}</span>
          </div>
          <div class="admin-media-card-actions">
            <a href="${escapeHtml(item.url)}" download="${escapeHtml(item.original_name)}" class="admin-btn admin-btn-outline btn-download-single" aria-label="Descargar recuerdo" title="Descargar recuerdo"><svg class="ui-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5"/></svg></a>
            <button class="admin-btn admin-btn-danger btn-delete-media" data-id="${item.id}" type="button" aria-label="Eliminar recuerdo" title="Eliminar recuerdo"><svg class="ui-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M9 6V4h6v2M5 6l1 14h12l1-14M10 10v6m4-6v6"/></svg></button>
          </div>
        </div>
      `;

      const selectWrap = card.querySelector('.admin-card-select-wrap');
      const checkbox = card.querySelector('.admin-media-checkbox');
      if (selectWrap) {
        selectWrap.addEventListener('click', (event) => event.stopPropagation());
      }
      if (checkbox) {
        checkbox.addEventListener('change', () => {
          toggleMediaSelection(item.id, checkbox.checked);
        });
      }

      // Preview click to open full resolution
      const prev = card.querySelector('.admin-media-preview');
      prev.tabIndex = 0;
      prev.setAttribute('role', 'button');
      prev.setAttribute('aria-label', 'Abrir recuerdo de ' + (item.guest_name || 'Invitado'));
      prev.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); prev.click(); } });
      prev.addEventListener('click', () => {
        openMediaPreview(items, items.indexOf(item));
      });

      // Single download click (cross-origin friendly)
      const dlBtn = card.querySelector('.btn-download-single');
      if (dlBtn) {
        dlBtn.addEventListener('click', (e) => {
          e.preventDefault();
          downloadSingleMedia(item.url, item.original_name || (isVideo ? 'video_boda.mp4' : 'foto_boda.webp'));
        });
      }

      // Delete click
      const del = card.querySelector('.btn-delete-media');
      del.addEventListener('click', () => confirmMediaDeletion(item));

      mediaGrid.appendChild(card);
    });
  }

  function stopDeleteProgressTimer() {
    if (deleteProgressTimer) {
      clearInterval(deleteProgressTimer);
      deleteProgressTimer = null;
    }
  }

  function renderDeleteProgress(percent) {
    deleteProgressValue = Math.max(0, Math.min(100, percent));
    const rounded = Math.floor(deleteProgressValue);
    if (deleteProgressBar) deleteProgressBar.setAttribute('aria-valuenow', String(rounded));
    if (deleteProgressFill) deleteProgressFill.style.width = deleteProgressValue.toFixed(1) + '%';
    if (deleteProgressPercent) deleteProgressPercent.textContent = rounded + '%';
  }

  function startDeleteProgressEstimate(targetCap) {
    deleteProgressCap = Math.max(deleteProgressValue, Math.min(95, targetCap));
    if (deleteProgressTimer) return;
    deleteProgressTimer = setInterval(() => {
      if (deleteProgressValue >= deleteProgressCap) return;
      const step = Math.max(0.3, (deleteProgressCap - deleteProgressValue) * 0.085);
      renderDeleteProgress(Math.min(deleteProgressCap, deleteProgressValue + step));
    }, 120);
  }

  function openDeleteProgress(total) {
    if (!deleteProgressModal) return;
    stopDeleteProgressTimer();
    if (deleteProgressTitle) {
      deleteProgressTitle.textContent = total === 1 ? 'Eliminando recuerdo' : 'Eliminando ' + total + ' recuerdos';
    }
    if (deleteProgressWrap) deleteProgressWrap.setAttribute('aria-busy', 'true');
    if (deleteProgressFill) deleteProgressFill.classList.add('is-active');
    renderDeleteProgress(6);
    updateDeleteProgress(6, 'Eliminando…', total === 1
      ? 'Borrando el recuerdo del álbum y del almacenamiento. Mantén esta página abierta.'
      : 'Preparando eliminación de ' + total + ' recuerdos. Mantén esta página abierta.');
    deleteProgressModal.classList.add('active');
  }

  function updateDeleteProgress(percent, stage, message) {
    if (typeof percent === 'number' && !Number.isNaN(percent)) {
      renderDeleteProgress(Math.max(deleteProgressValue, percent));
    }
    if (deleteProgressStage) deleteProgressStage.textContent = stage;
    if (deleteProgressStatus) deleteProgressStatus.textContent = message;
  }

  function closeDeleteProgress() {
    stopDeleteProgressTimer();
    if (!deleteProgressModal) return;
    if (deleteProgressWrap) deleteProgressWrap.setAttribute('aria-busy', 'false');
    if (deleteProgressFill) deleteProgressFill.classList.remove('is-active');
    deleteProgressModal.classList.remove('active');
  }

  // Eliminar multimedia como Admin
  async function deleteMedia(mediaId) {
    if (deletingMedia) return;
    deletingMedia = true;
    lb('lightboxDeleteBtn').disabled = true;
    syncSelectionUI();
    openDeleteProgress(1);
    startDeleteProgressEstimate(86);
    try {
      const res = await fetch('/api/media/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: mediaId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        selectedMediaIds.delete(Number(mediaId));
        startDeleteProgressEstimate(95);
        updateDeleteProgress(90, 'Actualizando álbum…', 'El recuerdo fue eliminado. Actualizando la vista…');
        if (mediaLightbox.classList.contains('active')) closeMediaPreview();
        await Promise.all([loadMedia(), loadStats()]);
        stopDeleteProgressTimer();
        updateDeleteProgress(100, 'Eliminación completada', 'El recuerdo fue eliminado correctamente.');
        await new Promise((resolve) => setTimeout(resolve, 260));
        closeDeleteProgress();
        showAdminToast('El recuerdo se eliminó permanentemente del álbum.', 'success', 'Recuerdo eliminado');
      } else {
        closeDeleteProgress();
        showAdminToast(data.error || 'No se pudo eliminar el recuerdo.', 'error', 'Error al eliminar');
      }
    } catch (e) {
      closeDeleteProgress();
      showAdminToast('No se pudo conectar con el servidor. Intenta nuevamente.', 'error', 'Sin conexión');
    } finally {
      deletingMedia = false;
      closeDeleteProgress();
      lb('lightboxDeleteBtn').disabled = false;
      syncSelectionUI();
    }
  }

  async function deleteSelectedMedia(ids) {
    if (deletingMedia || !ids.length) return;
    deletingMedia = true;
    syncSelectionUI();
    const total = ids.length;
    const chunkSize = 5;
    let totalDeleted = 0;
    let processed = 0;
    let lastError = '';

    openDeleteProgress(total);
    try {
      for (let i = 0; i < total; i += chunkSize) {
        const batch = ids.slice(i, i + chunkSize);
        const batchEnd = Math.min(i + batch.length, total);
        const batchCap = Math.min(92, ((processed + batch.length * 0.88) / total) * 94);
        startDeleteProgressEstimate(batchCap);
        updateDeleteProgress(
          null,
          'Eliminando elementos',
          'Eliminando ' + (i + 1) + (batchEnd > i + 1 ? '–' + batchEnd : '') + ' de ' + total + ' recuerdos… Mantén esta página abierta.'
        );

        const res = await fetch('/api/media/delete-bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: batch })
        });
        let data = {};
        try { data = await res.json(); } catch (_) {}

        if (res.ok && data.success) {
          const deletedIds = Array.isArray(data.deleted_ids) ? data.deleted_ids : batch;
          deletedIds.forEach((id) => selectedMediaIds.delete(Number(id)));
          totalDeleted += Number(data.deleted_count || deletedIds.length);
        } else {
          lastError = data.error || 'No se pudieron eliminar algunos recuerdos.';
        }

        processed += batch.length;
        updateDeleteProgress(
          Math.min(94, (processed / total) * 94),
          'Eliminando elementos',
          processed + ' de ' + total + ' recuerdos procesados…'
        );
      }

      if (totalDeleted > 0) {
        startDeleteProgressEstimate(97);
        updateDeleteProgress(94, 'Actualizando álbum…', 'Guardando cambios y actualizando la galería…');
        await Promise.all([loadMedia(), loadStats()]);
        stopDeleteProgressTimer();
        updateDeleteProgress(100, 'Eliminación completada', 'Se actualizaron los recuerdos correctamente.');
        await new Promise((resolve) => setTimeout(resolve, 280));
        closeDeleteProgress();
        if (lastError) {
          showAdminToast(
            'Se eliminaron ' + totalDeleted + ' de ' + total + ' recuerdos. ' + lastError,
            'warning',
            'Eliminación parcial'
          );
        } else {
          showAdminToast(
            totalDeleted === 1 ? '1 recuerdo eliminado permanentemente del álbum.' : totalDeleted + ' recuerdos eliminados permanentemente del álbum.',
            'success',
            'Recuerdos eliminados'
          );
        }
      } else {
        closeDeleteProgress();
        showAdminToast(lastError || 'No se pudieron eliminar los recuerdos seleccionados.', 'error', 'Error al eliminar');
      }
    } catch (e) {
      closeDeleteProgress();
      if (totalDeleted > 0) {
        loadMedia();
        loadStats();
        showAdminToast('Se eliminaron ' + totalDeleted + ' recuerdos antes de perder la conexión.', 'warning', 'Conexión interrumpida');
      } else {
        showAdminToast('No se pudo conectar con el servidor. Intenta nuevamente.', 'error', 'Sin conexión');
      }
    } finally {
      deletingMedia = false;
      closeDeleteProgress();
      syncSelectionUI();
    }
  }

  if (selectVisibleCheckbox) {
    selectVisibleCheckbox.addEventListener('change', () => {
      const check = selectVisibleCheckbox.checked;
      visibleMediaItems.forEach((item) => {
        if (check) selectedMediaIds.add(Number(item.id));
        else selectedMediaIds.delete(Number(item.id));
      });
      if (mediaGrid) {
        mediaGrid.querySelectorAll('.admin-media-card').forEach((card) => {
          const id = Number(card.dataset.id);
          const isSelected = selectedMediaIds.has(id);
          card.classList.toggle('selected', isSelected);
          const cb = card.querySelector('.admin-media-checkbox');
          if (cb) cb.checked = isSelected;
        });
      }
      syncSelectionUI();
    });
  }

  if (btnClearSelection) {
    btnClearSelection.addEventListener('click', () => {
      selectedMediaIds.clear();
      if (mediaGrid) {
        mediaGrid.querySelectorAll('.admin-media-card.selected').forEach((card) => {
          card.classList.remove('selected');
          const cb = card.querySelector('.admin-media-checkbox');
          if (cb) cb.checked = false;
        });
      }
      syncSelectionUI();
    });
  }

  if (btnZipSelected) {
    btnZipSelected.addEventListener('click', () => {
      const ids = Array.from(selectedMediaIds);
      if (!ids.length) return;
      if (r2GuideModal) r2GuideModal.classList.add('active');
      if (typeof window.startAdminZipDownload === 'function') {
        window.startAdminZipDownload(ids);
      }
    });
  }

  if (btnDeleteSelected) {
    btnDeleteSelected.addEventListener('click', () => {
      const ids = Array.from(selectedMediaIds);
      if (!ids.length || deletingMedia) return;
      const msg = ids.length === 1
        ? '¿Eliminar el recuerdo seleccionado? Se borrará permanentemente. Esta acción no se puede deshacer.'
        : '¿Eliminar los ' + ids.length + ' recuerdos seleccionados? Se borrarán permanentemente. Esta acción no se puede deshacer.';
      showConfirm(msg, () => deleteSelectedMedia(ids));
    });
  }

  // =====================================================================
  // 4. GESTIÓN DEL LIBRO DE FIRMAS
  // =====================================================================
  function applyGuestbookFilter() {
    const query = (guestbookSearch ? guestbookSearch.value : '').trim().toLocaleLowerCase('es');
    const entries = allGuestbookEntries.filter((item) => [item.raw_guest_name || item.guest_name, item.raw_message || item.message].some((value) => String(value || '').toLocaleLowerCase('es').includes(query)));
    renderGuestbookTable(entries);
    if (guestbookResults) guestbookResults.textContent = entries.length + ' de ' + allGuestbookEntries.length + ' dedicatorias';
  }

  async function loadGuestbook() {
    if (!guestbookTableBody) return;
    guestbookTableBody.setAttribute('aria-busy', 'true');
    if (!allGuestbookEntries.length) guestbookTableBody.innerHTML = '<tr><td colspan="4"><div class="admin-state" role="status">Cargando dedicatorias...</div></td></tr>';
    try {
      const res = await fetch('/api/guestbook');
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error('No se pudo cargar el libro');
      allGuestbookEntries = data.entries || [];
      applyGuestbookFilter();
    } catch (error) {
      if (!allGuestbookEntries.length) guestbookTableBody.innerHTML = '<tr><td colspan="4"><div class="admin-state"><p>No pudimos cargar las dedicatorias.</p><button type="button" class="admin-btn admin-btn-outline" data-admin-retry="guestbook">Reintentar</button></div></td></tr>';
      if (guestbookResults) guestbookResults.textContent = 'Error al cargar las dedicatorias.';
    } finally { guestbookTableBody.setAttribute('aria-busy','false'); }
  }

  function renderGuestbookTable(entries) {
    guestbookTableBody.innerHTML = '';
    if (!entries || entries.length === 0) {
      guestbookTableBody.innerHTML = '<tr><td colspan="4"><div class="admin-state"><h3>' + (allGuestbookEntries.length ? 'No hay coincidencias' : 'El libro espera sus primeras palabras') + '</h3><p>' + (allGuestbookEntries.length ? 'Prueba otro nombre o mensaje.' : 'Las dedicatorias aparecerán aquí cuando los invitados firmen.') + '</p></div></td></tr>';
      return;
    }

    entries.forEach(item => {
      const name = item.raw_guest_name || item.guest_name || 'Invitado';
      const message = item.raw_message || item.message || '';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td data-label="Invitado" role="button" tabindex="0" aria-label="Ver dedicatoria de ${escapeHtml(name)}" style="font-weight:600; color:var(--gold-light); cursor:pointer;">${escapeHtml(name)}</td>
        <td data-label="Dedicatoria">
          <div class="guestbook-msg-preview" title="Haz clic para ver completo">
            ${escapeHtml(message)}
          </div>
        </td>
        <td data-label="Fecha" style="font-size:0.8rem; color:var(--text-muted);">${escapeHtml(item.created_at)}</td>
        <td data-label="Acciones" style="text-align:right;">
          <button class="admin-btn admin-btn-outline btn-view-gb" aria-label="Ver dedicatoria" title="Ver dedicatoria" style="padding:6px 12px; font-size:0.75rem; margin-right:6px;"><svg class="ui-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg></button>
          <button class="admin-btn admin-btn-danger btn-del-gb" aria-label="Borrar dedicatoria" title="Borrar dedicatoria" style="padding:6px 12px; font-size:0.75rem;"><svg class="ui-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M9 6V4h6v2M5 6l1 14h12l1-14M10 10v6m4-6v6"/></svg></button>
        </td>
      `;

      // Clic para ver completo en modal emergente
      const guestCell = tr.querySelector('[data-label="Invitado"]');
      guestCell.addEventListener('click', () => openMessageModal(name, message));
      guestCell.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openMessageModal(name, message);
        }
      });
      tr.querySelector('.guestbook-msg-preview').addEventListener('click', () => {
        openMessageModal(name, message);
      });
      tr.querySelector('.btn-view-gb').addEventListener('click', () => {
        openMessageModal(name, message);
      });

      // Borrar firma
      tr.querySelector('.btn-del-gb').addEventListener('click', () => {
        showConfirm(`¿Eliminar la dedicatoria de ${name}?`, async () => {
          try {
            const res = await fetch('/api/guestbook/delete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: item.id })
            });
            const data = await res.json();
            if (data.success) {
              showAdminToast(`Se eliminó la dedicatoria de ${name}.`, 'success', 'Firma eliminada');
              loadGuestbook();
              loadStats();
            } else {
              showAdminToast(data.error || 'No se pudo eliminar la dedicatoria.', 'error', 'Error al eliminar');
            }
          } catch (e) {
            showAdminToast('No se pudo conectar con el servidor.', 'error', 'Sin conexión');
          }
        });
      });

      guestbookTableBody.appendChild(tr);
    });
  }

  // =====================================================================
  // 5. CÓDIGO QR Y TARJETA DE MESA IMPRIMIBLE
  // =====================================================================
  function updateQRCode() {
    if (!qrImg || !qrUrlInput) return;
    const targetUrl = qrUrlInput.value.trim() || window.location.origin;
    try { const url = new URL(targetUrl); if (!['http:', 'https:'].includes(url.protocol)) throw new Error(); qrUrlInput.setCustomValidity(''); } catch { qrUrlInput.setCustomValidity('Escribe un enlace http o https válido.'); qrUrlInput.reportValidity(); return; }
    // Generar código QR nítido de alta resolución
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(targetUrl)}&color=4A5842&bgcolor=FAF7F2&margin=1`;
    if (qrImg.src !== qrApiUrl) {
      if (btnPrintCard) btnPrintCard.disabled = true;
      const help = document.getElementById('qrUrlHelp');
      if (help) help.textContent = 'Generando el QR...';
      qrImg.src = qrApiUrl;
    }
  }

  if (qrImg) {
    qrImg.addEventListener('load', () => {
      if (btnPrintCard) btnPrintCard.disabled = false;
      const help = document.getElementById('qrUrlHelp');
      if (help) help.textContent = 'QR listo. Revisa el enlace antes de imprimir.';
    });
    qrImg.addEventListener('error', () => {
      if (btnPrintCard) btnPrintCard.disabled = true;
      const help = document.getElementById('qrUrlHelp');
      if (help) help.textContent = 'No se pudo generar el QR. Revisa tu conexion y vuelve a cargar esta vista.';
    });
  }
  if (qrUrlInput) {
    qrUrlInput.value = window.location.origin + '/';
    updateQRCode();
    qrUrlInput.addEventListener('change', updateQRCode);
  }

  const printModal = document.getElementById('adminPrintModal');
  const printCopies = document.getElementById('qrPrintCopies');
  const printSummary = document.getElementById('qrPrintSummary');
  const printSheets = document.getElementById('qrPrintSheets');
  function updatePrintSummary() {
    const count = Number(printCopies.value);
    printSummary.textContent = Number.isInteger(count) && count >= 1 && count <= 200 ? count + ' tarjetas en ' + Math.ceil(count / 2) + ' hojas.' : 'Elige entre 1 y 200 tarjetas.';
  }
  if (printCopies) printCopies.addEventListener('input', updatePrintSummary);
  const cancelPrint = document.getElementById('btnCancelPrint');
  if (cancelPrint) cancelPrint.addEventListener('click', () => printModal.classList.remove('active'));
  if (printModal) printModal.addEventListener('click', (event) => { if (event.target === printModal) printModal.classList.remove('active'); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && printModal) printModal.classList.remove('active'); });
  const qrOriginal = document.querySelector('.qr-printable-card');
  function resizeQRPreview() {
    if (!qrOriginal || !qrOriginal.parentElement.classList.contains('qr-preview-scale')) return;
    const wrapper = qrOriginal.parentElement;
    const scale = Math.min(1, wrapper.clientWidth / 460);
    qrOriginal.style.transform = 'scale(' + scale + ')';
    wrapper.style.height = qrOriginal.offsetHeight * scale + 'px';
  }
  if (qrOriginal) {
    const wrapper = document.createElement('div'); wrapper.className = 'qr-preview-scale';
    qrOriginal.before(wrapper); wrapper.appendChild(qrOriginal);
    if ('ResizeObserver' in window) { const observer = new ResizeObserver(resizeQRPreview); observer.observe(wrapper); observer.observe(qrOriginal); }
    window.addEventListener('resize', resizeQRPreview);
    if (document.fonts) document.fonts.ready.then(resizeQRPreview);
  }
  function buildQRPrintSheets(count) {
    printSheets.replaceChildren();
    const original = document.querySelector('.qr-printable-card');
    for (let i = 0; i < count; i++) {
      let sheet;
      if (i % 2 === 0) { sheet = document.createElement('section'); sheet.className = 'qr-print-sheet'; printSheets.appendChild(sheet); }
      else sheet = printSheets.lastElementChild;
      const card = original.cloneNode(true);
      card.removeAttribute('id');
      card.querySelectorAll('[id]').forEach((element) => element.removeAttribute('id'));
      const slot = document.createElement('div'); slot.className = 'qr-print-slot';
      const width = 460, height = original.offsetHeight;
      const scale = Math.min((139.7 - 12) * 96 / 25.4 / width, (215.9 - 12) * 96 / 25.4 / height);
      slot.style.width = width * scale + 'px'; slot.style.height = height * scale + 'px';
      card.style.transform = 'scale(' + scale + ')';
      slot.appendChild(card); sheet.appendChild(slot);
    }
  }
  const printForm = document.getElementById('adminPrintForm');
  if (printForm) printForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!printForm.reportValidity()) return;
    const count = Number(printCopies.value);
    if (!Number.isInteger(count) || count < 1 || count > 200) return;
    if (document.fonts) await document.fonts.ready;
    buildQRPrintSheets(count);
    await Promise.all(Array.from(printSheets.querySelectorAll('img')).map((img) => img.decode ? img.decode().catch(() => {}) : Promise.resolve()));
    printModal.classList.remove('active');
    requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
  });
  window.addEventListener('afterprint', () => { if (printSheets) printSheets.replaceChildren(); });

  if (btnPrintCard) {
    btnPrintCard.addEventListener('click', () => {
      if (qrUrlInput && !qrUrlInput.reportValidity()) return;
      if (!qrImg || !qrImg.complete || !qrImg.naturalWidth) { showAdminToast('Espera a que el QR termine de cargar antes de imprimir.', 'warning', 'Preparando tarjeta'); return; }
      printModal.classList.add('active');
      updatePrintSummary();
      requestAnimationFrame(() => { printCopies.focus(); printCopies.select(); });
    });
  }

  // =====================================================================
  // 6. NAVEGACIÓN POR PESTAÑAS
  // =====================================================================
  tabButtons.forEach(tab => {
    tab.addEventListener('click', () => {
      tabButtons.forEach(t => { const active = t === tab; t.classList.toggle('active', active); t.setAttribute('aria-selected', String(active)); t.tabIndex = active ? 0 : -1; });

      const target = tab.dataset.target;
      sectionMedia.style.display = target === 'media' ? 'block' : 'none';
      sectionGuestbook.style.display = target === 'guestbook' ? 'block' : 'none';
      sectionQR.style.display = target === 'qr' ? 'block' : 'none';
    });
  });

  tabButtons.forEach((tab, index) => tab.addEventListener('keydown', (event) => {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % tabButtons.length;
    else if (event.key === 'ArrowLeft') next = (index + tabButtons.length - 1) % tabButtons.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabButtons.length - 1;
    else return;
    event.preventDefault(); tabButtons[next].click(); tabButtons[next].focus();
  }));
  document.querySelectorAll('[data-admin-section]').forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault();
    const tab = document.getElementById('tab-' + link.dataset.adminSection);
    if (tab) { tab.click(); tab.focus({preventScroll:true}); tab.scrollIntoView({block:'nearest', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'}); }
  }));
  function enhanceAdminSelect(select) {
    if (!select) return;
    const label=select.closest('label'), wrapper=document.createElement('div'); wrapper.className='admin-custom-select'; label.appendChild(wrapper);
    const trigger=document.createElement('button');trigger.type='button';trigger.className='admin-select-trigger';
    const triggerLabel=document.createElement('span');triggerLabel.className='admin-select-label';
    const arrow=document.createElementNS('http://www.w3.org/2000/svg','svg');arrow.setAttribute('class','admin-select-arrow');arrow.setAttribute('viewBox','0 0 24 24');arrow.setAttribute('fill','none');arrow.setAttribute('stroke','currentColor');arrow.setAttribute('stroke-width','1.5');arrow.setAttribute('stroke-linecap','round');arrow.setAttribute('stroke-linejoin','round');arrow.setAttribute('aria-hidden','true');
    const arrowPath=document.createElementNS('http://www.w3.org/2000/svg','path');arrowPath.setAttribute('d','m6 9 6 6 6-6');arrow.appendChild(arrowPath);trigger.appendChild(triggerLabel);trigger.appendChild(arrow);
    const list=document.createElement('div');list.className='admin-select-options';list.id=select.id+'-options';list.setAttribute('role','listbox');list.hidden=true;
    const title=label.querySelector('span').textContent;list.setAttribute('aria-label',title);
    trigger.setAttribute('aria-haspopup','listbox');trigger.setAttribute('aria-controls',list.id);trigger.setAttribute('aria-expanded','false');
    const options=Array.from(select.options).map((option)=>{
      const button=document.createElement('button');button.type='button';button.className='admin-select-option';button.setAttribute('role','option');button.textContent=option.textContent;
      button.addEventListener('click',()=>{select.value=option.value;select.dispatchEvent(new Event('change',{bubbles:true}));close(true);});list.appendChild(button);return button;
    });
    function sync(){triggerLabel.textContent=select.options[select.selectedIndex].textContent;trigger.setAttribute('aria-label',title+': '+select.options[select.selectedIndex].textContent);options.forEach((b,i)=>{b.setAttribute('aria-selected',String(i===select.selectedIndex));b.tabIndex=i===select.selectedIndex?0:-1;});}
    function close(focus=false){list.hidden=true;trigger.setAttribute('aria-expanded','false');if(focus)trigger.focus();}
    function open(){list.hidden=false;trigger.setAttribute('aria-expanded','true');options[select.selectedIndex].focus();}
    trigger.addEventListener('click',()=>list.hidden?open():close());
    trigger.addEventListener('keydown',e=>{if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();open();}});
    list.addEventListener('keydown',e=>{const i=options.indexOf(document.activeElement);let next=i;if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close(true);return;}if(e.key==='Tab'){close();return;}if(e.key==='ArrowDown')next=(i+1)%options.length;else if(e.key==='ArrowUp')next=(i+options.length-1)%options.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=options.length-1;else return;e.preventDefault();options[next].focus();});
    document.addEventListener('pointerdown',e=>{if(!wrapper.contains(e.target))close();});wrapper.addEventListener('focusout',()=>requestAnimationFrame(()=>{if(!wrapper.contains(document.activeElement))close();}));
    select.addEventListener('change',sync);select.hidden=true;wrapper.appendChild(trigger);wrapper.appendChild(list);sync();
  }
  [mediaType,mediaSort].forEach(enhanceAdminSelect);

  [mediaSearch, mediaType, mediaSort].filter(Boolean).forEach((control) => control.addEventListener(control === mediaSearch ? 'input' : 'change', applyMediaFilters));
  if (guestbookSearch) guestbookSearch.addEventListener('input', applyGuestbookFilter);
  if (btnExportGuestbookPdf) {
    btnExportGuestbookPdf.addEventListener('click', (event) => {
      if (allGuestbookEntries.length === 0) {
        event.preventDefault();
        showAdminToast('Aún no hay dedicatorias para generar el PDF del libro de firmas.', 'warning', 'Libro sin firmas');
      }
    });
  }
  if (loadMoreButton) loadMoreButton.addEventListener('click', () => loadMedia(true));
  document.addEventListener('click', (event) => {
    const retry = event.target.closest('[data-admin-retry]');
    if (retry) { if (retry.dataset.adminRetry === 'media') loadMedia(); else loadGuestbook(); }
  });
  const refreshButton = document.getElementById('btnRefreshAdmin');
  if (refreshButton) refreshButton.addEventListener('click', async () => {
    refreshButton.disabled = true; refreshButton.textContent = 'Actualizando...';
    try { await Promise.all([loadStats(), loadMedia(), loadGuestbook()]); }
    finally { refreshButton.disabled = false; refreshButton.textContent = 'Actualizar panel'; }
  });

  // Logout
  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
      btnLogout.disabled = true;
      try {
        const res = await fetch('/api/auth/admin-logout', {method:'POST',headers:{'Content-Type':'application/json'}});
        if (!res.ok) throw new Error('No se pudo cerrar la sesion');
        window.location.reload();
      } catch (error) {
        btnLogout.disabled = false;
        showAdminToast('No se pudo cerrar la sesión. Intenta otra vez.', 'error', 'Sin conexión');
      }
    });
  }

  const dialogs = [confirmModal, msgModal, r2GuideModal, deleteProgressModal, printModal, mediaLightbox].filter(Boolean);
  let modalReturnFocus = null;
  const focusableSelector = 'button:not([disabled]), a[href], input, select, textarea, [tabindex="0"]';
  const syncDialogs = () => {
    const active = dialogs.find((dialog) => dialog.classList.contains('active'));
    document.body.classList.toggle('admin-modal-open', Boolean(active));
    [document.querySelector('.admin-header'), document.getElementById('adminMain')].filter(Boolean).forEach((element) => { element.inert = Boolean(active); });
    dialogs.forEach((dialog) => { dialog.setAttribute('aria-hidden', String(dialog !== active)); dialog.inert = dialog !== active; });
    if (active && !active.contains(document.activeElement)) {
      if (!modalReturnFocus) modalReturnFocus = document.activeElement;
      const target = active === confirmModal ? btnConfirmCancel : active.querySelector(focusableSelector);
      if (target) target.focus();
    } else if (!active && modalReturnFocus) {
      if (modalReturnFocus.isConnected) modalReturnFocus.focus();
      modalReturnFocus = null;
    }
  };
  dialogs.forEach((dialog) => new MutationObserver(syncDialogs).observe(dialog, {attributes:true, attributeFilter:['class']}));
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const active = dialogs.find((dialog) => dialog.classList.contains('active'));
    if (!active) return;
    const controls = Array.from(active.querySelectorAll(focusableSelector)).filter(control => control.getClientRects().length && !control.hidden);
    if (!controls.length) return;
    const first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  syncDialogs();

  // Inicialización
  loadStats();
  loadMedia();
  loadGuestbook();

})();
