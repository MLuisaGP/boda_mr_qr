/**
 * BODA MICHELLE & RENÉ — Panel de Administración (Novios y Organizadores)
 */

(function () {
  'use strict';

  let selectedMediaIds = new Set();
  let allMediaItems = [];

  // DOM Elements
  const statMedia = document.getElementById('statMedia');
  const statGuestbook = document.getElementById('statGuestbook');
  const statGuests = document.getElementById('statGuests');
  const statStorage = document.getElementById('statStorage');

  const mediaGrid = document.getElementById('adminMediaGrid');
  const guestbookTableBody = document.getElementById('adminGuestbookBody');

  const btnSelectAll = document.getElementById('btnSelectAll');
  const btnDownloadSelected = document.getElementById('btnDownloadSelected');
  const btnDownloadAll = document.getElementById('btnDownloadAll');
  const selectedCountText = document.getElementById('selectedCountText');

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

  // =====================================================================
  // 1. MODALES Y DIÁLOGOS ELEGANTES
  // =====================================================================
  function showConfirm(message, callback) {
    if (!confirmModal) return;
    confirmModalText.textContent = message;
    confirmCallback = callback;
    confirmModal.classList.add('active');
  }

  if (btnConfirmCancel) {
    btnConfirmCancel.addEventListener('click', () => {
      confirmModal.classList.remove('active');
      confirmCallback = null;
    });
  }

  if (btnConfirmOk) {
    btnConfirmOk.addEventListener('click', () => {
      confirmModal.classList.remove('active');
      if (confirmCallback) {
        confirmCallback();
        confirmCallback = null;
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
  // 3. GESTIÓN MULTIMEDIA (Checkboxes, Descargas ZIP y Borrado)
  // =====================================================================
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
    selectedMediaIds.clear();
    updateSelectedState();

    if (!items || items.length === 0) {
      mediaGrid.innerHTML = '<p style="color:var(--text-muted); grid-column:1/-1; text-align:center; padding:40px;">Aún no se han subido fotos o videos.</p>';
      return;
    }

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'admin-media-card';
      card.dataset.id = item.id;

      const isVideo = item.media_type === 'video';

      card.innerHTML = `
        <div class="admin-card-select-wrap">
          <input type="checkbox" class="admin-checkbox" data-id="${item.id}" />
        </div>
        ${isVideo ? `
          <video class="admin-media-preview" src="${item.url}" preload="metadata"></video>
        ` : `
          <img class="admin-media-preview" src="${item.url}" alt="${item.original_name}" loading="lazy" />
        `}
        <div class="admin-media-meta">
          <div class="admin-media-author">${item.guest_name}</div>
          <div class="admin-media-sub">
            <span>${(item.file_size / 1024).toFixed(0)} KB · ${item.likes_count} likes</span>
            <span>${item.created_at.substring(5, 16)}</span>
          </div>
          <div class="admin-media-card-actions">
            <a href="${item.url}" download="${item.original_name}" class="admin-btn admin-btn-outline" style="padding:6px 12px; font-size:0.75rem;" title="Descargar">
              ⬇ Guardar
            </a>
            <button class="admin-btn admin-btn-danger btn-delete-media" data-id="${item.id}" style="padding:6px 12px; font-size:0.75rem;" title="Eliminar">
              ✕ Borrar
            </button>
          </div>
        </div>
      `;

      // Checkbox click
      const chk = card.querySelector('.admin-checkbox');
      chk.addEventListener('change', () => {
        if (chk.checked) {
          selectedMediaIds.add(item.id);
          card.classList.add('selected');
        } else {
          selectedMediaIds.delete(item.id);
          card.classList.remove('selected');
        }
        updateSelectedState();
      });

      // Preview click to zoom
      const prev = card.querySelector('.admin-media-preview');
      prev.addEventListener('click', () => {
        window.open(item.url, '_blank');
      });

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

  function updateSelectedState() {
    const count = selectedMediaIds.size;
    if (selectedCountText) {
      selectedCountText.textContent = `${count} seleccionadas`;
    }
    if (btnDownloadSelected) {
      btnDownloadSelected.disabled = count === 0;
      btnDownloadSelected.style.opacity = count === 0 ? '0.5' : '1';
    }
  }

  if (btnSelectAll) {
    btnSelectAll.addEventListener('click', () => {
      const allCheckboxes = document.querySelectorAll('.admin-checkbox');
      const allSelected = selectedMediaIds.size === allMediaItems.length && allMediaItems.length > 0;

      allCheckboxes.forEach(chk => {
        const id = parseInt(chk.dataset.id, 10);
        if (allSelected) {
          chk.checked = false;
          selectedMediaIds.delete(id);
          chk.closest('.admin-media-card').classList.remove('selected');
        } else {
          chk.checked = true;
          selectedMediaIds.add(id);
          chk.closest('.admin-media-card').classList.add('selected');
        }
      });

      btnSelectAll.textContent = allSelected ? 'Seleccionar Todas' : 'Deseleccionar Todas';
      updateSelectedState();
    });
  }

  // Descargas ZIP
  if (btnDownloadAll) {
    btnDownloadAll.addEventListener('click', () => {
      window.location.href = '/api/zip-download';
    });
  }

  if (btnDownloadSelected) {
    btnDownloadSelected.addEventListener('click', () => {
      if (selectedMediaIds.size === 0) return;
      const ids = Array.from(selectedMediaIds).join(',');
      window.location.href = `/api/zip-download?ids=${encodeURIComponent(ids)}`;
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
        loadMedia();
        loadStats();
      } else {
        alert(data.error || 'Error al eliminar');
      }
    } catch (e) {
      alert('Error de conexión');
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
              loadGuestbook();
              loadStats();
            }
          } catch (e) {
            alert('Error');
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
