/**
 * BODA MICHELLE & RENÉ — PWA App Móvil & Escritorio para Invitados
 * Portada con Slideshow Tenue + Pétalos, Navegación Hamburguesa con Cámara Destacada,
 * Cámara en Vivo Multi-Captura (Foto/Video/Galería, < 25 recuerdos),
 * Gestión de Recuerdos, Galería Animada y Libro de Firmas tipo Libro.
 */

(function () {
  'use strict';

  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB por archivo (límite del servidor)
  const MAX_ITEMS = 24; // Menos de 25 recuerdos por invitado
  const BOOK_PAGE_SIZE = 4; // Firmas por hoja del libro (mínimo scroll)

  let currentGuest = null;
  let currentFilter = 'all';
  let allMediaCache = [];
  let myMediaCache = [];
  let guestbookEntries = [];
  let currentBookPage = 1;

  // Estado de Cámara en Vivo y Multi-Captura
  let cameraStream = null;
  let currentFacingMode = 'environment';
  let currentCameraMode = 'photo'; // 'photo' | 'video'
  let mediaRecorder = null;
  let recordedChunks = [];
  let recordedApproxBytes = 0;
  let recordTimerInterval = null;
  let recordSeconds = 0;
  let capturedQueue = []; // [{ id, file, type: 'image'|'video', previewUrl }]
  let previewingQueueId = null;

  // Acciones pendientes tras identificar invitado
  let pendingFilesBatch = null;
  let deferredInstallPrompt = null;

  // Referencias DOM
  const guestModal = document.getElementById('guestModal');
  const guestModalClose = document.getElementById('guestModalClose');
  const guestModalCurrentName = document.getElementById('guestModalCurrentName');
  const guestNameInput = document.getElementById('guestNameInput');
  const guestForm = document.getElementById('guestForm');
  const guestDisplayBadge = document.getElementById('guestDisplayBadge');
  const guestDisplayName = document.getElementById('guestDisplayName');
  const drawerGuestLabel = document.getElementById('drawerGuestLabel');
  const bannerGuestName = document.getElementById('bannerGuestName');
  const guestQuotaText = document.getElementById('guestQuotaText');
  const guestQuotaRemaining = document.getElementById('guestQuotaRemaining');
  const quotaProgressFill = document.getElementById('quotaProgressFill');

  const btnLivePhotoCamera = document.getElementById('btnLivePhotoCamera');
  const btnLiveVideoCamera = document.getElementById('btnLiveVideoCamera');
  const btnUploadFromDevice = document.getElementById('btnUploadFromDevice');
  const inputUploadDevice = document.getElementById('inputUploadDevice');

  const liveCameraModal = document.getElementById('liveCameraModal');
  const liveCamModeText = document.getElementById('liveCamModeText');
  const liveCamQuotaChip = document.getElementById('liveCamQuotaChip');
  const liveCamHint = document.getElementById('liveCamHint');
  const cameraVideo = document.getElementById('cameraVideo');
  const cameraCanvas = document.getElementById('cameraCanvas');
  const cameraFlash = document.getElementById('cameraFlash');
  const cameraRecBadge = document.getElementById('cameraRecBadge');
  const cameraRecTimer = document.getElementById('cameraRecTimer');
  const cameraPermissionOverlay = document.getElementById('cameraPermissionOverlay');
  const cameraPermTitle = document.getElementById('cameraPermTitle');
  const cameraPermMessage = document.getElementById('cameraPermMessage');
  const btnRetryCameraPermission = document.getElementById('btnRetryCameraPermission');
  const cameraItemPreview = document.getElementById('cameraItemPreview');
  const cameraItemPreviewImg = document.getElementById('cameraItemPreviewImg');
  const cameraItemPreviewVideo = document.getElementById('cameraItemPreviewVideo');
  const btnPreviewClose = document.getElementById('btnPreviewClose');
  const btnPreviewRemove = document.getElementById('btnPreviewRemove');
  const cameraCaptureTrayWrap = document.getElementById('cameraCaptureTrayWrap');
  const cameraCaptureTray = document.getElementById('cameraCaptureTray');
  const btnCameraShutter = document.getElementById('btnCameraShutter');
  const btnCameraRecord = document.getElementById('btnCameraRecord');
  const btnCameraFlip = document.getElementById('btnCameraFlip');
  const btnCameraClose = document.getElementById('btnCameraClose');
  const btnUploadCapturedBatch = document.getElementById('btnUploadCapturedBatch');
  const uploadBatchCount = document.getElementById('uploadBatchCount');

  const uploadProgress = document.getElementById('uploadProgress');
  const progressBarFill = document.getElementById('progressBarFill');
  const progressText = document.getElementById('progressText');

  const myUploadsGrid = document.getElementById('myUploadsGrid');
  const myUploadsEmpty = document.getElementById('myUploadsEmpty');
  const btnRefreshMyUploads = document.getElementById('btnRefreshMyUploads');

  const galleryGrid = document.getElementById('galleryGrid');
  const galleryEmpty = document.getElementById('galleryEmpty');
  const galleryLoadingState = document.getElementById('gallery-loading-state');
  const galleryTabs = document.querySelectorAll('.tab-btn');
  const btnRefreshGallery = document.getElementById('btnRefreshGallery');

  const guestbookForm = document.getElementById('guestbookForm');
  const guestbookList = document.getElementById('guestbookList');
  const guestbookAuthorInput = document.getElementById('gbAuthor');
  const guestbookMsgInput = document.getElementById('gbMessage');
  const btnBookWriteTab = document.getElementById('btnBookWriteTab');
  const btnBookReadTab = document.getElementById('btnBookReadTab');
  const btnGoToReadSignatures = document.getElementById('btnGoToReadSignatures');
  const btnBackToWrite = document.getElementById('btnBackToWrite');
  const bookWriteView = document.getElementById('bookWriteView');
  const bookReadView = document.getElementById('bookReadView');
  const gbBookCountPill = document.getElementById('gbBookCountPill');
  const bookPagination = document.getElementById('bookPagination');
  const btnBookPrevPage = document.getElementById('btnBookPrevPage');
  const btnBookNextPage = document.getElementById('btnBookNextPage');
  const bookPageIndicator = document.getElementById('bookPageIndicator');

  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxVideo = document.getElementById('lightboxVideo');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const lightboxAuthor = document.getElementById('lightboxAuthor');
  const lightboxLikeBtn = document.getElementById('lightboxLikeBtn');
  const lightboxLikeCount = document.getElementById('lightboxLikeCount');
  const lightboxDownloadBtn = document.getElementById('lightboxDownloadBtn');
  const lightboxDeleteBtn = document.getElementById('lightboxDeleteBtn');
  let currentLightboxItems = [];
  let currentLightboxIndex = 0;

  const toastContainer = document.getElementById('toastContainer');

  // Utilidad segura contra HTML injection
  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // =====================================================================
  // 1. PWA SERVICE WORKER, INSTALACIÓN Y TRANSICIONES SUAVES ENTRE VISTAS
  // =====================================================================
  function initPWA() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      });
    }

    const installBtn = document.getElementById('pwaInstallBtn');
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      if (installBtn) installBtn.style.display = 'flex';
    });

    if (installBtn) {
      installBtn.addEventListener('click', async () => {
        if (!deferredInstallPrompt) return;
        deferredInstallPrompt.prompt();
        await deferredInstallPrompt.userChoice.catch(() => {});
        deferredInstallPrompt = null;
        installBtn.style.display = 'none';
      });
    }

    // Transiciones suaves tipo App al navegar entre vistas internas
    document.querySelectorAll('a.app-nav-link').forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || link.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) {
          return;
        }
        const targetUrl = new URL(href, window.location.origin);
        if (targetUrl.origin !== window.location.origin) return;
        if (targetUrl.pathname === window.location.pathname && !targetUrl.hash) {
          e.preventDefault();
          closeMobileDrawer();
          return;
        }
        e.preventDefault();
        closeMobileDrawer();
        document.body.classList.add('app-page-leave');
        setTimeout(() => {
          window.location.href = targetUrl.href;
        }, 160);
      });
    });

    // Asegurar visibilidad si el usuario vuelve con el botón "Atrás" (bfcache)
    window.addEventListener('pageshow', () => {
      document.body.classList.remove('app-page-leave');
    });
  }

  // =====================================================================
  // 2. MENÚ HAMBURGUESA MÓVIL (DRAWER DESPLEGABLE)
  // =====================================================================
  const navHamburgerBtn = document.getElementById('navHamburgerBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileDrawerBackdrop = document.getElementById('mobileDrawerBackdrop');
  const mobileDrawerClose = document.getElementById('mobileDrawerClose');
  const drawerProfileBtn = document.getElementById('drawerProfileBtn');

  function openMobileDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.add('is-open');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    if (mobileDrawerBackdrop) {
      mobileDrawerBackdrop.classList.add('is-open');
      mobileDrawerBackdrop.setAttribute('aria-hidden', 'false');
    }
    if (navHamburgerBtn) {
      navHamburgerBtn.classList.add('is-open');
      navHamburgerBtn.setAttribute('aria-expanded', 'true');
    }
    document.body.style.overflow = 'hidden';
  }

  function closeMobileDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.remove('is-open');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    if (mobileDrawerBackdrop) {
      mobileDrawerBackdrop.classList.remove('is-open');
      mobileDrawerBackdrop.setAttribute('aria-hidden', 'true');
    }
    if (navHamburgerBtn) {
      navHamburgerBtn.classList.remove('is-open');
      navHamburgerBtn.setAttribute('aria-expanded', 'false');
    }
    document.body.style.overflow = '';
  }

  if (navHamburgerBtn) {
    navHamburgerBtn.addEventListener('click', () => {
      if (mobileDrawer && mobileDrawer.classList.contains('is-open')) {
        closeMobileDrawer();
      } else {
        openMobileDrawer();
      }
    });
  }
  if (mobileDrawerClose) mobileDrawerClose.addEventListener('click', closeMobileDrawer);
  if (mobileDrawerBackdrop) mobileDrawerBackdrop.addEventListener('click', closeMobileDrawer);
  if (drawerProfileBtn) {
    drawerProfileBtn.addEventListener('click', () => {
      closeMobileDrawer();
      promptGuestName(true);
    });
  }

  // =====================================================================
  // 3. PRELOADER DE PRIMERA ENTRADA (SOLO 1 VEZ POR SESIÓN)
  // =====================================================================
  function initPreloader() {
    const preloader = document.getElementById('interactive-preloader');
    if (!preloader) return;

    if (sessionStorage.getItem('boda_mr_preloaded')) {
      preloader.remove();
      document.body.classList.remove('loading');
      return;
    }

    const ringCircle = document.getElementById('preloader-ring-circle');
    const percentageText = document.getElementById('preloader-percentage');
    const skipBtn = document.getElementById('pl-skip-btn');
    const CIRCUMFERENCE = 1320;
    let progress = 0;
    let dismissed = false;

    function setProgress(val) {
      progress = Math.min(100, Math.max(progress, val));
      if (percentageText) percentageText.textContent = `${Math.round(progress)}%`;
      if (ringCircle) {
        ringCircle.style.strokeDashoffset = String(CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE);
      }
    }

    function dismissPreloader() {
      if (dismissed) return;
      dismissed = true;
      sessionStorage.setItem('boda_mr_preloaded', '1');
      setProgress(100);
      preloader.classList.add('is-hidden');
      document.body.classList.remove('loading');
      setTimeout(() => {
        if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
      }, 650);
    }

    if (skipBtn) {
      skipBtn.addEventListener('click', (e) => {
        e.preventDefault();
        dismissPreloader();
      });
    }

    const interval = setInterval(() => {
      if (dismissed) {
        clearInterval(interval);
        return;
      }
      setProgress(progress + (progress < 75 ? 16 : 9));
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(dismissPreloader, 180);
      }
    }, 90);

    setTimeout(dismissPreloader, 1600);
  }

  // =====================================================================
  // 4. PORTADA HOME: SLIDESHOW TENUE DE FOTOS + LLUVIA SUAVE DE PÉTALOS
  // =====================================================================
  function initHeroSlideshow() {
    const container = document.getElementById('heroSlideshow');
    if (!container) return;
    const slides = Array.from(container.querySelectorAll('.hero-slide'));
    if (slides.length <= 1) return;

    let current = 0;
    setInterval(() => {
      if (document.hidden) return;
      slides[current].classList.remove('is-active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('is-active');
    }, 5400);
  }

  function initFallingPetals() {
    const canvas = document.getElementById('petalsCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      width = canvas.clientWidth || window.innerWidth;
      height = canvas.clientHeight || window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener('resize', resize);

    const colors = [
      'rgba(255, 245, 236, 0.75)',
      'rgba(246, 224, 214, 0.72)',
      'rgba(244, 226, 183, 0.68)',
      'rgba(255, 251, 244, 0.78)',
      'rgba(236, 206, 198, 0.65)'
    ];

    const petalCount = window.innerWidth < 768 ? 22 : 34;
    const petals = Array.from({ length: petalCount }, () => createPetal(true));

    function createPetal(randomY) {
      const size = 6 + Math.random() * 9;
      return {
        x: Math.random() * width,
        y: randomY ? Math.random() * height : -20 - Math.random() * 60,
        size,
        speedY: 0.45 + Math.random() * 0.85,
        speedX: -0.25 + Math.random() * 0.5,
        swayAmp: 0.4 + Math.random() * 0.9,
        swayFreq: 0.008 + Math.random() * 0.012,
        phase: Math.random() * Math.PI * 2,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (-0.015 + Math.random() * 0.03),
        tilt: Math.random() * Math.PI,
        tiltSpeed: 0.01 + Math.random() * 0.02,
        color: colors[Math.floor(Math.random() * colors.length)]
      };
    }

    let frame = 0;
    function draw() {
      if (!document.hidden) {
        frame++;
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < petals.length; i++) {
          const p = petals[i];
          p.y += p.speedY;
          p.x += p.speedX + Math.sin(frame * p.swayFreq + p.phase) * p.swayAmp;
          p.rot += p.rotSpeed;
          p.tilt += p.tiltSpeed;

          if (p.y > height + 30 || p.x < -40 || p.x > width + 40) {
            petals[i] = createPetal(false);
            continue;
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.scale(1, 0.55 + Math.abs(Math.cos(p.tilt)) * 0.45);

          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.bezierCurveTo(p.size * 0.85, -p.size * 0.65, p.size * 0.9, p.size * 0.55, 0, p.size);
          ctx.bezierCurveTo(-p.size * 0.9, p.size * 0.55, -p.size * 0.85, -p.size * 0.65, 0, -p.size);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      }
      requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
  }

  // =====================================================================
  // 5. NOTIFICACIONES TOAST
  // =====================================================================
  function showToast(message, type = 'info', title = '') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast-item ${type}`;

    const icons = {
      success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>',
      error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D32F2F" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
      info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A050" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
    };

    const heading = title || (type === 'success' ? '¡Listo!' : type === 'error' ? 'Aviso' : 'Boda M&R');
    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || icons.info}</div>
      <div class="toast-content">
        <div class="toast-title">${escapeHtml(heading)}</div>
        <div class="toast-msg">${escapeHtml(message)}</div>
      </div>
    `;

    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(40px)';
      toast.style.transition = 'all 0.32s ease';
      setTimeout(() => toast.remove(), 340);
    }, 3800);
  }

  // =====================================================================
  // 6. SESIÓN Y PERFIL DEL INVITADO (NO INTRUSIVO EN PORTADA)
  // =====================================================================
  function getUploadedCount() {
    return currentGuest ? Number(currentGuest.item_count || 0) : 0;
  }

  function getMaxItems() {
    return (currentGuest && currentGuest.max_items) ? Math.min(Number(currentGuest.max_items), MAX_ITEMS) : MAX_ITEMS;
  }

  function updateQuotaUI() {
    const count = getUploadedCount();
    const max = getMaxItems();
    const remaining = Math.max(0, max - count);
    const pct = Math.min(100, Math.round((count / max) * 100));

    if (guestQuotaText) guestQuotaText.textContent = `${count} de ${max} recuerdos`;
    if (guestQuotaRemaining) {
      guestQuotaRemaining.textContent = remaining > 0
        ? `Te quedan ${remaining} disponibles`
        : 'Cupo completo (elimina alguno para subir más)';
    }
    if (quotaProgressFill) quotaProgressFill.style.width = `${pct}%`;

    const totalInCamera = count + capturedQueue.length;
    if (liveCamQuotaChip) liveCamQuotaChip.textContent = `${totalInCamera} / ${max}`;
  }

  async function checkGuestSession() {
    const savedToken = localStorage.getItem('mr_guest_token');
    if (!savedToken) {
      updateQuotaUI();
      if (myUploadsGrid) renderMyUploads([]);
      return;
    }

    try {
      const res = await fetch('/api/auth/guest-me', {
        headers: { 'X-Guest-Token': savedToken }
      });
      const data = await res.json();
      if (data.success && data.guest) {
        setGuestSession(data.guest);
      } else {
        updateQuotaUI();
        if (myUploadsGrid) renderMyUploads([]);
      }
    } catch (e) {
      updateQuotaUI();
    }
  }

  function promptGuestName(canClose = true) {
    if (!guestModal) return;
    const existingName = localStorage.getItem('mr_guest_name') || (currentGuest ? currentGuest.name : '');
    if (guestNameInput && existingName) {
      guestNameInput.value = existingName;
    }
    if (guestModalCurrentName) {
      const infoWrap = guestModalCurrentName.closest('.modal-current-info');
      if (existingName) {
        guestModalCurrentName.textContent = existingName;
        if (infoWrap) infoWrap.style.display = 'block';
      } else if (infoWrap) {
        infoWrap.style.display = 'none';
      }
    }
    if (guestModalClose) {
      guestModalClose.style.display = (canClose || Boolean(existingName)) ? 'grid' : 'none';
    }
    guestModal.classList.add('active');
    setTimeout(() => {
      if (guestNameInput) guestNameInput.focus();
    }, 150);
  }

  function closeGuestModal() {
    if (guestModal) guestModal.classList.remove('active');
  }

  window.promptGuestName = promptGuestName;
  window.closeGuestModal = closeGuestModal;

  if (guestModalClose) guestModalClose.addEventListener('click', closeGuestModal);
  if (guestModal) {
    guestModal.addEventListener('click', (e) => {
      if (e.target === guestModal) closeGuestModal();
    });
  }

  function setGuestSession(guest) {
    currentGuest = guest;
    localStorage.setItem('mr_guest_token', guest.token);
    localStorage.setItem('mr_guest_name', guest.name);

    if (guestModal) guestModal.classList.remove('active');
    if (guestDisplayName) guestDisplayName.textContent = guest.name;
    if (guestDisplayBadge) guestDisplayBadge.style.display = 'inline-flex';
    if (drawerGuestLabel) drawerGuestLabel.textContent = `Perfil: ${guest.name}`;
    if (bannerGuestName) bannerGuestName.textContent = guest.name;
    if (guestbookAuthorInput && !guestbookAuthorInput.value) {
      guestbookAuthorInput.value = guest.name;
    }

    updateQuotaUI();

    // Ejecutar subida pendiente si el usuario se identificó al subir un lote
    if (pendingFilesBatch && pendingFilesBatch.length > 0) {
      const batch = pendingFilesBatch;
      pendingFilesBatch = null;
      uploadFilesBatch(batch);
    }

    if (galleryGrid) loadGallery(false);
    if (myUploadsGrid) loadMyUploads();
  }

  if (guestForm) {
    guestForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = guestNameInput ? guestNameInput.value.trim() : '';
      if (!name) {
        showToast('Por favor escribe tu nombre para continuar.', 'error');
        return;
      }

      const existingToken = localStorage.getItem('mr_guest_token') || '';
      try {
        const res = await fetch('/api/auth/guest-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, token: existingToken })
        });
        const data = await res.json();
        if (data.success && data.guest) {
          setGuestSession(data.guest);
          showToast(`¡Bienvenido, ${data.guest.name}!`, 'success');
        } else {
          showToast(data.error || 'No se pudo guardar tu perfil.', 'error');
        }
      } catch (err) {
        showToast('Error de conexión con el servidor.', 'error');
      }
    });
  }

  // =====================================================================
  // 7. COMPRESIÓN INTELIGENTE DE IMÁGENES (< 2 MB GARANTIZADO)
  // =====================================================================
  function compressImageIfNeeded(file) {
    return new Promise((resolve) => {
      if (!file || !file.type || !file.type.startsWith('image/') || file.type === 'image/gif') {
        resolve(file);
        return;
      }
      if (file.size <= 1.75 * 1024 * 1024) {
        resolve(file);
        return;
      }

      const img = new Image();
      const objUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objUrl);
        const maxDim = 1920;
        let w = img.naturalWidth || img.width;
        let h = img.naturalHeight || img.height;
        if (w > maxDim || h > maxDim) {
          const ratio = Math.min(maxDim / w, maxDim / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }

        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);

        const qualities = [0.85, 0.74, 0.62, 0.5];
        let attempt = 0;

        function tryEncode() {
          c.toBlob((blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            if (blob.size <= 1.85 * 1024 * 1024 || attempt >= qualities.length - 1) {
              const baseName = (file.name || 'foto_boda').replace(/\.[^/.]+$/, '');
              resolve(new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' }));
            } else {
              attempt++;
              tryEncode();
            }
          }, 'image/jpeg', qualities[attempt]);
        }

        tryEncode();
      };
      img.onerror = () => {
        URL.revokeObjectURL(objUrl);
        resolve(file);
      };
      img.src = objUrl;
    });
  }

  // =====================================================================
  // 8. CÁMARA EN VIVO MULTI-CAPTURA (SIN SUBIDA DE ARCHIVOS EN MODO CÁMARA)
  // =====================================================================
  function remainingSlotsIncludingQueue() {
    return Math.max(0, getMaxItems() - getUploadedCount() - capturedQueue.length);
  }

  function stopCameraStream() {
    stopRecording(false);
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => {
        try { track.stop(); } catch (e) {}
      });
      cameraStream = null;
    }
    if (cameraVideo) {
      cameraVideo.srcObject = null;
    }
  }

  function showCameraPermissionMessage(title, message) {
    if (cameraPermTitle) cameraPermTitle.textContent = title;
    if (cameraPermMessage) cameraPermMessage.textContent = message;
    if (cameraPermissionOverlay) cameraPermissionOverlay.style.display = 'flex';
  }

  function hideCameraPermissionMessage() {
    if (cameraPermissionOverlay) cameraPermissionOverlay.style.display = 'none';
  }

  async function startLiveCameraStream(facingMode = 'environment') {
    stopCameraStream();
    currentFacingMode = facingMode;
    hideCameraPermissionMessage();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showCameraPermissionMessage(
        'Cámara no disponible en esta conexión',
        'Para abrir la cámara automáticamente desde tu teléfono, la página debe abrirse mediante conexión segura (HTTPS) y con un navegador compatible.'
      );
      return false;
    }

    const isVideo = currentCameraMode === 'video';
    const primaryConstraints = {
      video: {
        facingMode: { ideal: facingMode },
        width: { ideal: isVideo ? 1280 : 1920 },
        height: { ideal: isVideo ? 720 : 1080 }
      },
      audio: isVideo
    };

    try {
      cameraStream = await navigator.mediaDevices.getUserMedia(primaryConstraints);
    } catch (err) {
      // Segundo intento con restricciones básicas (sin abrir selector de archivos)
      try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: isVideo
        });
      } catch (err2) {
        const isDenied = err2 && (err2.name === 'NotAllowedError' || err2.name === 'PermissionDeniedError');
        if (isDenied) {
          showCameraPermissionMessage(
            'Permiso de cámara bloqueado',
            'Tu teléfono bloqueó el acceso a la cámara. Habilita el permiso de cámara (y micrófono para video) en la barra del navegador y pulsa el botón de abajo.'
          );
        } else {
          showCameraPermissionMessage(
            'No se pudo iniciar la cámara',
            'Verifica que ninguna otra app esté usando la cámara y vuelve a intentarlo.'
          );
        }
        return false;
      }
    }

    if (cameraVideo && cameraStream) {
      cameraVideo.srcObject = cameraStream;
      try {
        await cameraVideo.play();
      } catch (e) {}
    }
    return true;
  }

  function renderCaptureTray() {
    if (!cameraCaptureTray || !cameraCaptureTrayWrap) return;
    cameraCaptureTray.innerHTML = '';

    const count = capturedQueue.length;
    cameraCaptureTrayWrap.style.display = count > 0 ? 'block' : 'none';

    if (btnUploadCapturedBatch) {
      btnUploadCapturedBatch.style.display = count > 0 ? 'inline-flex' : 'none';
    }
    if (uploadBatchCount) {
      uploadBatchCount.textContent = String(count);
    }

    const remaining = remainingSlotsIncludingQueue();
    if (liveCamHint) {
      if (remaining <= 0) {
        liveCamHint.textContent = 'Límite alcanzado · Pulsa Subir';
      } else if (count > 0) {
        liveCamHint.textContent = `${count} ${count === 1 ? 'listo' : 'listos'} · Quedan ${remaining}`;
      } else {
        liveCamHint.textContent = currentCameraMode === 'video' ? 'Pulsa para grabar' : 'Toca para capturar';
      }
    }

    updateQuotaUI();

    capturedQueue.forEach((entry) => {
      const thumb = document.createElement('div');
      thumb.className = 'cam-tray-thumb';

      if (entry.type === 'video') {
        thumb.innerHTML = `
          <video src="${entry.previewUrl}" muted playsinline preload="metadata"></video>
          <span class="cam-tray-vid-tag">VID</span>
          <button type="button" class="cam-tray-remove" aria-label="Quitar">&times;</button>
        `;
      } else {
        thumb.innerHTML = `
          <img src="${entry.previewUrl}" alt="Captura" />
          <button type="button" class="cam-tray-remove" aria-label="Quitar">&times;</button>
        `;
      }

      thumb.addEventListener('click', (e) => {
        if (e.target.closest('.cam-tray-remove')) {
          e.stopPropagation();
          removeCapturedItem(entry.id);
          return;
        }
        openCapturedItemPreview(entry.id);
      });

      cameraCaptureTray.appendChild(thumb);
    });
  }

  function removeCapturedItem(id) {
    const idx = capturedQueue.findIndex((x) => x.id === id);
    if (idx !== -1) {
      try { URL.revokeObjectURL(capturedQueue[idx].previewUrl); } catch (e) {}
      capturedQueue.splice(idx, 1);
    }
    if (previewingQueueId === id) closeCapturedItemPreview();
    renderCaptureTray();
  }

  function clearCapturedQueue() {
    capturedQueue.forEach((entry) => {
      try { URL.revokeObjectURL(entry.previewUrl); } catch (e) {}
    });
    capturedQueue = [];
    closeCapturedItemPreview();
    renderCaptureTray();
  }

  function openCapturedItemPreview(id) {
    const entry = capturedQueue.find((x) => x.id === id);
    if (!entry || !cameraItemPreview) return;
    previewingQueueId = id;

    if (entry.type === 'video') {
      if (cameraItemPreviewImg) cameraItemPreviewImg.style.display = 'none';
      if (cameraItemPreviewVideo) {
        cameraItemPreviewVideo.src = entry.previewUrl;
        cameraItemPreviewVideo.style.display = 'block';
        cameraItemPreviewVideo.play().catch(() => {});
      }
    } else {
      if (cameraItemPreviewVideo) {
        cameraItemPreviewVideo.pause();
        cameraItemPreviewVideo.style.display = 'none';
      }
      if (cameraItemPreviewImg) {
        cameraItemPreviewImg.src = entry.previewUrl;
        cameraItemPreviewImg.style.display = 'block';
      }
    }
    cameraItemPreview.style.display = 'flex';
  }

  function closeCapturedItemPreview() {
    previewingQueueId = null;
    if (cameraItemPreview) cameraItemPreview.style.display = 'none';
    if (cameraItemPreviewVideo) {
      cameraItemPreviewVideo.pause();
      cameraItemPreviewVideo.src = '';
    }
  }

  async function openLiveCamera(mode) {
    if (!liveCameraModal) return;

    if (getUploadedCount() >= getMaxItems()) {
      showToast(`Ya alcanzaste tu límite de ${getMaxItems()} recuerdos. Puedes eliminar alguno abajo para subir nuevos.`, 'error');
      return;
    }

    currentCameraMode = mode === 'video' ? 'video' : 'photo';
    clearCapturedQueue();

    if (liveCamModeText) {
      liveCamModeText.textContent = currentCameraMode === 'video' ? 'Cámara de Video' : 'Cámara de Fotos';
    }
    if (btnCameraShutter) btnCameraShutter.style.display = currentCameraMode === 'photo' ? 'grid' : 'none';
    if (btnCameraRecord) btnCameraRecord.style.display = currentCameraMode === 'video' ? 'grid' : 'none';

    liveCameraModal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    renderCaptureTray();

    // Solicita el permiso y abre la cámara inmediatamente tras el clic del usuario
    await startLiveCameraStream(currentFacingMode);
  }

  function closeLiveCamera() {
    stopCameraStream();
    clearCapturedQueue();
    if (liveCameraModal) liveCameraModal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function snapLivePhoto() {
    if (!cameraVideo || !cameraCanvas || !cameraStream) return;
    if (remainingSlotsIncludingQueue() <= 0) {
      showToast(`Alcanzaste el máximo permitido de ${getMaxItems()} recuerdos. Pulsa "Subir" para guardar los capturados.`, 'info');
      return;
    }

    if (cameraFlash) {
      cameraFlash.classList.add('flash-active');
      setTimeout(() => cameraFlash.classList.remove('flash-active'), 140);
    }

    const vw = cameraVideo.videoWidth || 1280;
    const vh = cameraVideo.videoHeight || 720;
    const maxDim = 1600;
    let cw = vw;
    let ch = vh;
    if (cw > maxDim || ch > maxDim) {
      const r = Math.min(maxDim / cw, maxDim / ch);
      cw = Math.round(cw * r);
      ch = Math.round(ch * r);
    }

    cameraCanvas.width = cw;
    cameraCanvas.height = ch;
    const ctx = cameraCanvas.getContext('2d');
    ctx.save();
    if (currentFacingMode === 'user') {
      ctx.translate(cw, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(cameraVideo, 0, 0, cw, ch);
    ctx.restore();

    cameraCanvas.toBlob(async (blob) => {
      if (!blob) return;
      const rawFile = new File([blob], `boda_foto_${Date.now()}.jpg`, { type: 'image/jpeg' });
      const finalFile = await compressImageIfNeeded(rawFile);
      capturedQueue.push({
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        file: finalFile,
        type: 'image',
        previewUrl: URL.createObjectURL(finalFile)
      });
      renderCaptureTray();
    }, 'image/jpeg', 0.86);
  }

  function startLiveRecording() {
    if (!cameraStream) return;
    if (remainingSlotsIncludingQueue() <= 0) {
      showToast(`Alcanzaste el máximo permitido de ${getMaxItems()} recuerdos. Pulsa "Subir" para guardar los videos.`, 'info');
      return;
    }

    recordedChunks = [];
    recordedApproxBytes = 0;

    const preferredMimes = [
      'video/mp4;codecs=avc1',
      'video/mp4',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=vp9,opus',
      'video/webm'
    ];
    let chosenMime = '';
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported) {
      chosenMime = preferredMimes.find((m) => MediaRecorder.isTypeSupported(m)) || '';
    }

    try {
      const options = {
        videoBitsPerSecond: 750000,
        audioBitsPerSecond: 64000
      };
      if (chosenMime) options.mimeType = chosenMime;

      mediaRecorder = new MediaRecorder(cameraStream, options);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunks.push(e.data);
          recordedApproxBytes += e.data.size;
          // Detener automáticamente antes de llegar a 2 MB para garantizar subida exitosa
          if (recordedApproxBytes >= 1.75 * 1024 * 1024 && mediaRecorder.state === 'recording') {
            stopRecording(true);
            showToast('Clip listo en el tamaño óptimo para subir.', 'info');
          }
        }
      };

      mediaRecorder.onstop = () => {
        clearInterval(recordTimerInterval);
        if (cameraRecBadge) cameraRecBadge.style.display = 'none';
        if (btnCameraRecord) btnCameraRecord.classList.remove('recording');

        const blobType = (mediaRecorder && mediaRecorder.mimeType) || chosenMime || 'video/webm';
        const blob = new Blob(recordedChunks, { type: blobType });
        if (blob.size <= 0) return;

        const ext = blobType.includes('mp4') ? 'mp4' : 'webm';
        const file = new File([blob], `boda_video_${Date.now()}.${ext}`, { type: blobType.split(';')[0] });
        capturedQueue.push({
          id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          file,
          type: 'video',
          previewUrl: URL.createObjectURL(file)
        });
        renderCaptureTray();
      };

      mediaRecorder.start(400);
      if (btnCameraRecord) btnCameraRecord.classList.add('recording');
      if (cameraRecBadge) cameraRecBadge.style.display = 'flex';

      recordSeconds = 0;
      if (cameraRecTimer) cameraRecTimer.textContent = '00:00';
      recordTimerInterval = setInterval(() => {
        recordSeconds++;
        const mins = String(Math.floor(recordSeconds / 60)).padStart(2, '0');
        const secs = String(recordSeconds % 60).padStart(2, '0');
        if (cameraRecTimer) cameraRecTimer.textContent = `${mins}:${secs}`;
        if (recordSeconds >= 15) {
          stopRecording(true);
        }
      }, 1000);
    } catch (err) {
      showToast('Tu navegador no permite grabar video en vivo desde aquí.', 'error');
    }
  }

  function stopRecording(save = true) {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      if (!save) {
        mediaRecorder.ondataavailable = null;
        mediaRecorder.onstop = null;
      }
      try { mediaRecorder.stop(); } catch (e) {}
    }
    clearInterval(recordTimerInterval);
    if (cameraRecBadge) cameraRecBadge.style.display = 'none';
    if (btnCameraRecord) btnCameraRecord.classList.remove('recording');
  }

  // Listeners de los 3 botones principales en /camara
  if (btnLivePhotoCamera) {
    btnLivePhotoCamera.addEventListener('click', () => openLiveCamera('photo'));
  }
  if (btnLiveVideoCamera) {
    btnLiveVideoCamera.addEventListener('click', () => openLiveCamera('video'));
  }
  if (btnUploadFromDevice && inputUploadDevice) {
    btnUploadFromDevice.addEventListener('click', () => {
      if (getUploadedCount() >= getMaxItems()) {
        showToast(`Ya alcanzaste tu límite de ${getMaxItems()} recuerdos. Elimina alguno abajo para subir nuevos.`, 'error');
        return;
      }
      inputUploadDevice.click();
    });

    inputUploadDevice.addEventListener('change', () => {
      const files = Array.from(inputUploadDevice.files || []);
      inputUploadDevice.value = '';
      if (files.length > 0) {
        uploadFilesBatch(files);
      }
    });
  }

  // Controles internos del visor de cámara
  if (btnCameraShutter) btnCameraShutter.addEventListener('click', snapLivePhoto);
  if (btnCameraRecord) {
    btnCameraRecord.addEventListener('click', () => {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        stopRecording(true);
      } else {
        startLiveRecording();
      }
    });
  }
  if (btnCameraFlip) {
    btnCameraFlip.addEventListener('click', () => {
      const next = currentFacingMode === 'environment' ? 'user' : 'environment';
      startLiveCameraStream(next);
    });
  }
  if (btnCameraClose) btnCameraClose.addEventListener('click', closeLiveCamera);
  if (btnRetryCameraPermission) {
    btnRetryCameraPermission.addEventListener('click', () => startLiveCameraStream(currentFacingMode));
  }
  if (btnPreviewClose) btnPreviewClose.addEventListener('click', closeCapturedItemPreview);
  if (btnPreviewRemove) {
    btnPreviewRemove.addEventListener('click', () => {
      if (previewingQueueId) removeCapturedItem(previewingQueueId);
    });
  }
  if (btnUploadCapturedBatch) {
    btnUploadCapturedBatch.addEventListener('click', () => {
      if (capturedQueue.length === 0) return;
      const files = capturedQueue.map((item) => item.file);
      closeLiveCamera();
      uploadFilesBatch(files);
    });
  }

  // =====================================================================
  // 9. SUBIDA POR LOTES (> 1 Y < 25 ELEMENTOS) CON COMPRESIÓN AUTOMÁTICA
  // =====================================================================
  function uploadSingleFile(file, onProgress) {
    return new Promise((resolve) => {
      const formData = new FormData();
      const fallbackExt = (file.type && file.type.includes('video')) ? 'mp4' : 'jpg';
      const fileName = file.name || `recuerdo_${Date.now()}.${fallbackExt}`;
      formData.append('file', file, fileName);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/media', true);
      if (currentGuest && currentGuest.token) {
        xhr.setRequestHeader('X-Guest-Token', currentGuest.token);
      }

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(e.loaded / e.total);
        }
      };

      xhr.onload = () => {
        try {
          const res = JSON.parse(xhr.responseText);
          resolve({ ok: xhr.status === 201 && res.success, res });
        } catch (err) {
          resolve({ ok: false, res: { error: 'Error inesperado al subir.' } });
        }
      };

      xhr.onerror = () => resolve({ ok: false, res: { error: 'Error de conexión.' } });
      xhr.send(formData);
    });
  }

  async function uploadFilesBatch(rawFiles) {
    const files = Array.from(rawFiles || []);
    if (files.length === 0) return;

    if (!currentGuest) {
      pendingFilesBatch = files;
      promptGuestName(true);
      showToast('Escribe tu nombre para guardar tus recuerdos en el álbum.', 'info');
      return;
    }

    const max = getMaxItems();
    const available = Math.max(0, max - getUploadedCount());
    if (available <= 0) {
      showToast(`Ya alcanzaste tu límite de ${max} recuerdos. Elimina alguno para subir más.`, 'error');
      return;
    }

    let toUpload = files;
    if (files.length > available) {
      toUpload = files.slice(0, available);
      showToast(`Solo te quedan ${available} espacios de ${max}. Se subirán los primeros ${available} archivos.`, 'info');
    }

    if (uploadProgress) uploadProgress.style.display = 'block';
    if (progressBarFill) progressBarFill.style.width = '5%';

    let uploadedOk = 0;
    let skippedErrors = [];

    for (let i = 0; i < toUpload.length; i++) {
      const idxLabel = `${i + 1} de ${toUpload.length}`;
      if (progressText) progressText.textContent = `Optimizando y subiendo ${idxLabel}...`;

      const prepared = await compressImageIfNeeded(toUpload[i]);
      if (prepared.size > MAX_FILE_SIZE) {
        const mb = (prepared.size / (1024 * 1024)).toFixed(1);
        skippedErrors.push(`${prepared.name || 'Archivo'} (${mb} MB supera 2 MB)`);
        continue;
      }

      const { ok, res } = await uploadSingleFile(prepared, (fraction) => {
        const overall = Math.round(((i + fraction) / toUpload.length) * 100);
        if (progressBarFill) progressBarFill.style.width = `${overall}%`;
        if (progressText) progressText.textContent = `Subiendo ${idxLabel} · ${overall}%`;
      });

      if (ok) {
        uploadedOk++;
        if (res.guest_item_count !== undefined && currentGuest) {
          currentGuest.item_count = res.guest_item_count;
          updateQuotaUI();
        }
      } else {
        skippedErrors.push(res.error || 'Error al subir archivo');
      }
    }

    if (uploadProgress) uploadProgress.style.display = 'none';
    if (progressBarFill) progressBarFill.style.width = '0%';

    if (uploadedOk > 0) {
      showToast(
        uploadedOk === 1
          ? '¡Tu recuerdo se compartió en el álbum!'
          : `¡${uploadedOk} recuerdos compartidos en el álbum!`,
        'success'
      );
      if (myUploadsGrid) loadMyUploads();
      if (galleryGrid) loadGallery(false);
    }

    if (skippedErrors.length > 0) {
      showToast(skippedErrors[0], 'error', 'Algunos archivos no se subieron');
    }
  }

  // =====================================================================
  // 10. GESTIÓN DE MIS FOTOS Y VIDEOS SUBIDOS (EN /camara)
  // =====================================================================
  async function loadMyUploads() {
    if (!myUploadsGrid) return;
    if (!currentGuest) {
      myMediaCache = [];
      renderMyUploads([]);
      return;
    }

    try {
      const res = await fetch('/api/media?filter=my&limit=40', {
        headers: currentGuest.token ? { 'X-Guest-Token': currentGuest.token } : {}
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        myMediaCache = data.items;
        if (data.guest_item_count !== undefined) {
          currentGuest.item_count = data.guest_item_count;
          updateQuotaUI();
        }
        renderMyUploads(myMediaCache);
      }
    } catch (e) {
      console.error('Error cargando mis recuerdos:', e);
    }
  }

  function renderMyUploads(items) {
    if (!myUploadsGrid) return;
    myUploadsGrid.innerHTML = '';

    if (!items || items.length === 0) {
      if (myUploadsEmpty) myUploadsEmpty.style.display = 'block';
      return;
    }
    if (myUploadsEmpty) myUploadsEmpty.style.display = 'none';

    items.forEach((item, index) => {
      const tile = document.createElement('div');
      tile.className = 'my-upload-tile';
      tile.style.animationDelay = `${Math.min(index * 40, 360)}ms`;

      const isVideo = item.media_type === 'video';
      tile.innerHTML = `
        ${isVideo
          ? `<video src="${item.url}" muted playsinline preload="metadata"></video><span class="my-upload-badge-vid">Video</span>`
          : `<img src="${item.url}" alt="Mi recuerdo" loading="lazy" />`
        }
        <button type="button" class="my-upload-delete" title="Eliminar este recuerdo" aria-label="Eliminar recuerdo">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      `;

      tile.addEventListener('click', (e) => {
        if (e.target.closest('.my-upload-delete')) {
          e.stopPropagation();
          deleteMyMedia(item.id);
          return;
        }
        openLightboxAtIndex(index, items);
      });

      myUploadsGrid.appendChild(tile);
    });
  }

  if (btnRefreshMyUploads) {
    btnRefreshMyUploads.addEventListener('click', () => {
      loadMyUploads();
      showToast('Actualizando tus recuerdos...', 'info');
    });
  }

  // =====================================================================
  // 11. GALERÍA DE ALTA GAMA CON ANIMACIONES EN CASCADA (/galeria)
  // =====================================================================
  function formatTimeAgo(dateString) {
    if (!dateString) return 'Recién subido';
    const d = new Date(dateString.replace(' ', 'T'));
    if (isNaN(d.getTime())) return 'Hoy';
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 60) return 'Hace instantes';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
    return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  }

  function getFilteredItems(filter, items) {
    if (!items || !Array.isArray(items)) return [];
    if (filter === 'my') {
      return items.filter((item) => item.is_owner || (currentGuest && Number(item.guest_id) === Number(currentGuest.id)));
    }
    if (filter === 'popular') {
      return items
        .filter((item) => Number(item.likes_count) > 0)
        .sort((a, b) => Number(b.likes_count) - Number(a.likes_count));
    }
    return items;
  }

  function renderGallery(items) {
    if (!galleryGrid) return;
    galleryGrid.innerHTML = '';
    if (galleryLoadingState) galleryLoadingState.style.display = 'none';

    if (!items || items.length === 0) {
      if (galleryEmpty) galleryEmpty.style.display = 'flex';
      return;
    }
    if (galleryEmpty) galleryEmpty.style.display = 'none';

    items.forEach((item, index) => {
      const tile = document.createElement('div');
      tile.className = 'gallery-grid-item';
      tile.style.transitionDelay = `${Math.min(index * 45, 420)}ms`;

      const isVideo = item.media_type === 'video';
      const isOwner = item.is_owner || (currentGuest && Number(item.guest_id) === Number(currentGuest.id));

      tile.innerHTML = `
        <div class="gallery-item-aspect">
          ${isVideo
            ? `<video src="${item.url}" class="gallery-item-media" muted playsinline preload="metadata"></video>
               <div class="gallery-video-indicator"><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg></div>`
            : `<img src="${item.url}" alt="Recuerdo de ${escapeHtml(item.guest_name)}" class="gallery-item-media" loading="lazy" />`
          }
          <div class="gallery-item-overlay">
            <div class="gallery-overlay-top">
              ${isOwner ? `<button type="button" class="gallery-owner-badge" title="Eliminar mi foto"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>` : ''}
            </div>
            <div class="gallery-overlay-bottom">
              <span class="gallery-item-author">${escapeHtml(item.guest_name || 'Invitado')}</span>
              <button type="button" class="gallery-item-like${item.has_liked ? ' liked' : ''}" title="Me gusta">
                <span class="like-heart">${item.has_liked ? '♥' : '♡'}</span>
                <span class="like-cnt">${item.likes_count || 0}</span>
              </button>
            </div>
          </div>
        </div>
      `;

      tile.addEventListener('click', (e) => {
        const likeBtn = e.target.closest('.gallery-item-like');
        if (likeBtn) {
          e.stopPropagation();
          toggleLike(item.id, likeBtn);
          return;
        }
        const delBtn = e.target.closest('.gallery-owner-badge');
        if (delBtn) {
          e.stopPropagation();
          deleteMyMedia(item.id);
          return;
        }
        openLightboxAtIndex(index, items);
      });

      galleryGrid.appendChild(tile);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => tile.classList.add('visible'));
      });
    });
  }

  async function loadGallery(silent = false) {
    if (!galleryGrid) return;
    if (!silent && allMediaCache.length === 0 && galleryLoadingState) {
      galleryLoadingState.style.display = 'flex';
    }

    try {
      const token = currentGuest ? currentGuest.token : (localStorage.getItem('mr_guest_token') || '');
      const res = await fetch('/api/media?filter=all&limit=80', {
        headers: token ? { 'X-Guest-Token': token } : {}
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        allMediaCache = data.items;
        renderGallery(getFilteredItems(currentFilter, allMediaCache));
        if (data.guest_item_count !== undefined && currentGuest) {
          currentGuest.item_count = data.guest_item_count;
          updateQuotaUI();
        }
      }
    } catch (e) {
      if (galleryLoadingState) galleryLoadingState.style.display = 'none';
    }
  }

  galleryTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      galleryTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.dataset.filter || 'all';
      renderGallery(getFilteredItems(currentFilter, allMediaCache));
    });
  });

  if (btnRefreshGallery) {
    btnRefreshGallery.addEventListener('click', () => {
      btnRefreshGallery.querySelector('svg')?.animate(
        [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }],
        { duration: 550, iterations: 1 }
      );
      loadGallery(false);
    });
  }

  async function toggleLike(mediaId, btnElement) {
    const target = allMediaCache.find((i) => Number(i.id) === Number(mediaId)) ||
                   myMediaCache.find((i) => Number(i.id) === Number(mediaId));
    let newHasLiked = true;
    let newCount = 1;

    if (target) {
      target.has_liked = !target.has_liked;
      target.likes_count = target.has_liked
        ? Number(target.likes_count) + 1
        : Math.max(0, Number(target.likes_count) - 1);
      newHasLiked = target.has_liked;
      newCount = target.likes_count;
    }

    if (btnElement) {
      btnElement.classList.toggle('liked', newHasLiked);
      const heart = btnElement.querySelector('.like-heart, .lb-heart');
      const cnt = btnElement.querySelector('.like-cnt') || lightboxLikeCount;
      if (heart) heart.textContent = newHasLiked ? '♥' : '♡';
      if (cnt) cnt.textContent = newCount;
    }

    try {
      const token = currentGuest ? currentGuest.token : (localStorage.getItem('mr_guest_token') || '');
      const res = await fetch('/api/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Guest-Token': token
        },
        body: JSON.stringify({ media_id: mediaId })
      });
      const data = await res.json();
      if (data.success && target) {
        target.has_liked = data.has_liked;
        target.likes_count = data.likes_count;
      }
    } catch (e) {}
  }

  async function deleteMyMedia(mediaId) {
    if (!confirm('¿Deseas eliminar este recuerdo del álbum de la boda?')) return;

    allMediaCache = allMediaCache.filter((i) => Number(i.id) !== Number(mediaId));
    myMediaCache = myMediaCache.filter((i) => Number(i.id) !== Number(mediaId));
    if (galleryGrid) renderGallery(getFilteredItems(currentFilter, allMediaCache));
    if (myUploadsGrid) renderMyUploads(myMediaCache);

    try {
      const token = currentGuest ? currentGuest.token : (localStorage.getItem('mr_guest_token') || '');
      const res = await fetch('/api/media/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Guest-Token': token
        },
        body: JSON.stringify({ id: mediaId })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Recuerdo eliminado.', 'info');
        if (currentGuest) {
          currentGuest.item_count = Math.max(0, getUploadedCount() - 1);
          updateQuotaUI();
        }
        if (myUploadsGrid) loadMyUploads();
      } else {
        showToast(data.error || 'No se pudo eliminar.', 'error');
        if (galleryGrid) loadGallery(false);
        if (myUploadsGrid) loadMyUploads();
      }
    } catch (e) {
      showToast('Error de conexión.', 'error');
    }
  }

  // =====================================================================
  // 12. LIGHTBOX CON SWIPE TÁCTIL Y TECLADO
  // =====================================================================
  function openLightboxAtIndex(index, itemsList) {
    if (!lightbox || !itemsList || itemsList.length === 0) return;
    currentLightboxItems = itemsList;
    if (index < 0) index = itemsList.length - 1;
    if (index >= itemsList.length) index = 0;
    currentLightboxIndex = index;

    const item = currentLightboxItems[currentLightboxIndex];
    if (!item) return;

    const isVideo = item.media_type === 'video';
    if (isVideo) {
      if (lightboxImg) lightboxImg.style.display = 'none';
      if (lightboxVideo) {
        lightboxVideo.style.display = 'block';
        lightboxVideo.src = item.url;
        lightboxVideo.play().catch(() => {});
      }
    } else {
      if (lightboxVideo) {
        lightboxVideo.pause();
        lightboxVideo.style.display = 'none';
        lightboxVideo.src = '';
      }
      if (lightboxImg) {
        lightboxImg.style.display = 'block';
        lightboxImg.src = item.url;
      }
    }

    if (lightboxCounter) lightboxCounter.textContent = `${currentLightboxIndex + 1} / ${currentLightboxItems.length}`;
    if (lightboxAuthor) lightboxAuthor.textContent = `${item.guest_name || 'Invitado'} · ${formatTimeAgo(item.created_at)}`;
    if (lightboxLikeCount) lightboxLikeCount.textContent = item.likes_count || 0;
    if (lightboxLikeBtn) {
      lightboxLikeBtn.classList.toggle('liked', Boolean(item.has_liked));
      const heart = lightboxLikeBtn.querySelector('.lb-heart');
      if (heart) heart.textContent = item.has_liked ? '♥' : '♡';
    }
    if (lightboxDownloadBtn) {
      lightboxDownloadBtn.href = item.url;
      lightboxDownloadBtn.setAttribute('download', item.original_name || 'recuerdo_boda.jpg');
    }
    if (lightboxDeleteBtn) {
      const isOwner = item.is_owner || (currentGuest && Number(item.guest_id) === Number(currentGuest.id));
      lightboxDeleteBtn.style.display = isOwner ? 'inline-flex' : 'none';
    }
    if (lightboxPrev) lightboxPrev.style.display = currentLightboxItems.length > 1 ? 'flex' : 'none';
    if (lightboxNext) lightboxNext.style.display = currentLightboxItems.length > 1 ? 'flex' : 'none';

    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    if (lightboxVideo) {
      lightboxVideo.pause();
      lightboxVideo.src = '';
    }
    if (lightboxImg) lightboxImg.src = '';
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', () => openLightboxAtIndex(currentLightboxIndex - 1, currentLightboxItems));
  if (lightboxNext) lightboxNext.addEventListener('click', () => openLightboxAtIndex(currentLightboxIndex + 1, currentLightboxItems));

  if (lightboxLikeBtn) {
    lightboxLikeBtn.addEventListener('click', () => {
      const item = currentLightboxItems[currentLightboxIndex];
      if (item) toggleLike(item.id, lightboxLikeBtn);
    });
  }
  if (lightboxDeleteBtn) {
    lightboxDeleteBtn.addEventListener('click', () => {
      const item = currentLightboxItems[currentLightboxIndex];
      if (!item) return;
      closeLightbox();
      deleteMyMedia(item.id);
    });
  }

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    let touchStartX = 0;
    lightbox.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    lightbox.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(dx) > 50 && currentLightboxItems.length > 1) {
        if (dx > 0) openLightboxAtIndex(currentLightboxIndex - 1, currentLightboxItems);
        else openLightboxAtIndex(currentLightboxIndex + 1, currentLightboxItems);
      }
    }, { passive: true });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLightbox();
      closeMobileDrawer();
      closeGuestModal();
    }
    if (lightbox && lightbox.classList.contains('active')) {
      if (e.key === 'ArrowLeft') openLightboxAtIndex(currentLightboxIndex - 1, currentLightboxItems);
      if (e.key === 'ArrowRight') openLightboxAtIndex(currentLightboxIndex + 1, currentLightboxItems);
    }
  });

  // =====================================================================
  // 13. LIBRO DE FIRMAS TIPO LIBRO (CON CAMBIO DE HOJA Y MÍNIMO SCROLL)
  // =====================================================================
  function setBookMode(mode) {
    const isRead = mode === 'read';
    if (bookWriteView) bookWriteView.classList.toggle('is-active', !isRead);
    if (bookReadView) bookReadView.classList.toggle('is-active', isRead);
    if (btnBookWriteTab) btnBookWriteTab.classList.toggle('is-active', !isRead);
    if (btnBookReadTab) btnBookReadTab.classList.toggle('is-active', isRead);
    if (isRead) {
      loadGuestbook();
    }
  }

  if (btnBookWriteTab) btnBookWriteTab.addEventListener('click', () => setBookMode('write'));
  if (btnBookReadTab) btnBookReadTab.addEventListener('click', () => setBookMode('read'));
  if (btnGoToReadSignatures) btnGoToReadSignatures.addEventListener('click', () => setBookMode('read'));
  if (btnBackToWrite) btnBackToWrite.addEventListener('click', () => setBookMode('write'));

  async function loadGuestbook() {
    if (!guestbookList) return;
    try {
      const res = await fetch('/api/guestbook');
      const data = await res.json();
      if (data.success && Array.isArray(data.entries)) {
        guestbookEntries = data.entries;
        renderGuestbookPage(currentBookPage);
      }
    } catch (e) {
      console.error('Error cargando libro de firmas:', e);
    }
  }

  function renderGuestbookPage(pageNum) {
    if (!guestbookList) return;
    const total = guestbookEntries.length;

    if (gbBookCountPill) gbBookCountPill.textContent = String(total);
    const counterBadge = document.getElementById('gbCounterBadge');
    if (counterBadge) {
      counterBadge.textContent = `${total} ${total === 1 ? 'Firma en el libro' : 'Firmas en el libro'}`;
    }

    guestbookList.innerHTML = '';

    if (total === 0) {
      if (bookPagination) bookPagination.style.display = 'none';
      guestbookList.innerHTML = `
        <div style="text-align:center; padding:32px 14px; color:var(--color-olive);">
          <p style="font-family:var(--font-serif); font-size:1.35rem; margin-bottom:6px;">
            Sé el primero en estrenar este libro
          </p>
          <p style="font-size:0.84rem; color:var(--color-text-secondary);">
            Tus palabras quedarán guardadas para siempre en el recuerdo de Michelle &amp; René.
          </p>
        </div>
      `;
      return;
    }

    const totalPages = Math.max(1, Math.ceil(total / BOOK_PAGE_SIZE));
    currentBookPage = Math.min(Math.max(1, pageNum), totalPages);

    const start = (currentBookPage - 1) * BOOK_PAGE_SIZE;
    const pageEntries = guestbookEntries.slice(start, start + BOOK_PAGE_SIZE);

    pageEntries.forEach((entry, idx) => {
      const card = document.createElement('article');
      card.className = 'book-entry-note';
      card.style.animationDelay = `${idx * 55}ms`;
      const dateStr = entry.created_at ? entry.created_at.substring(0, 10) : '';
      card.innerHTML = `
        <div class="book-entry-top">
          <span class="book-entry-author">${escapeHtml(entry.guest_name)}</span>
          <span class="book-entry-date">${escapeHtml(dateStr)}</span>
        </div>
        <p class="book-entry-msg">“${escapeHtml(entry.message)}”</p>
      `;
      guestbookList.appendChild(card);
    });

    if (bookPagination) {
      bookPagination.style.display = totalPages > 1 ? 'flex' : 'none';
    }
    if (bookPageIndicator) {
      bookPageIndicator.textContent = `Página ${currentBookPage} de ${totalPages}`;
    }
    if (btnBookPrevPage) btnBookPrevPage.disabled = currentBookPage <= 1;
    if (btnBookNextPage) btnBookNextPage.disabled = currentBookPage >= totalPages;
  }

  if (btnBookPrevPage) {
    btnBookPrevPage.addEventListener('click', () => renderGuestbookPage(currentBookPage - 1));
  }
  if (btnBookNextPage) {
    btnBookNextPage.addEventListener('click', () => renderGuestbookPage(currentBookPage + 1));
  }

  function initGuestbookChips() {
    document.querySelectorAll('.gb-chip-btn').forEach((chip) => {
      chip.addEventListener('click', () => {
        const text = chip.dataset.msg;
        if (guestbookMsgInput && text) {
          guestbookMsgInput.value = text;
          guestbookMsgInput.focus();
        }
      });
    });
  }

  if (guestbookForm) {
    guestbookForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const author = guestbookAuthorInput ? guestbookAuthorInput.value.trim() : '';
      const message = guestbookMsgInput ? guestbookMsgInput.value.trim() : '';

      if (!author || !message) {
        showToast('Por favor escribe tu nombre y tu dedicatoria.', 'error');
        return;
      }

      try {
        const token = currentGuest ? currentGuest.token : (localStorage.getItem('mr_guest_token') || '');
        const res = await fetch('/api/guestbook', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Guest-Token': token
          },
          body: JSON.stringify({ name: author, message })
        });
        const data = await res.json();
        if (data.success) {
          showToast('¡Tu firma ha quedado guardada en el libro!', 'success');
          if (guestbookMsgInput) guestbookMsgInput.value = '';
          currentBookPage = 1;
          setBookMode('read');
        } else {
          showToast(data.error || 'No se pudo guardar tu firma.', 'error');
        }
      } catch (err) {
        showToast('Error de conexión al enviar tu firma.', 'error');
      }
    });
  }

  // =====================================================================
  // INICIALIZACIÓN
  // =====================================================================
  initPWA();
  initPreloader();
  initHeroSlideshow();
  initFallingPetals();
  initGuestbookChips();
  checkGuestSession();

  if (galleryGrid) loadGallery(false);
  if (guestbookList) loadGuestbook();
})();
