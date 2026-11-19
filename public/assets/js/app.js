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
  const SIGNATURE_FONTS = ['qwigley', 'sacramento', 'indie_flower', 'la_luxes_script'];

  let currentGuest = null;
  let currentFilter = 'all';
  let allMediaCache = [];
  let myMediaCache = [];
  let guestbookEntries = [];
  let currentBookPage = 1;
  let currentBookPageSize = 3;
  let bookIsFlipping = false;

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
  const bookSwipeHint = document.getElementById('bookSwipeHint');
  const bookFlipStage = document.getElementById('bookFlipStage');
  const bookPagesStack = document.getElementById('bookPagesStack');
  const bookLeafActive = document.getElementById('bookLeafActive');
  const bookFrontContent = document.getElementById('bookFrontContent');
  const bookUnderContent = document.getElementById('bookUnderContent');
  const bookFrontShade = document.getElementById('bookFrontShade');
  const bookBackShade = document.getElementById('bookBackShade');
  const bookUnderShadow = document.getElementById('bookUnderShadow');
  const bookPageCurl = document.getElementById('bookPageCurl');
  const bookSigModal = document.getElementById('bookSigModal');
  const bookSigModalClose = document.getElementById('bookSigModalClose');
  const bookSigModalBody = document.getElementById('bookSigModalBody');

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
  const appConfirmModal = document.getElementById('appConfirmModal');
  const appConfirmDialog = document.getElementById('appConfirmDialog');
  const appConfirmIcon = document.getElementById('appConfirmIcon');
  const appConfirmTitle = document.getElementById('appConfirmTitle');
  const appConfirmMsg = document.getElementById('appConfirmMsg');
  const appConfirmCancel = document.getElementById('appConfirmCancel');
  const appConfirmOk = document.getElementById('appConfirmOk');

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
  // 1. PWA SERVICE WORKER, ALTURA REAL VISIBLE EN MÓVIL Y TRANSICIONES
  // =====================================================================
  function syncAppViewportHeight() {
    const h = (window.visualViewport && window.visualViewport.height)
      ? Math.round(window.visualViewport.height)
      : window.innerHeight;
    if (h > 0) {
      document.documentElement.style.setProperty('--app-height', `${h}px`);
    }
  }

  function initPWA() {
    syncAppViewportHeight();
    window.addEventListener('resize', syncAppViewportHeight);
    window.addEventListener('orientationchange', () => setTimeout(syncAppViewportHeight, 120));
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', syncAppViewportHeight);
    }
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

    // Tonos suaves y tenues de flor de cerezo (sakura)
    const palette = [
      { base: [255, 210, 222], tip: [255, 246, 249] },
      { base: [252, 198, 214], tip: [255, 240, 245] },
      { base: [255, 226, 234], tip: [255, 252, 253] },
      { base: [248, 206, 218], tip: [255, 244, 247] }
    ];

    const petalCount = window.innerWidth < 768 ? 18 : 28;
    const petals = Array.from({ length: petalCount }, () => createPetal(true));

    function createPetal(randomY) {
      const size = 6.5 + Math.random() * 8.5;
      return {
        x: Math.random() * width,
        y: randomY ? Math.random() * height : -24 - Math.random() * 60,
        size,
        alpha: 0.18 + Math.random() * 0.24,
        speedY: 0.34 + Math.random() * 0.56,
        speedX: -0.22 + Math.random() * 0.44,
        swayAmp: 0.35 + Math.random() * 0.75,
        swayFreq: 0.007 + Math.random() * 0.01,
        phase: Math.random() * Math.PI * 2,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: -0.012 + Math.random() * 0.024,
        tilt: Math.random() * Math.PI,
        tiltSpeed: 0.009 + Math.random() * 0.018,
        tone: palette[Math.floor(Math.random() * palette.length)]
      };
    }

    function drawCherryPetal(s, tone, alpha) {
      const grad = ctx.createLinearGradient(0, s, 0, -s);
      grad.addColorStop(0, `rgba(${tone.base[0]}, ${tone.base[1]}, ${tone.base[2]}, ${alpha.toFixed(3)})`);
      grad.addColorStop(1, `rgba(${tone.tip[0]}, ${tone.tip[1]}, ${tone.tip[2]}, ${(alpha * 0.78).toFixed(3)})`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      // Base afinada del pétalo de cerezo
      ctx.moveTo(0, s * 0.95);
      // Curva derecha hacia el lóbulo superior derecho
      ctx.bezierCurveTo(s * 0.78, s * 0.52, s * 0.96, -s * 0.42, s * 0.42, -s * 0.92);
      // Escotadura característica (muesca en V suave) en la punta del pétalo de cerezo
      ctx.quadraticCurveTo(s * 0.16, -s * 0.96, 0, -s * 0.58);
      // Lóbulo superior izquierdo simétrico
      ctx.quadraticCurveTo(-s * 0.16, -s * 0.96, -s * 0.42, -s * 0.92);
      // Curva izquierda de regreso a la base
      ctx.bezierCurveTo(-s * 0.96, -s * 0.42, -s * 0.78, s * 0.52, 0, s * 0.95);
      ctx.closePath();
      ctx.fill();
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

          if (p.y > height + 32 || p.x < -42 || p.x > width + 42) {
            petals[i] = createPetal(false);
            continue;
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.scale(0.88 + Math.sin(p.tilt) * 0.12, 0.48 + Math.abs(Math.cos(p.tilt)) * 0.52);
          drawCherryPetal(p.size, p.tone, p.alpha);
          ctx.restore();
        }
      }
      requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
  }

  // =====================================================================
  // 5. NOTIFICACIONES TOAST Y ALERTAS DE CONFIRMACIÓN ELEGANTES
  // =====================================================================
  function dismissToast(toast) {
    if (!toast || toast.dataset.dismissing === '1') return;
    toast.dataset.dismissing = '1';
    if (toast._timerId) {
      clearTimeout(toast._timerId);
      toast._timerId = null;
    }
    toast.classList.add('is-leaving');
    setTimeout(() => toast.remove(), 310);
  }

  function showToast(message, type = 'info', title = '', options = {}) {
    if (!toastContainer) return null;

    const validTypes = ['success', 'error', 'warning', 'info'];
    const safeType = validTypes.includes(type) ? type : 'info';
    const defaultDuration = safeType === 'error' ? 5200 : safeType === 'warning' ? 4600 : 4000;
    const duration = Number(options.duration) > 0 ? Number(options.duration) : defaultDuration;

    // Limitar a máximo 3 notificaciones visibles simultáneamente
    const activeToasts = Array.from(toastContainer.querySelectorAll('.toast-item:not(.is-leaving)'));
    while (activeToasts.length >= 3) {
      dismissToast(activeToasts.shift());
    }

    const icons = {
      success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
      error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
      warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
      info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z"></path></svg>'
    };

    const defaultTitles = {
      success: '¡Listo!',
      error: 'Algo salió mal',
      warning: 'Atención',
      info: 'Boda M&R'
    };

    const toast = document.createElement('div');
    toast.className = `toast-item toast toast-${safeType} ${safeType}`;
    toast.setAttribute('role', safeType === 'error' || safeType === 'warning' ? 'alert' : 'status');
    toast.style.setProperty('--toast-duration', `${duration}ms`);

    const heading = title || defaultTitles[safeType];
    toast.innerHTML = `
      <div class="toast-icon" aria-hidden="true">${icons[safeType]}</div>
      <div class="toast-content">
        <div class="toast-title">${escapeHtml(heading)}</div>
        <div class="toast-msg">${escapeHtml(message)}</div>
      </div>
      <button type="button" class="toast-close" aria-label="Cerrar notificación">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
      <div class="toast-progress" aria-hidden="true"><div class="toast-progress-bar"></div></div>
    `;

    // Temporizador con pausa al pasar el cursor o tocar
    let remaining = duration;
    let startedAt = Date.now();

    const startTimer = () => {
      startedAt = Date.now();
      toast.classList.remove('is-paused');
      toast._timerId = setTimeout(() => dismissToast(toast), remaining);
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

    const closeBtn = toast.querySelector('.toast-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dismissToast(toast);
      });
    }

    // Deslizar hacia arriba o a la derecha en móvil para cerrar
    let touchStartX = 0;
    let touchStartY = 0;
    toast.addEventListener('touchstart', (e) => {
      if (!e.touches || !e.touches[0]) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      pauseTimer();
    }, { passive: true });

    toast.addEventListener('touchend', (e) => {
      if (!e.changedTouches || !e.changedTouches[0]) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (dx > 55 || dy < -32) {
        dismissToast(toast);
      } else if (toast.dataset.dismissing !== '1') {
        startTimer();
      }
    }, { passive: true });

    toastContainer.appendChild(toast);
    startTimer();
    return toast;
  }

  window.showToast = showToast;

  // Modal de Confirmación Elegante (Reemplaza window.confirm)
  let activeConfirmResolve = null;

  function closeConfirmDialog(result) {
    if (!appConfirmModal) return;
    appConfirmModal.classList.remove('active');
    appConfirmModal.setAttribute('aria-hidden', 'true');
    const resolve = activeConfirmResolve;
    activeConfirmResolve = null;
    if (typeof resolve === 'function') resolve(Boolean(result));
  }

  function showConfirmDialog(options = {}) {
    const {
      title = '¿Confirmar acción?',
      message = '',
      confirmText = 'Confirmar',
      cancelText = 'Cancelar',
      variant = 'danger'
    } = typeof options === 'string' ? { message: options } : options;

    if (!appConfirmModal || !appConfirmDialog) {
      return Promise.resolve(window.confirm(message || title));
    }

    if (activeConfirmResolve) {
      closeConfirmDialog(false);
    }

    const icons = {
      danger: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>',
      warning: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
      info: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
      success: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
    };

    const safeVariant = icons[variant] ? variant : 'danger';
    appConfirmDialog.className = `app-confirm-dialog is-${safeVariant}`;
    if (appConfirmIcon) appConfirmIcon.innerHTML = icons[safeVariant];
    if (appConfirmTitle) appConfirmTitle.textContent = title;
    if (appConfirmMsg) appConfirmMsg.textContent = message;
    if (appConfirmCancel) appConfirmCancel.textContent = cancelText;
    if (appConfirmOk) appConfirmOk.textContent = confirmText;

    appConfirmModal.classList.add('active');
    appConfirmModal.setAttribute('aria-hidden', 'false');

    if (appConfirmCancel) {
      setTimeout(() => appConfirmCancel.focus(), 60);
    }

    return new Promise((resolve) => {
      activeConfirmResolve = resolve;
    });
  }

  if (appConfirmCancel) {
    appConfirmCancel.addEventListener('click', () => closeConfirmDialog(false));
  }
  if (appConfirmOk) {
    appConfirmOk.addEventListener('click', () => closeConfirmDialog(true));
  }
  if (appConfirmModal) {
    appConfirmModal.addEventListener('click', (e) => {
      if (e.target === appConfirmModal) closeConfirmDialog(false);
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && appConfirmModal && appConfirmModal.classList.contains('active')) {
      e.preventDefault();
      closeConfirmDialog(false);
    }
  });

  window.showConfirmDialog = showConfirmDialog;

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
        showToast('Por favor escribe tu nombre para continuar.', 'warning', 'Falta tu nombre');
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
          showToast(`¡Bienvenido, ${data.guest.name}!`, 'success', 'Perfil listo');
        } else {
          showToast(data.error || 'No se pudo guardar tu perfil.', 'error', 'No se pudo guardar');
        }
      } catch (err) {
        showToast('Error de conexión con el servidor.', 'error', 'Sin conexión');
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
      showToast(`Ya alcanzaste tu límite de ${getMaxItems()} recuerdos. Puedes eliminar alguno abajo para subir nuevos.`, 'warning', 'Límite alcanzado');
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
      showToast(`Alcanzaste el máximo permitido de ${getMaxItems()} recuerdos. Pulsa "Subir" para guardar los capturados.`, 'warning', 'Álbum lleno');
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
      showToast(`Alcanzaste el máximo permitido de ${getMaxItems()} recuerdos. Pulsa "Subir" para guardar los videos.`, 'warning', 'Álbum lleno');
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
            showToast('Clip listo en el tamaño óptimo para subir.', 'success', 'Video listo');
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
      showToast('Tu navegador no permite grabar video en vivo desde aquí.', 'error', 'Video no compatible');
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
        showToast(`Ya alcanzaste tu límite de ${getMaxItems()} recuerdos. Elimina alguno abajo para subir nuevos.`, 'warning', 'Límite alcanzado');
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
      showToast('Escribe tu nombre para guardar tus recuerdos en el álbum.', 'info', 'Identifícate');
      return;
    }

    const max = getMaxItems();
    const available = Math.max(0, max - getUploadedCount());
    if (available <= 0) {
      showToast(`Ya alcanzaste tu límite de ${max} recuerdos. Elimina alguno para subir más.`, 'warning', 'Límite alcanzado');
      return;
    }

    let toUpload = files;
    if (files.length > available) {
      toUpload = files.slice(0, available);
      showToast(`Solo te quedan ${available} espacios de ${max}. Se subirán los primeros ${available} archivos.`, 'warning', 'Espacio limitado');
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
        'success',
        uploadedOk === 1 ? 'Recuerdo compartido' : 'Recuerdos compartidos'
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
      showToast('Actualizando tus recuerdos...', 'info', 'Sincronizando');
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
    const confirmed = await showConfirmDialog({
      title: '¿Eliminar recuerdo?',
      message: 'Este recuerdo se quitará permanentemente del álbum de la boda.',
      confirmText: 'Sí, eliminar',
      cancelText: 'Conservar',
      variant: 'danger'
    });
    if (!confirmed) return;

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
        showToast('Recuerdo eliminado del álbum.', 'info', 'Recuerdo eliminado');
        if (currentGuest) {
          currentGuest.item_count = Math.max(0, getUploadedCount() - 1);
          updateQuotaUI();
        }
        if (myUploadsGrid) loadMyUploads();
      } else {
        showToast(data.error || 'No se pudo eliminar.', 'error', 'Error al eliminar');
        if (galleryGrid) loadGallery(false);
        if (myUploadsGrid) loadMyUploads();
      }
    } catch (e) {
      showToast('Error de conexión.', 'error', 'Sin conexión');
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
      closeSignatureModal();
    }
    if (lightbox && lightbox.classList.contains('active')) {
      if (e.key === 'ArrowLeft') openLightboxAtIndex(currentLightboxIndex - 1, currentLightboxItems);
      if (e.key === 'ArrowRight') openLightboxAtIndex(currentLightboxIndex + 1, currentLightboxItems);
      return;
    }
    if (bookReadView && bookReadView.classList.contains('is-active') && !(bookSigModal && bookSigModal.classList.contains('is-open'))) {
      if (e.key === 'ArrowRight') triggerBookFlip('next');
      if (e.key === 'ArrowLeft') triggerBookFlip('prev');
    }
  });

  // =====================================================================
  // 13. LIBRO DE FIRMAS 3D INTERACTIVO (HOJA REAL CON DESLIZAMIENTO TÁCTIL)
  // =====================================================================
  function resolveSignatureFont(entry) {
    const raw = entry && typeof entry.font_family === 'string' ? entry.font_family.trim() : '';
    if (SIGNATURE_FONTS.includes(raw)) return raw;
    const seed = Math.abs(Number(entry && entry.id ? entry.id : 0));
    return SIGNATURE_FONTS[seed % SIGNATURE_FONTS.length];
  }

  function computeBookPageSize() {
    const stageH = bookFlipStage ? bookFlipStage.clientHeight : 0;
    if (stageH > 0) {
      return stageH >= 460 ? 4 : 3;
    }
    return window.innerHeight >= 780 ? 4 : 3;
  }

  function computeLineClamp(pageSize) {
    const stageH = bookFlipStage ? bookFlipStage.clientHeight : (window.innerHeight - 260);
    const usableH = Math.max(220, stageH - 46);
    const slotH = usableH / pageSize;
    return slotH >= 132 ? 3 : 2;
  }

  function getTotalBookPages() {
    return Math.max(1, Math.ceil(guestbookEntries.length / currentBookPageSize));
  }

  function buildBookPageHtml(pageNum) {
    const total = guestbookEntries.length;
    const totalPages = getTotalBookPages();

    if (total === 0) {
      return `
        <div class="book-paper-running-head">
          <span>Libro de Honor</span>
          <span>Hoja 1 / 1</span>
        </div>
        <div class="book-paper-empty">
          <p class="book-paper-empty-title">Sé el primero en estrenar este libro</p>
          <p class="book-paper-empty-sub">
            Tus palabras quedarán escritas con tinta y cariño en el recuerdo de Michelle &amp; René.
          </p>
        </div>
      `;
    }

    const safePage = Math.min(Math.max(1, pageNum), totalPages);
    const start = (safePage - 1) * currentBookPageSize;
    const pageEntries = guestbookEntries.slice(start, start + currentBookPageSize);
    const lineClamp = computeLineClamp(currentBookPageSize);

    const entriesHtml = pageEntries.map((entry) => {
      const fontKey = resolveSignatureFont(entry);
      const authorText = entry.raw_guest_name || entry.guest_name || 'Invitado';
      const rawMsg = (entry.raw_message || entry.message || '').replace(/\r?\n+/g, ' ').trim();

      return `
        <article class="book-signature-entry sig-font-${fontKey} is-clickable" data-entry-id="${Number(entry.id)}">
          <p class="book-sig-message">${escapeHtml(rawMsg)}</p>
          <div class="book-sig-footer">
            <span class="book-sig-author">— ${escapeHtml(authorText)}</span>
          </div>
        </article>
      `;
    }).join('');

    return `
      <div class="book-paper-running-head">
        <span>Libro de Honor · M &amp; R</span>
        <span>Hoja ${safePage} de ${totalPages}</span>
      </div>
      <div class="book-paper-entries" data-slots="${currentBookPageSize}" style="--page-slots:${currentBookPageSize}; --sig-lines:${lineClamp};">
        ${entriesHtml}
      </div>
    `;
  }

  function openSignatureModal(entryId) {
    if (!bookSigModal || !bookSigModalBody) return;
    const entry = guestbookEntries.find((e) => Number(e.id) === Number(entryId));
    if (!entry) return;

    const fontKey = resolveSignatureFont(entry);
    const authorText = entry.raw_guest_name || entry.guest_name || 'Invitado';
    const rawMsg = (entry.raw_message || entry.message || '').trim();
    const formattedMsg = escapeHtml(rawMsg).replace(/\r?\n/g, '<br>');

    bookSigModalBody.className = `book-sig-modal-body sig-font-${fontKey}`;
    bookSigModalBody.innerHTML = `
      <p class="book-sig-message">${formattedMsg}</p>
      <div class="book-sig-footer">
        <span class="book-sig-author">— ${escapeHtml(authorText)}</span>
      </div>
    `;

    bookSigModal.classList.add('is-open');
    bookSigModal.setAttribute('aria-hidden', 'false');
  }

  function closeSignatureModal() {
    if (!bookSigModal) return;
    bookSigModal.classList.remove('is-open');
    bookSigModal.setAttribute('aria-hidden', 'true');
  }

  if (bookSigModalClose) bookSigModalClose.addEventListener('click', closeSignatureModal);
  if (bookSigModal) {
    bookSigModal.addEventListener('click', (e) => {
      if (e.target === bookSigModal) closeSignatureModal();
    });
  }

  function resetBookLeafStyles() {
    if (!bookLeafActive) return;
    bookLeafActive.classList.remove('is-animating');
    bookLeafActive.style.transition = '';
    bookLeafActive.style.transform = 'rotateY(0deg)';
    if (bookFrontShade) {
      bookFrontShade.style.transition = '';
      bookFrontShade.style.opacity = '0';
    }
    if (bookBackShade) {
      bookBackShade.style.transition = '';
      bookBackShade.style.opacity = '0';
    }
    if (bookUnderShadow) {
      bookUnderShadow.style.transition = '';
      bookUnderShadow.style.opacity = '0';
    }
  }

  function applyFlipVisuals(angleDeg) {
    if (!bookLeafActive) return;
    const clamped = Math.max(-180, Math.min(0, angleDeg));
    bookLeafActive.style.transform = `rotateY(${clamped.toFixed(2)}deg)`;

    const rad = (Math.abs(clamped) / 180) * Math.PI;
    const arch = Math.sin(rad); // 0 en 0° y -180°, pico 1 en -90°
    if (bookFrontShade) {
      bookFrontShade.style.opacity = (arch * 0.42).toFixed(3);
    }
    if (bookBackShade) {
      bookBackShade.style.opacity = (arch * 0.32).toFixed(3);
    }
    if (bookUnderShadow) {
      const coverFactor = Math.max(0, 1 - Math.abs(clamped) / 155);
      bookUnderShadow.style.opacity = (coverFactor * 0.5).toFixed(3);
    }
  }

  function updateBookChrome() {
    const total = guestbookEntries.length;
    const totalPages = getTotalBookPages();
    currentBookPage = Math.min(Math.max(1, currentBookPage), totalPages);

    if (gbBookCountPill) gbBookCountPill.textContent = String(total);
    const counterBadge = document.getElementById('gbCounterBadge');
    if (counterBadge) {
      counterBadge.textContent = `${total} ${total === 1 ? 'Firma en el libro' : 'Firmas en el libro'}`;
    }

    if (bookPageIndicator) {
      bookPageIndicator.textContent = total > 0 ? `Hoja ${currentBookPage} de ${totalPages}` : 'Libro listo';
    }

    if (bookSwipeHint) {
      if (totalPages <= 1) {
        bookSwipeHint.textContent = total > 0 ? 'Toca una firma para leerla completa' : 'Agrega la primera dedicatoria';
      } else if (currentBookPage === 1) {
        bookSwipeHint.textContent = 'Desliza ← con tu dedo para pasar la hoja';
      } else if (currentBookPage === totalPages) {
        bookSwipeHint.textContent = 'Última hoja · Desliza → para regresar';
      } else {
        bookSwipeHint.textContent = 'Desliza ← o → con tu dedo para hojear';
      }
    }

    if (btnBookPrevPage) btnBookPrevPage.disabled = currentBookPage <= 1 || total === 0;
    if (btnBookNextPage) btnBookNextPage.disabled = currentBookPage >= totalPages || total === 0;

    if (bookPagesStack) {
      const remaining = Math.max(0, totalPages - currentBookPage);
      bookPagesStack.dataset.depth = String(Math.min(3, remaining));
    }

    if (bookPageCurl) {
      bookPageCurl.classList.toggle('is-hidden', currentBookPage >= totalPages || total === 0);
    }
  }

  function renderGuestbookPage(pageNum) {
    if (!bookFrontContent) return;
    currentBookPageSize = computeBookPageSize();
    const totalPages = getTotalBookPages();
    currentBookPage = Math.min(Math.max(1, pageNum), totalPages);

    bookIsFlipping = false;
    resetBookLeafStyles();

    bookFrontContent.innerHTML = buildBookPageHtml(currentBookPage);
    if (bookUnderContent) {
      const nextPreview = currentBookPage < totalPages ? currentBookPage + 1 : currentBookPage;
      bookUnderContent.innerHTML = buildBookPageHtml(nextPreview);
    }
    updateBookChrome();
  }

  function prepareFlipLayers(dir) {
    const totalPages = getTotalBookPages();
    if (!bookFrontContent || !bookUnderContent || !bookLeafActive) return false;

    if (dir === 'next') {
      if (currentBookPage >= totalPages) return false;
      bookFrontContent.innerHTML = buildBookPageHtml(currentBookPage);
      bookUnderContent.innerHTML = buildBookPageHtml(currentBookPage + 1);
      bookLeafActive.classList.remove('is-animating');
      bookLeafActive.style.transition = 'none';
      applyFlipVisuals(0);
      if (bookPageCurl) bookPageCurl.classList.add('is-hidden');
      return true;
    }

    if (dir === 'prev') {
      if (currentBookPage <= 1) return false;
      bookUnderContent.innerHTML = buildBookPageHtml(currentBookPage);
      bookFrontContent.innerHTML = buildBookPageHtml(currentBookPage - 1);
      bookLeafActive.classList.remove('is-animating');
      bookLeafActive.style.transition = 'none';
      applyFlipVisuals(-180);
      if (bookPageCurl) bookPageCurl.classList.add('is-hidden');
      return true;
    }

    return false;
  }

  function finishFlipAnimation(dir, shouldCommit) {
    if (!bookLeafActive) return;
    bookIsFlipping = true;

    const targetAngle = (dir === 'next')
      ? (shouldCommit ? -180 : 0)
      : (shouldCommit ? 0 : -180);

    const durationMs = 460;
    const easing = 'cubic-bezier(0.22, 0.86, 0.32, 1)';

    bookLeafActive.style.transition = `transform ${durationMs}ms ${easing}`;
    if (bookFrontShade) bookFrontShade.style.transition = `opacity ${durationMs}ms ease`;
    if (bookBackShade) bookBackShade.style.transition = `opacity ${durationMs}ms ease`;
    if (bookUnderShadow) bookUnderShadow.style.transition = `opacity ${durationMs}ms ease`;

    // Forzar layout antes de animar
    void bookLeafActive.offsetWidth;
    applyFlipVisuals(targetAngle);

    let done = false;
    const finalize = () => {
      if (done) return;
      done = true;
      bookLeafActive.removeEventListener('transitionend', onEnd);

      if (shouldCommit) {
        currentBookPage += (dir === 'next' ? 1 : -1);
      }

      renderGuestbookPage(currentBookPage);
    };

    const onEnd = (ev) => {
      if (ev.target === bookLeafActive && ev.propertyName === 'transform') {
        finalize();
      }
    };

    bookLeafActive.addEventListener('transitionend', onEnd);
    setTimeout(finalize, durationMs + 70);
  }

  function triggerBookFlip(dir) {
    if (bookIsFlipping || !bookFlipStage) return;
    if (!prepareFlipLayers(dir)) return;
    // Pequeño frame para que el estado inicial se pinte antes de iniciar la vuelta de hoja
    requestAnimationFrame(() => {
      finishFlipAnimation(dir, true);
    });
  }

  function initBookTouchFlip() {
    if (!bookFlipStage || !bookLeafActive) return;

    const drag = {
      active: false,
      pointerId: null,
      startX: 0,
      startY: 0,
      startTime: 0,
      dir: null,
      canTurn: false,
      progress: 0,
      stageWidth: 320,
      tapEntryId: null
    };

    bookFlipStage.addEventListener('pointerdown', (e) => {
      if (bookIsFlipping || guestbookEntries.length === 0) return;
      if (e.button !== undefined && e.button !== 0) return;
      if (e.target && e.target.closest && e.target.closest('#bookPageCurl')) return;

      const entryEl = e.target && e.target.closest ? e.target.closest('.book-signature-entry') : null;
      drag.active = true;
      drag.pointerId = e.pointerId;
      drag.startX = e.clientX;
      drag.startY = e.clientY;
      drag.startTime = performance.now();
      drag.dir = null;
      drag.canTurn = false;
      drag.progress = 0;
      drag.stageWidth = Math.max(220, bookFlipStage.clientWidth || 320);
      drag.tapEntryId = entryEl ? entryEl.dataset.entryId : null;
    });

    bookFlipStage.addEventListener('pointermove', (e) => {
      if (!drag.active || e.pointerId !== drag.pointerId) return;

      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;

      if (!drag.dir) {
        if (Math.abs(dx) < 8) return;
        if (Math.abs(dy) > Math.abs(dx) * 1.35) {
          drag.active = false;
          return;
        }

        drag.dir = dx < 0 ? 'next' : 'prev';
        drag.tapEntryId = null;
        drag.canTurn = prepareFlipLayers(drag.dir);
        bookFlipStage.classList.add('is-dragging');
        if (bookFlipStage.setPointerCapture) {
          try { bookFlipStage.setPointerCapture(e.pointerId); } catch (err) {}
        }
      }

      if (drag.dir === 'next') {
        if (!drag.canTurn) {
          // Efecto suave de tope en la última hoja
          const resist = Math.min(13, Math.abs(dx) * 0.085);
          bookLeafActive.style.transition = 'none';
          applyFlipVisuals(-resist);
          return;
        }
        drag.progress = Math.max(0, Math.min(1, -dx / (drag.stageWidth * 0.82)));
        applyFlipVisuals(-180 * drag.progress);
      } else if (drag.dir === 'prev') {
        if (!drag.canTurn) {
          // Efecto suave de tope en la primera hoja
          const resist = Math.min(10, Math.max(0, dx) * 0.06);
          bookLeafActive.style.transition = 'none';
          bookLeafActive.style.transform = `translateX(${resist.toFixed(1)}px)`;
          return;
        }
        drag.progress = Math.max(0, Math.min(1, dx / (drag.stageWidth * 0.82)));
        applyFlipVisuals(-180 + 180 * drag.progress);
      }
    });

    const handlePointerEnd = (e) => {
      if (!drag.active || e.pointerId !== drag.pointerId) return;

      const wasDragging = Boolean(drag.dir);
      const dir = drag.dir;
      const canTurn = drag.canTurn;
      const progress = drag.progress;
      const tapEntryId = drag.tapEntryId;
      const dx = e.clientX - drag.startX;
      const elapsed = Math.max(16, performance.now() - drag.startTime);
      const velocity = dx / elapsed; // px/ms

      drag.active = false;
      drag.pointerId = null;
      drag.dir = null;
      bookFlipStage.classList.remove('is-dragging');

      if (!wasDragging) {
        if (tapEntryId) {
          openSignatureModal(tapEntryId);
        }
        return;
      }

      if (!canTurn) {
        bookLeafActive.style.transition = 'transform 260ms cubic-bezier(0.22, 0.86, 0.32, 1)';
        bookLeafActive.style.transform = 'rotateY(0deg)';
        if (bookFrontShade) bookFrontShade.style.opacity = '0';
        if (bookUnderShadow) bookUnderShadow.style.opacity = '0';
        setTimeout(() => {
          if (!bookIsFlipping) resetBookLeafStyles();
        }, 280);
        return;
      }

      const shouldCommit = dir === 'next'
        ? (progress > 0.22 || velocity < -0.3)
        : (progress > 0.22 || velocity > 0.3);

      finishFlipAnimation(dir, shouldCommit);
    };

    bookFlipStage.addEventListener('pointerup', handlePointerEnd);
    bookFlipStage.addEventListener('pointercancel', handlePointerEnd);
  }

  function setBookMode(mode) {
    const isRead = mode === 'read';
    if (bookWriteView) bookWriteView.classList.toggle('is-active', !isRead);
    if (bookReadView) bookReadView.classList.toggle('is-active', isRead);
    if (btnBookWriteTab) btnBookWriteTab.classList.toggle('is-active', !isRead);
    if (btnBookReadTab) btnBookReadTab.classList.toggle('is-active', isRead);
    if (isRead) {
      requestAnimationFrame(() => {
        if (guestbookEntries.length > 0) {
          renderGuestbookPage(currentBookPage);
        }
        loadGuestbook();
      });
    }
  }

  if (btnBookWriteTab) btnBookWriteTab.addEventListener('click', () => setBookMode('write'));
  if (btnBookReadTab) btnBookReadTab.addEventListener('click', () => setBookMode('read'));
  if (btnGoToReadSignatures) btnGoToReadSignatures.addEventListener('click', () => setBookMode('read'));
  if (btnBackToWrite) btnBackToWrite.addEventListener('click', () => setBookMode('write'));

  if (btnBookPrevPage) {
    btnBookPrevPage.addEventListener('click', () => triggerBookFlip('prev'));
  }
  if (btnBookNextPage) {
    btnBookNextPage.addEventListener('click', () => triggerBookFlip('next'));
  }
  if (bookPageCurl) {
    bookPageCurl.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerBookFlip('next');
    });
  }

  // Recalcular 3 o 4 firmas por hoja si cambia el tamaño/orientación de la pantalla
  let bookResizeTimer = null;
  window.addEventListener('resize', () => {
    if (!bookFlipStage || !bookReadView || !bookReadView.classList.contains('is-active')) return;
    clearTimeout(bookResizeTimer);
    bookResizeTimer = setTimeout(() => {
      if (!bookIsFlipping) {
        renderGuestbookPage(currentBookPage);
      }
    }, 150);
  });

  async function loadGuestbook() {
    if (!bookFrontContent) return;
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
        showToast('Por favor escribe tu nombre y tu dedicatoria.', 'warning', 'Completa tu firma');
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
          showToast('¡Tu firma ha quedado guardada en el libro!', 'success', '¡Gracias por firmar!');
          if (guestbookMsgInput) guestbookMsgInput.value = '';
          if (data.entry) {
            guestbookEntries = [data.entry, ...guestbookEntries.filter((x) => Number(x.id) !== Number(data.entry.id))];
          }
          currentBookPage = 1;
          setBookMode('read');
        } else {
          showToast(data.error || 'No se pudo guardar tu firma.', 'error', 'No se pudo guardar');
        }
      } catch (err) {
        showToast('Error de conexión al enviar tu firma.', 'error', 'Sin conexión');
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
  initBookTouchFlip();
  checkGuestSession();

  if (galleryGrid) loadGallery(false);
  if (bookFrontContent) loadGuestbook();
})();
