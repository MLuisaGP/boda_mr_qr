/**
 * BODA MICHELLE & RENÉ — Panel de Administración (Novios y Organizadores)
 */

(function () {
  'use strict';

  let allMediaItems = [];

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
  const btnCopyRcloneCmd = document.getElementById('btnCopyRcloneCmd');
  const r2RcloneCmd = document.getElementById('r2RcloneCmd');

  const tabButtons = document.querySelectorAll('.admin-tab');
  const sectionMedia = document.getElementById('sectionMedia');
  const sectionGuestbook = document.getElementById('sectionGuestbook');
  const sectionQR = document.getElementById('sectionQR');

  // Modals
  const msgModal = document.getElementById('adminMsgModal');
  const msgModalAuthor = document.getElementById('msgModalAuthor');
  const msgModalDate = document.getElementById('msgModalDate');
  const msgModalBody = document.getElementById('msgModalBody');
  const msgModalClose = document.getElementById('msgModalClose');

  const confirmModal = document.getElementById('adminConfirmModal');
  const confirmModalText = document.getElementById('confirmModalText');
  const btnConfirmOk = document.getElementById('btnConfirmOk');
  const btnConfirmCancel = document.getElementById('btnConfirmCancel');
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

  function openMessageModal(author, date, message) {
    if (!msgModal) return;
    msgModalAuthor.textContent = author;
    msgModalDate.textContent = date;
    msgModalBody.innerHTML = message;
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
  if (btnCopyRcloneCmd && r2RcloneCmd) {
    btnCopyRcloneCmd.addEventListener('click', async () => {
      const cmd = (r2RcloneCmd.textContent || '').trim();
      if (!cmd) return;
      try {
        await navigator.clipboard.writeText(cmd);
        showAdminToast('Comando de rclone copiado al portapapeles.', 'success', 'Copiado');
      } catch (err) {
        showAdminToast('Selecciona y copia el comando manualmente.', 'info', 'rclone');
      }
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
      }
    } catch (e) {
      console.error('Error stats:', e);
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

  async function loadMedia() {
    if (!mediaGrid) return;
    try {
      const res = await fetch('/api/media?limit=150');
      const data = await res.json();
      if (data.success) {
        allMediaItems = data.items || [];
        renderMediaGrid(allMediaItems);
      }
    } catch (e) {
      console.error(e);
    }
  }

  function renderMediaGrid(items) {
    mediaGrid.innerHTML = '';

    if (!items || items.length === 0) {
      mediaGrid.innerHTML = '<p style="color:var(--text-muted); grid-column:1/-1; text-align:center; padding:40px;">Aún no se han subido fotos o videos.</p>';
      return;
    }

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'admin-media-card';
      card.dataset.id = item.id;

      const isVideo = item.media_type === 'video';
      const previewSrc = item.thumb_url || item.url;
      const sizeLabel = item.file_size >= 1024 * 1024
        ? `${(item.file_size / (1024 * 1024)).toFixed(1)} MB`
        : `${(item.file_size / 1024).toFixed(0)} KB`;

      card.innerHTML = `
        ${isVideo ? `<div class="admin-card-select-wrap" style="pointer-events:none;"><span style="background:rgba(0,0,0,0.72); color:#F5E6C4; border:1px solid rgba(201,160,80,0.45); font-size:0.65rem; font-weight:700; padding:3px 7px; border-radius:999px; letter-spacing:0.08em;">VIDEO</span></div>` : ''}
        ${isVideo && !item.thumb_url ? `
          <video class="admin-media-preview" src="${escapeHtml(item.url)}" preload="metadata" muted></video>
        ` : `
          <img class="admin-media-preview" src="${escapeHtml(previewSrc)}" alt="${escapeHtml(item.original_name)}" loading="lazy" />
        `}
        <div class="admin-media-meta">
          <div class="admin-media-author">${escapeHtml(item.guest_name)}</div>
          <div class="admin-media-sub">
            <span>${sizeLabel} · ${item.likes_count} likes</span>
            <span>${escapeHtml((item.created_at || '').substring(5, 16))}</span>
          </div>
          <div class="admin-media-card-actions">
            <a href="${escapeHtml(item.url)}" download="${escapeHtml(item.original_name)}" class="admin-btn admin-btn-outline btn-download-single" style="padding:6px 12px; font-size:0.75rem;" title="Descargar">
              ⬇ Guardar
            </a>
            <button class="admin-btn admin-btn-danger btn-delete-media" data-id="${item.id}" style="padding:6px 12px; font-size:0.75rem;" title="Eliminar">
              ✕ Borrar
            </button>
          </div>
        </div>
      `;

      // Preview click to open full resolution
      const prev = card.querySelector('.admin-media-preview');
      prev.addEventListener('click', () => {
        window.open(item.url, '_blank', 'noopener');
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
      del.addEventListener('click', () => {
        showConfirm(`¿Eliminar definitivamente este recuerdo de ${item.guest_name}?`, () => {
          deleteMedia(item.id);
        });
      });

      mediaGrid.appendChild(card);
    });
  }

  // Eliminar multimedia como Admin
  async function deleteMedia(mediaId) {
    try {
      const res = await fetch('/api/media/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: mediaId })
      });
      const data = await res.json();
      if (data.success) {
        showAdminToast('El recuerdo se eliminó permanentemente del álbum.', 'success', 'Recuerdo eliminado');
        loadMedia();
        loadStats();
      } else {
        showAdminToast(data.error || 'No se pudo eliminar el recuerdo.', 'error', 'Error al eliminar');
      }
    } catch (e) {
      showAdminToast('No se pudo conectar con el servidor. Intenta nuevamente.', 'error', 'Sin conexión');
    }
  }

  // =====================================================================
  // 4. GESTIÓN DEL LIBRO DE FIRMAS
  // =====================================================================
  async function loadGuestbook() {
    if (!guestbookTableBody) return;
    try {
      const res = await fetch('/api/guestbook');
      const data = await res.json();
      if (data.success) {
        renderGuestbookTable(data.entries || []);
      }
    } catch (e) {
      console.error(e);
    }
  }

  function renderGuestbookTable(entries) {
    guestbookTableBody.innerHTML = '';
    if (!entries || entries.length === 0) {
      guestbookTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:30px;">No hay dedicatorias registradas todavía.</td></tr>';
      return;
    }

    entries.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight:600; color:var(--gold-light);">${item.guest_name}</td>
        <td>
          <div class="guestbook-msg-preview" title="Haz clic para ver completo">
            ${item.raw_message}
          </div>
        </td>
        <td style="font-size:0.8rem; color:var(--text-muted);">${item.created_at}</td>
        <td style="text-align:right;">
          <button class="admin-btn admin-btn-outline btn-view-gb" style="padding:6px 12px; font-size:0.75rem; margin-right:6px;">
            👁 Ver
          </button>
          <button class="admin-btn admin-btn-danger btn-del-gb" style="padding:6px 12px; font-size:0.75rem;">
            ✕ Borrar
          </button>
        </td>
      `;

      // Clic para ver completo en modal emergente
      tr.querySelector('.guestbook-msg-preview').addEventListener('click', () => {
        openMessageModal(item.guest_name, item.created_at, item.message);
      });
      tr.querySelector('.btn-view-gb').addEventListener('click', () => {
        openMessageModal(item.guest_name, item.created_at, item.message);
      });

      // Borrar firma
      tr.querySelector('.btn-del-gb').addEventListener('click', () => {
        showConfirm(`¿Eliminar la dedicatoria de ${item.guest_name}?`, async () => {
          try {
            const res = await fetch('/api/guestbook/delete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: item.id })
            });
            const data = await res.json();
            if (data.success) {
              showAdminToast(`Se eliminó la dedicatoria de ${item.guest_name}.`, 'success', 'Firma eliminada');
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
    // Generar código QR nítido de alta resolución
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(targetUrl)}&color=4A1525&bgcolor=FAF7F2&margin=1`;
    qrImg.src = qrApiUrl;
  }

  if (qrUrlInput) {
    qrUrlInput.value = window.location.origin + '/';
    updateQRCode();
    qrUrlInput.addEventListener('change', updateQRCode);
  }

  if (btnPrintCard) {
    btnPrintCard.addEventListener('click', () => {
      window.print();
    });
  }

  // =====================================================================
  // 6. NAVEGACIÓN POR PESTAÑAS
  // =====================================================================
  tabButtons.forEach(tab => {
    tab.addEventListener('click', () => {
      tabButtons.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const target = tab.dataset.target;
      sectionMedia.style.display = target === 'media' ? 'block' : 'none';
      sectionGuestbook.style.display = target === 'guestbook' ? 'block' : 'none';
      sectionQR.style.display = target === 'qr' ? 'block' : 'none';
    });
  });

  // Logout
  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
      await fetch('/api/auth/admin-logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      window.location.reload();
    });
  }

  // Inicialización
  loadStats();
  loadMedia();
  loadGuestbook();

})();
