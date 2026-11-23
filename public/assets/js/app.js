/**
 * BODA MICHELLE & RENÉ — PWA App Móvil & Escritorio para Invitados
 * Portada con Slideshow Tenue + Pétalos, Navegación Hamburguesa con Cámara Destacada,
 * Cámara en Vivo Multi-Captura (Foto/Video/Galería, < 25 recuerdos),
 * Gestión de Recuerdos, Galería Animada y Libro de Firmas tipo Libro.
 */

(function () {
  'use strict';

  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB para foto optimizada
  const MAX_THUMB_SIZE = 1 * 1024 * 1024; // 1 MB para thumbnail
  const MAX_VIDEO_SIZE = 30 * 1024 * 1024; // 30 MB máximo por video
  const MAX_VIDEO_DURATION = 20; // 20 segundos máximo por video
  const MAX_ITEMS = 24; // Máximo 24 recuerdos publicados por invitado
  const MAX_VIDEOS = 4; // Máximo 4 videos publicados dentro de los 24 recuerdos
  const GALLERY_PAGE_SIZE = 24; // Recuerdos por página en /galeria
  const SIGNATURE_FONTS = ['ballet', 'lavishly_yours', 'tangerine', 'annie_use_your_telescope', 'indie_flower', 'oooh_baby', 'italianno'];
  const UPLOAD_DEADLINE_FALLBACK = '2026-12-21T23:59:59-06:00';
  const UPLOAD_CLOSED_MSG = 'El periodo para subir fotos y videos cerró el 21 de diciembre de 2026. ¡Gracias por compartir tus recuerdos!';
  const STANDBY_DB_NAME = 'boda_mr_standby_db';
  const STANDBY_DB_VERSION = 1;
  const STANDBY_COOKIE_NAME = 'mr_standby_sid';

  let serverUploadsClosed = Boolean(document.body && document.body.dataset.uploadsClosed === '1');
  let uploadDeadlineMs = Date.parse((document.body && document.body.dataset.uploadDeadline) || UPLOAD_DEADLINE_FALLBACK);

  let currentGuest = null;
  let currentFilter = 'all';
  let allMediaCache = [];
  let myMediaCache = [];
  let standbyDb = null;
  let standbyItems = []; // [{ id, file, name, mimeType, type, size, duration, previewBlob, selected, createdAt, thumbUrl, fullUrl }]
  let isPublishingStandby = false;
  let pendingPublishStandby = false;
  let galleryCurrentPage = 0;
  let galleryTotal = 0;
  let galleryHasMore = false;
  let galleryIsLoading = false;
  let galleryRequestVersion = 0;
  let galleryLoadedItemIds = new Set();
  let galleryObserver = null;
  let galleryLastGuestToken = null;
  let galleryActiveLoadPromise = null;
  let guestbookEntries = [];
  let celebratingSignatureId = null;
  let signatureCelebrationTimer = null;
  let currentBookPage = 1;
  let currentBookPageSize = 5;
  let bookPageFlipInstance = null;
  let bookIsFlipping = false;
  let lastMountedBookKey = '';
  let lastFlipCommitTs = 0;
  let lastFlipEndTs = 0;
  let bookLastDragDx = 0;
  const BOOK_FLIP_SETTLE_MS = 120;

  // Estado de Captura con Cámara Nativa del Teléfono
  let sessionCaptureIds = []; // IDs en standbyItems capturados durante la sesión actual de cámara/video
  let sessionCaptureMode = 'photo'; // 'photo' | 'video'

  // Acciones pendientes tras identificar invitado
  let pendingFilesBatch = null;
  let pendingReviewPublishIds = null;
  let pendingGalleryPublishFiles = null;
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
  const quotaSelectedFill = document.getElementById('quotaSelectedFill');
  const uploadClosedBanner = document.getElementById('uploadClosedBanner');
  const cameraOptionsGrid = document.getElementById('cameraOptionsGrid');

  const btnLivePhotoCamera = document.getElementById('btnLivePhotoCamera');
  const btnLiveVideoCamera = document.getElementById('btnLiveVideoCamera');
  const btnUploadFromDevice = document.getElementById('btnUploadFromDevice');
  const inputNativePhotoCamera = document.getElementById('inputNativePhotoCamera');
  const inputNativeVideoCamera = document.getElementById('inputNativeVideoCamera');
  const inputUploadDevice = document.getElementById('inputUploadDevice');

  const standbySection = document.getElementById('standbySection');
  const standbyTotalBadge = document.getElementById('standbyTotalBadge');
  const standbyToolbar = document.getElementById('standbyToolbar');
  const standbySelectionSummary = document.getElementById('standbySelectionSummary');
  const btnStandbyAutoSelect = document.getElementById('btnStandbyAutoSelect');
  const btnStandbyDeselectAll = document.getElementById('btnStandbyDeselectAll');
  const btnStandbyClearAll = document.getElementById('btnStandbyClearAll');
  const btnPublishStandby = document.getElementById('btnPublishStandby');
  const btnPublishStandbyLabel = document.getElementById('btnPublishStandbyLabel');
  const btnPublishStandbyCount = document.getElementById('btnPublishStandbyCount');
  const standbyGrid = document.getElementById('standbyGrid');
  const standbyEmpty = document.getElementById('standbyEmpty');

  const captureReviewModal = document.getElementById('captureReviewModal');
  const captureReviewTitle = document.getElementById('captureReviewTitle');
  const captureReviewSubtitle = document.getElementById('captureReviewSubtitle');
  const captureReviewToolbar = document.getElementById('captureReviewToolbar');
  const captureReviewCountText = document.getElementById('captureReviewCountText');
  const captureReviewGrid = document.getElementById('captureReviewGrid');
  const captureReviewEmpty = document.getElementById('captureReviewEmpty');
  const btnReviewCancelTop = document.getElementById('btnReviewCancelTop');
  const btnReviewSelectAll = document.getElementById('btnReviewSelectAll');
  const btnReviewDeselectAll = document.getElementById('btnReviewDeselectAll');
  const btnReviewEmptyRetake = document.getElementById('btnReviewEmptyRetake');
  const btnReviewCaptureMore = document.getElementById('btnReviewCaptureMore');
  const btnReviewCaptureMoreLabel = document.getElementById('btnReviewCaptureMoreLabel');
  const btnReviewSaveLater = document.getElementById('btnReviewSaveLater');
  const btnReviewPublishNow = document.getElementById('btnReviewPublishNow');
  const btnReviewPublishLabel = document.getElementById('btnReviewPublishLabel');

  const uploadProgress = document.getElementById('uploadProgress');
  const progressBarFill = document.getElementById('progressBarFill');
  const progressText = document.getElementById('progressText');

  const myUploadsGrid = document.getElementById('myUploadsGrid');
  const myUploadsEmpty = document.getElementById('myUploadsEmpty');
  const btnRefreshMyUploads = document.getElementById('btnRefreshMyUploads');

  const galleryGrid = document.getElementById('galleryGrid');
  const galleryEmpty = document.getElementById('galleryEmpty');
  const galleryLoadingState = document.getElementById('gallery-loading-state');
  let galleryPaginationFooter = document.getElementById('galleryPaginationFooter');
  let galleryLoadMoreIndicator = document.getElementById('galleryLoadMoreIndicator');
  let btnLoadMoreGallery = document.getElementById('btnLoadMoreGallery');
  let gallerySentinel = document.getElementById('gallerySentinel');
  const galleryTabs = document.querySelectorAll('.tab-btn');
  const btnRefreshGallery = document.getElementById('btnRefreshGallery');

  const guestbookForm = document.getElementById('guestbookForm');
  const guestbookAuthorInput = document.getElementById('gbAuthor');
  const guestbookMsgInput = document.getElementById('gbMessage');
  const btnBookWriteTab = document.getElementById('btnBookWriteTab');
  const btnBookReadTab = document.getElementById('btnBookReadTab');
  const btnGoToReadSignatures = document.getElementById('btnGoToReadSignatures');
  const bookWriteView = document.getElementById('bookWriteView');
  const bookReadView = document.getElementById('bookReadView');
  const gbBookCountPill = document.getElementById('gbBookCountPill');
  const bookFlipStage = document.getElementById('bookFlipStage');
  const bookPagesStack = document.getElementById('bookPagesStack');
  const bookFlipHostWrap = document.getElementById('bookFlipHostWrap');
  const bookSigModal = document.getElementById('bookSigModal');
  const bookSigModalClose = document.getElementById('bookSigModalClose');
  const bookSigModalBody = document.getElementById('bookSigModalBody');
  const bookSigningOverlay = document.getElementById('bookSigningOverlay');
  const bookSigningPath = document.getElementById('bookSigningPath');
  const bookSigningPen = document.getElementById('bookSigningPen');
  const bookSigningInkDot = document.getElementById('bookSigningInkDot');
  const bookSigningAuthorLabel = document.getElementById('bookSigningAuthorLabel');

  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxMediaContainer = document.getElementById('lightboxMediaContainer');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxVideo = document.getElementById('lightboxVideo');
  const lightboxHeartBurst = document.getElementById('lightboxHeartBurst');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const lightboxAvatar = document.getElementById('lightboxAvatar');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const lightboxAuthor = document.getElementById('lightboxAuthor');
  const lightboxTime = document.getElementById('lightboxTime');
  const lightboxLikeBtn = document.getElementById('lightboxLikeBtn');
  const lightboxLikesWrap = document.getElementById('lightboxLikesWrap');
  const lightboxLikeCount = document.getElementById('lightboxLikeCount');
  const lightboxLikesLabel = document.getElementById('lightboxLikesLabel');
  const lightboxStandbySelectBtn = document.getElementById('lightboxStandbySelectBtn');
  const lightboxStandbySelectLabel = document.getElementById('lightboxStandbySelectLabel');
  const lightboxDownloadBtn = document.getElementById('lightboxDownloadBtn');
  const lightboxDeleteBtn = document.getElementById('lightboxDeleteBtn');
  let currentLightboxItems = [];
  let currentLightboxIndex = 0;
  let currentLightboxSource = null;

  const toastContainer = document.getElementById('toastContainer');
  const orientationLockOverlay = document.getElementById('orientationLockOverlay');
  const appConfirmModal = document.getElementById('appConfirmModal');
  const appConfirmDialog = document.getElementById('appConfirmDialog');
  const appConfirmIcon = document.getElementById('appConfirmIcon');
  const appConfirmTitle = document.getElementById('appConfirmTitle');
  const appConfirmMsg = document.getElementById('appConfirmMsg');
  const appConfirmCancel = document.getElementById('appConfirmCancel');
  const appConfirmOk = document.getElementById('appConfirmOk');

  let isLandscapeLockActive = false;
  let savedPortraitScrollY = 0;

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
  // 1. PWA SERVICE WORKER, BLOQUEO HORIZONTAL EN MÓVIL Y TRANSICIONES
  // =====================================================================
  function isLandscapeAllowedContext() {
    const lbOpen = Boolean(lightbox && lightbox.classList.contains('active'));
    const fsOpen = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
    return lbOpen || fsOpen;
  }

  function isPhoneInLandscape() {
    const isCoarsePointer = Boolean(
      (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) ||
      navigator.maxTouchPoints > 0
    );
    if (!isCoarsePointer) return false;

    const vw = window.innerWidth || document.documentElement.clientWidth || 0;
    const vh = window.innerHeight || document.documentElement.clientHeight || 0;
    if (vw <= vh) return false;

    // Evitar falsos positivos cuando el teclado virtual encoge la pantalla en vertical
    if (vw < 520) return false;

    const shortestScreenSide = Math.min(window.screen.width || vw, window.screen.height || vh);
    if (shortestScreenSide > 560 || vh > 540) return false;

    if (window.screen && window.screen.orientation && typeof window.screen.orientation.type === 'string') {
      return window.screen.orientation.type.startsWith('landscape');
    }
    if (typeof window.orientation === 'number') {
      return Math.abs(window.orientation) === 90;
    }
    return true;
  }

  function shouldFreezeLayoutForLandscape() {
    return isLandscapeLockActive || (!isLandscapeAllowedContext() && isPhoneInLandscape());
  }

  function tryLockPortraitOrientation() {
    if (isLandscapeAllowedContext()) return;
    if (window.screen && window.screen.orientation && typeof window.screen.orientation.lock === 'function') {
      window.screen.orientation.lock('portrait-primary').catch(() => {
        window.screen.orientation.lock('portrait').catch(() => {});
      });
    }
  }

  function tryUnlockOrientation() {
    if (window.screen && window.screen.orientation && typeof window.screen.orientation.unlock === 'function') {
      try {
        window.screen.orientation.unlock();
      } catch (e) {}
    }
  }

  function syncOrientationLock() {
    const allowed = isLandscapeAllowedContext();
    document.documentElement.classList.toggle('allow-landscape-mode', allowed);

    const shouldLock = !allowed && isPhoneInLandscape();
    const wasLocked = isLandscapeLockActive;
    isLandscapeLockActive = shouldLock;

    document.documentElement.classList.toggle('is-landscape-locked', shouldLock);
    if (orientationLockOverlay) {
      orientationLockOverlay.setAttribute('aria-hidden', shouldLock ? 'false' : 'true');
    }

    if (shouldLock && !wasLocked) {
      savedPortraitScrollY = window.scrollY || window.pageYOffset || 0;
    } else if (!shouldLock && wasLocked) {
      setTimeout(() => {
        syncAppViewportHeight();
        if (!document.documentElement.classList.contains('home-no-scroll')) {
          window.scrollTo(0, savedPortraitScrollY);
        }
        window.dispatchEvent(new CustomEvent('boda:portrait-restored'));
      }, 90);
    }
  }

  function updateLandscapeAllowance() {
    if (isLandscapeAllowedContext()) {
      tryUnlockOrientation();
    } else {
      tryLockPortraitOrientation();
    }
    syncOrientationLock();
  }

  function isPwaStandalone() {
    return Boolean(
      (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
      window.navigator.standalone === true
    );
  }

  function syncAppViewportHeight() {
    if (shouldFreezeLayoutForLandscape()) return;
    const standalone = isPwaStandalone();
    document.documentElement.classList.toggle('is-pwa-standalone', standalone);
    const vvH = (window.visualViewport && window.visualViewport.height)
      ? Math.round(window.visualViewport.height)
      : 0;
    const h = standalone
      ? Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0, vvH)
      : (vvH || window.innerHeight);
    if (h > 0) {
      document.documentElement.style.setProperty('--app-height', `${h}px`);
    }
  }

  function initPWA() {
    document.documentElement.classList.toggle('is-pwa-standalone', isPwaStandalone());
    syncOrientationLock();
    tryLockPortraitOrientation();
    syncAppViewportHeight();

    const handleViewportUpdate = () => {
      syncOrientationLock();
      syncAppViewportHeight();
    };

    window.addEventListener('resize', handleViewportUpdate);
    window.addEventListener('pageshow', handleViewportUpdate);
    window.addEventListener('orientationchange', () => {
      syncOrientationLock();
      setTimeout(handleViewportUpdate, 120);
    });
    if (window.screen && window.screen.orientation && typeof window.screen.orientation.addEventListener === 'function') {
      window.screen.orientation.addEventListener('change', () => {
        syncOrientationLock();
        setTimeout(handleViewportUpdate, 100);
      });
    }
    document.addEventListener('fullscreenchange', updateLandscapeAllowance);
    document.addEventListener('webkitfullscreenchange', updateLandscapeAllowance);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportUpdate);
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
      setProgress(progress + (progress < 75 ? 30 : 18));
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(dismissPreloader, 80);
      }
    }, 55);

    setTimeout(dismissPreloader, 500);
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
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    // Valores predeterminados de petalos_preview.html, sin los controles de demostracion.
    const config = () => ({ count: 36, opacity: .70, wind: .60, speed: 1 });
    const range = (a, b) => a + Math.random() * (b - a);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let w=1,h=1,dpr=1,particles=[],running=false,raf=null,last=0,elapsed=0;
  function seed(top=false){
   const z=Math.pow(Math.random(),.75);
   return {x:range(-30,w+30),y:top?range(-h,0):range(-25,h+25),z,base:range(4.6,10.8)*(0.65+z*.9),
     fall:range(16,42)*(0.65+z*.8),drift:range(-9,9),swing:range(10,37),frequency:range(.28,.78),
     phase:range(0,Math.PI*2),spin:range(.75,2.4)*(Math.random()<.5?-1:1),tilt:range(-.9,.9),
     turn:range(0,Math.PI*2),alpha:range(.37,.82),hue:range(-1,1),focal:z>.84&&Math.random()<.62?range(.8,2):0};
  }
  function fit(){
   if (shouldFreezeLayoutForLandscape()) return;
   const r=canvas.getBoundingClientRect();const ow=w,oh=h;w=Math.max(1,r.width);h=Math.max(1,r.height);
   dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
   particles.forEach(p=>{p.x=p.x*w/Math.max(1,ow);p.y=p.y*h/Math.max(1,oh)});
  }
  const targetCount=()=>Math.round(config().count*(w<600?.72:1));
  function adjust(){let n=targetCount();while(particles.length<n)particles.push(seed());if(particles.length>n)particles.length=n;}
  function paintPetal(p,t,opacity){
   const flip=Math.cos(p.turn + t*p.spin*1.35);
   const foreshorten=.22+.78*Math.abs(flip);
   const roll=Math.sin(p.turn*.68+t*p.spin*.83)*.55;
   const size=p.base*(.83+.17*Math.sin(t+p.phase));
   ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.tilt+roll);
   ctx.scale(flip<0?-foreshorten:foreshorten,1);
   const a=p.alpha*opacity*(.84+.16*Math.sin(t*1.2+p.phase));
   ctx.globalAlpha=Math.max(0,Math.min(.95,a));
   if(p.focal){ctx.shadowColor='rgba(255,194,212,.55)';ctx.shadowBlur=p.focal*6;}
   const grad=ctx.createLinearGradient(0,-size,0,size);
   grad.addColorStop(0,p.hue<-.3?'#fff0ed':'#ffe8ec');
   grad.addColorStop(.46,p.hue>.35?'#f8bacd':'#f8cbd5');
   grad.addColorStop(1,p.hue<-.3?'#d88fa4':'#e3a2b8');
   ctx.fillStyle=grad;ctx.beginPath();
   ctx.moveTo(0,-size*.92);
   ctx.bezierCurveTo(size*.42,-size*1.2,size*.91,-size*.43,size*.85,size*.09);
   ctx.bezierCurveTo(size*.76,size*.54,size*.28,size*.96,0,size*.96);
   ctx.bezierCurveTo(-size*.3,size*.97,-size*.94,size*.53,-size*.8,-size*.05);
   ctx.bezierCurveTo(-size*.68,-size*.57,-size*.27,-size*1.16,0,-size*.92);
   ctx.closePath();ctx.fill();
   ctx.shadowBlur=0;ctx.strokeStyle='rgba(183,95,133,.14)';ctx.lineWidth=.45;ctx.beginPath();
   ctx.moveTo(0,size*.72);ctx.quadraticCurveTo(size*.13,-size*.03,0,-size*.73);ctx.stroke();ctx.restore();
  }
  function frame(ts){
   if(!running)return;
   const dt=Math.min(.045,Math.max(0,(ts-(last||ts))/1000));last=ts;elapsed+=dt;
   ctx.clearRect(0,0,w,h);const c=config();
   for(let i=0;i<particles.length;i++){
    const p=particles[i];
    p.y+=p.fall*c.speed*dt;
    const gust=Math.sin(elapsed*.31+p.phase*.7)*13+Math.sin(elapsed*.79+p.phase)*5;
    p.x+=(p.drift+c.wind*(7+gust)+Math.cos(elapsed*p.frequency*2*Math.PI+p.phase)*p.swing*.73)*dt*c.speed;
    p.tilt+=Math.sin(elapsed*.34+p.phase)*.0009;
    if(p.y>h+38||p.x>w+100||p.x<-100){particles[i]=seed(true);particles[i].y=range(-55,-5);}
    paintPetal(p,elapsed,c.opacity);
   }
   raf=requestAnimationFrame(frame);
  }

    function syncPlayback() {
      cancelAnimationFrame(raf);
      raf = null;
      last = 0;
      running = !reduceMotion.matches && !document.hidden;
      if (running) raf = requestAnimationFrame(frame);
      else if (reduceMotion.matches) ctx.clearRect(0, 0, w, h);
    }
    function resizePetals() {
      fit(); adjust();
      if (!running) ctx.clearRect(0, 0, w, h);
    }
    reduceMotion.addEventListener('change', syncPlayback);
    document.addEventListener('visibilitychange', syncPlayback);
    window.addEventListener('resize', resizePetals);
    window.addEventListener('boda:portrait-restored', resizePetals);
    window.addEventListener('pagehide', () => { running = false; cancelAnimationFrame(raf); raf = null; });
    window.addEventListener('pageshow', syncPlayback);
    fit(); adjust(); syncPlayback();
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
  // 6. SESIÓN, FECHA LÍMITE DE SUBIDA Y CUPO DEL INVITADO
  // =====================================================================
  function isUploadClosed() {
    if (serverUploadsClosed) return true;
    if (Number.isFinite(uploadDeadlineMs) && Date.now() > uploadDeadlineMs) {
      return true;
    }
    return false;
  }

  function applyUploadClosedUI() {
    const closed = isUploadClosed();
    if (!closed) return;

    document.body.classList.add('is-uploads-closed');
    if (uploadClosedBanner) uploadClosedBanner.style.display = 'flex';
    if (cameraOptionsGrid) cameraOptionsGrid.style.display = 'none';
    if (standbySection) standbySection.style.display = 'none';
    if (btnLivePhotoCamera) btnLivePhotoCamera.disabled = true;
    if (btnLiveVideoCamera) btnLiveVideoCamera.disabled = true;
    if (btnUploadFromDevice) btnUploadFromDevice.disabled = true;
    if (btnPublishStandby) btnPublishStandby.disabled = true;

    document.querySelectorAll('[data-upload-cta="1"]').forEach((el) => {
      el.style.display = 'none';
    });

    if (captureReviewModal && captureReviewModal.classList.contains('is-open')) {
      closeCaptureReview({ silent: true });
    }
  }

  function syncUploadDeadlineFromApi(data) {
    if (!data || typeof data !== 'object') return;
    if (typeof data.upload_deadline === 'string' && data.upload_deadline) {
      const parsed = Date.parse(data.upload_deadline);
      if (Number.isFinite(parsed)) uploadDeadlineMs = parsed;
    }
    if (data.uploads_closed === true) {
      serverUploadsClosed = true;
    }
    applyUploadClosedUI();
  }

  function getUploadedCount() {
    return currentGuest ? Number(currentGuest.item_count || 0) : 0;
  }

  function getMaxItems() {
    return (currentGuest && currentGuest.max_items) ? Math.min(Number(currentGuest.max_items), MAX_ITEMS) : MAX_ITEMS;
  }

  function getUploadedVideoCount() {
    return currentGuest ? Number(currentGuest.video_count || 0) : 0;
  }

  function getMaxVideos() {
    return (currentGuest && currentGuest.max_videos) ? Math.min(Number(currentGuest.max_videos), MAX_VIDEOS) : MAX_VIDEOS;
  }

  function getRemainingPublishSlots() {
    return Math.max(0, getMaxItems() - getUploadedCount());
  }

  function getRemainingVideoPublishSlots() {
    return Math.min(getRemainingPublishSlots(), Math.max(0, getMaxVideos() - getUploadedVideoCount()));
  }

  function getSelectedStandbyItems() {
    return standbyItems.filter((item) => item.selected);
  }

  function getSelectedStandbyVideoCount() {
    return standbyItems.filter((item) => item.selected && item.type === 'video').length;
  }

  function updateQuotaUI() {
    const count = getUploadedCount();
    const max = getMaxItems();
    const remaining = Math.max(0, max - count);
    const vidCount = getUploadedVideoCount();
    const maxVids = getMaxVideos();
    const vidRemaining = Math.min(remaining, Math.max(0, maxVids - vidCount));
    const selectedCount = getSelectedStandbyItems().length;
    const selectedVids = getSelectedStandbyVideoCount();
    const pct = Math.min(100, Math.round((count / max) * 100));
    const selPct = Math.min(100 - pct, Math.round((selectedCount / max) * 100));

    if (guestQuotaText) {
      if (selectedCount > 0) {
        guestQuotaText.textContent = `${count} publicados + ${selectedCount} elegidos (de ${max}) · ${vidCount + selectedVids}/${maxVids} videos`;
      } else {
        guestQuotaText.textContent = `${count} de ${max} publicados · ${vidCount}/${maxVids} videos`;
      }
    }
    if (guestQuotaRemaining) {
      if (isUploadClosed()) {
        guestQuotaRemaining.textContent = 'Subidas cerradas (21 dic 2026)';
      } else if (remaining <= 0) {
        guestQuotaRemaining.textContent = 'Cupo publicado completo (elimina alguno para publicar más)';
      } else if (vidRemaining > 0) {
        guestQuotaRemaining.textContent = `Espacio para publicar: ${remaining} (máx. ${vidRemaining} ${vidRemaining === 1 ? 'video' : 'videos'})`;
      } else {
        guestQuotaRemaining.textContent = `Espacio para publicar: ${remaining} (solo fotos)`;
      }
    }
    if (quotaProgressFill) quotaProgressFill.style.width = `${pct}%`;
    if (quotaSelectedFill) {
      quotaSelectedFill.style.left = `${pct}%`;
      quotaSelectedFill.style.width = `${selPct}%`;
    }

    applyUploadClosedUI();
  }

  function getSavedGuestToken() {
    const cookie = document.cookie.split(';').map((part) => part.trim()).find((part) => part.startsWith('guest_token='));
    if (cookie) { try { return decodeURIComponent(cookie.slice(12)); } catch (error) {} }
    try { return localStorage.getItem('mr_guest_token') || ''; } catch (error) { return ''; }
  }

  async function checkGuestSession() {
    if (!guestModal) return;
    const savedToken = getSavedGuestToken();
    try {
      const res = await fetch('/api/auth/guest-me', {
        credentials: 'same-origin',
        headers: savedToken ? { 'X-Guest-Token': savedToken } : {}
      });
      const data = await res.json();
      syncUploadDeadlineFromApi(data);
      if (res.ok && data.success && data.guest) {
        setGuestSession(data.guest, { isRestore: true });
      } else if (res.status === 401) {
        try { localStorage.removeItem('mr_guest_token'); localStorage.removeItem('mr_guest_name'); } catch (error) {}
        updateQuotaUI();
        if (myUploadsGrid) renderMyUploads([]);
        promptGuestName(false);
      } else {
        updateQuotaUI();
        if (!savedToken) promptGuestName(false);
        showToast('No se pudo comprobar tu perfil. Intenta de nuevo cuando tengas conexión.', 'warning', 'Perfil pendiente');
      }
    } catch (error) {
      updateQuotaUI();
      if (!savedToken) promptGuestName(false);
      // No borrar un perfil guardado ante una falla temporal de conexion.
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
      guestModalClose.style.display = canClose ? 'grid' : 'none';
    }
    guestModal.dataset.required = canClose ? 'false' : 'true';
    guestModal.classList.add('active');
    setTimeout(() => {
      if (guestNameInput) guestNameInput.focus();
    }, 150);
  }

  function closeGuestModal() {
    if (guestModal && guestModal.dataset.required === 'true') return;
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

  function setGuestSession(guest, options = {}) {
    currentGuest = guest;
    try {
      localStorage.setItem('mr_guest_token', guest.token);
      localStorage.setItem('mr_guest_name', guest.name);
    } catch (error) {}
    if (guestModal) guestModal.dataset.required = 'false';

    if (guestModal) guestModal.classList.remove('active');
    if (guestDisplayName) guestDisplayName.textContent = guest.name;
    if (guestDisplayBadge) guestDisplayBadge.style.display = 'inline-flex';
    if (drawerGuestLabel) drawerGuestLabel.textContent = `Perfil: ${guest.name}`;
    if (bannerGuestName) bannerGuestName.textContent = guest.name;
    if (guestbookAuthorInput && !guestbookAuthorInput.value) {
      guestbookAuthorInput.value = guest.name;
    }

    reconcileStandbySelectionWithQuota();
    updateQuotaUI();
    if (standbyGrid) renderStandbyGrid();

    // Ejecutar publicación pendiente si el usuario se identificó al pulsar Publicar
    if (pendingReviewPublishIds && pendingReviewPublishIds.length > 0) {
      const ids = pendingReviewPublishIds.slice();
      pendingReviewPublishIds = null;
      const itemsToPublish = ids
        .map((id) => standbyItems.find((x) => x.id === id))
        .filter(Boolean);
      closeCaptureReview({ silent: true, clearSession: true });
      if (itemsToPublish.length > 0) {
        publishStandbyItems(itemsToPublish, { skipConfirm: true });
      }
    } else if (pendingGalleryPublishFiles && pendingGalleryPublishFiles.length > 0) {
      const files = pendingGalleryPublishFiles;
      pendingGalleryPublishFiles = null;
      publishDirectFiles(files);
    } else if (pendingPublishStandby) {
      pendingPublishStandby = false;
      publishSelectedStandby();
    } else if (pendingFilesBatch && pendingFilesBatch.length > 0) {
      const batch = pendingFilesBatch;
      pendingFilesBatch = null;
      addFilesToStandby(batch, { scrollToStandby: true });
    }

    const isRestore = Boolean(options && options.isRestore);
    if (galleryGrid && (!isRestore || galleryLastGuestToken !== guest.token || currentFilter === 'my')) {
      loadGallery(false);
    }
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

      const existingToken = getSavedGuestToken();
      try {
        const res = await fetch('/api/auth/guest-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, token: existingToken })
        });
        const data = await res.json();
        syncUploadDeadlineFromApi(data);
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
  // 7. OPTIMIZACIÓN FRONTEND (WebP 1920px + Thumb 400px) Y VALIDACIÓN VIDEO
  // =====================================================================
  let cachedWebPEncodeSupport = null;

  function supportsWebPEncoding() {
    if (cachedWebPEncodeSupport !== null) return cachedWebPEncodeSupport;
    try {
      const c = document.createElement('canvas');
      c.width = 1;
      c.height = 1;
      const dataUrl = c.toDataURL('image/webp');
      cachedWebPEncodeSupport = typeof dataUrl === 'string' && dataUrl.startsWith('data:image/webp');
    } catch (e) {
      cachedWebPEncodeSupport = false;
    }
    return cachedWebPEncodeSupport;
  }

  function getTargetImageFormat() {
    // WebP nativo en Android/Chrome/Firefox/Edge/Desktop; fallback automático a JPEG en iOS Safari
    if (supportsWebPEncoding()) {
      return { mime: 'image/webp', ext: 'webp' };
    }
    return { mime: 'image/jpeg', ext: 'jpg' };
  }

  function isVideoFile(file) {
    if (!file) return false;
    const mime = (file.type || '').toLowerCase();
    const name = file.name || '';
    return mime.startsWith('video/') || /\.(mp4|mov|webm|m4v|3gp|mkv)$/i.test(name);
  }

  function isImageFile(file) {
    if (!file) return false;
    const mime = (file.type || '').toLowerCase();
    const name = file.name || '';
    return mime.startsWith('image/') || /\.(jpe?g|png|webp|gif|bmp|heic|heif|avif)$/i.test(name);
  }

  function normalizeVideoMime(file) {
    const raw = ((file && file.type) || '').toLowerCase().split(';')[0].trim();
    if (raw === 'video/mp4' || raw === 'video/webm' || raw === 'video/quicktime') {
      return raw;
    }
    const name = ((file && file.name) || '').toLowerCase();
    if (name.endsWith('.webm')) return 'video/webm';
    if (name.endsWith('.mov')) return 'video/quicktime';
    return 'video/mp4';
  }

  function encodeImageViaCanvas(file, maxDim, quality, targetMime, targetExt, suffix = '') {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objUrl);
        const origW = img.naturalWidth || img.width || 1280;
        const origH = img.naturalHeight || img.height || 720;
        let w = origW;
        let h = origH;

        if (w > maxDim || h > maxDim) {
          const ratio = Math.min(maxDim / w, maxDim / h);
          w = Math.max(1, Math.round(w * ratio));
          h = Math.max(1, Math.round(h * ratio));
        }

        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const ctx = c.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo inicializar el lienzo para optimizar la imagen.'));
          return;
        }
        if (targetMime === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, w, h);
        }
        ctx.drawImage(img, 0, 0, w, h);

        c.toBlob((blob) => {
          if (!blob) {
            reject(new Error('No se pudo comprimir la imagen.'));
            return;
          }
          // Protección extra contra fallback silencioso de Safari a image/png
          if (targetMime === 'image/webp' && blob.type !== 'image/webp') {
            c.toBlob((jpgBlob) => {
              if (!jpgBlob) {
                reject(new Error('No se pudo codificar la imagen en JPEG.'));
                return;
              }
              const baseName = (file.name || 'foto_boda').replace(/\.[^/.]+$/, '');
              resolve(new File([jpgBlob], `${baseName}${suffix}.jpg`, { type: 'image/jpeg' }));
            }, 'image/jpeg', quality);
            return;
          }
          const finalMime = blob.type || targetMime;
          const finalExt = finalMime === 'image/webp' ? 'webp' : (finalMime === 'image/jpeg' ? 'jpg' : targetExt);
          const baseName = (file.name || 'foto_boda').replace(/\.[^/.]+$/, '');
          resolve(new File([blob], `${baseName}${suffix}.${finalExt}`, { type: finalMime }));
        }, targetMime, quality);
      };

      img.onerror = () => {
        URL.revokeObjectURL(objUrl);
        reject(new Error('No se pudo leer la imagen seleccionada.'));
      };

      img.src = objUrl;
    });
  }

  async function compressImageVariant(file, maxDim, quality, maxSizeMB, suffix = '') {
    const fmt = getTargetImageFormat();
    const baseName = (file.name || 'foto_boda').replace(/\.[^/.]+$/, '');

    if (typeof window.imageCompression === 'function') {
      const baseOptions = {
        maxWidthOrHeight: maxDim,
        initialQuality: quality,
        maxSizeMB,
        fileType: fmt.mime,
        alwaysKeepResolution: false,
        maxIteration: 6,
        libURL: '/assets/js/vendor/browser-image-compression.js'
      };

      let compressed = null;
      try {
        compressed = await window.imageCompression(file, { ...baseOptions, useWebWorker: true });
      } catch (workerErr) {
        try {
          compressed = await window.imageCompression(file, { ...baseOptions, useWebWorker: false });
        } catch (mainErr) {
          compressed = null;
        }
      }

      if (compressed && compressed.size > 0) {
        const outMime = (compressed.type || '').toLowerCase();
        // Verificar que la librería convirtió al formato objetivo (y no devolvió PNG ni el archivo original sin convertir)
        if (outMime === fmt.mime) {
          return new File([compressed], `${baseName}${suffix}.${fmt.ext}`, { type: fmt.mime });
        }
        // Si devolvió un formato distinto (p.ej. archivo pequeño sin recomprimir), forzar conversión vía canvas
        return encodeImageViaCanvas(compressed, maxDim, quality, fmt.mime, fmt.ext, suffix);
      }
    }

    return encodeImageViaCanvas(file, maxDim, quality, fmt.mime, fmt.ext, suffix);
  }

  async function processImageForUpload(file) {
    // Genera 2 archivos en el navegador:
    // 1) Optimizado principal: máx. 1920px, calidad 0.8 (WebP o JPEG en iOS Safari)
    // 2) Thumbnail: máx. 400px, calidad 0.7 (WebP o JPEG en iOS Safari)
    const mainFile = await compressImageVariant(file, 1920, 0.8, 2.5, '');
    const thumbFile = await compressImageVariant(mainFile, 400, 0.7, 0.25, '_thumb');

    if (mainFile.size > MAX_IMAGE_SIZE) {
      throw new Error(`La foto optimizada supera el máximo de ${(MAX_IMAGE_SIZE / (1024 * 1024)).toFixed(0)} MB.`);
    }
    if (thumbFile.size > MAX_THUMB_SIZE) {
      throw new Error('No se pudo generar una miniatura ligera para la foto.');
    }

    return {
      mediaType: 'image',
      mainFile,
      mimeType: mainFile.type,
      thumbFile,
      thumbMimeType: thumbFile.type,
      duration: null,
      originalName: file.name || mainFile.name
    };
  }

  function extractVideoMetadataAndThumb(file) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const objUrl = URL.createObjectURL(file);
      let settled = false;
      let timeoutId = null;

      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId);
        video.onloadedmetadata = null;
        video.onloadeddata = null;
        video.onseeked = null;
        video.onerror = null;
        try {
          video.pause();
          video.removeAttribute('src');
          video.load();
        } catch (e) {}
        URL.revokeObjectURL(objUrl);
      };

      const fail = (message) => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(new Error(message));
      };

      const finishWithFrame = (durationSec) => {
        if (settled) return;
        if (!Number.isFinite(durationSec) || durationSec <= 0) {
          fail('No se pudo leer la duración del video. Intenta con un clip en formato MP4 o MOV.');
          return;
        }
        if (durationSec > MAX_VIDEO_DURATION + 0.5) {
          fail(`El video dura ${Math.ceil(durationSec)} s y el máximo permitido es de ${MAX_VIDEO_DURATION} segundos.`);
          return;
        }

        const vw = video.videoWidth || 640;
        const vh = video.videoHeight || 360;
        const maxDim = 400;
        let cw = vw;
        let ch = vh;
        if (cw > maxDim || ch > maxDim) {
          const ratio = Math.min(maxDim / cw, maxDim / ch);
          cw = Math.max(1, Math.round(cw * ratio));
          ch = Math.max(1, Math.round(ch * ratio));
        }

        const canvas = document.createElement('canvas');
        canvas.width = cw;
        canvas.height = ch;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          fail('No se pudo generar la portada del video.');
          return;
        }

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, cw, ch);
        try {
          ctx.drawImage(video, 0, 0, cw, ch);
        } catch (drawErr) {
          fail('No se pudo capturar el primer fotograma del video.');
          return;
        }

        const fmt = getTargetImageFormat();
        const baseName = (file.name || 'video_boda').replace(/\.[^/.]+$/, '');

        const exportBlob = (mime, ext) => {
          canvas.toBlob((blob) => {
            if (settled) return;
            if (!blob) {
              fail('No se pudo convertir la portada del video.');
              return;
            }
            if (mime === 'image/webp' && blob.type !== 'image/webp') {
              exportBlob('image/jpeg', 'jpg');
              return;
            }
            settled = true;
            cleanup();
            const finalMime = blob.type || mime;
            const finalExt = finalMime === 'image/webp' ? 'webp' : 'jpg';
            const thumbFile = new File([blob], `${baseName}_thumb.${finalExt}`, { type: finalMime });
            resolve({ duration: Number(durationSec.toFixed(2)), thumbFile });
          }, mime, 0.7);
        };

        exportBlob(fmt.mime, fmt.ext);
      };

      const seekForFirstFrame = (durationSec) => {
        if (durationSec > MAX_VIDEO_DURATION + 0.5) {
          fail(`El video dura ${Math.ceil(durationSec)} s y el máximo permitido es de ${MAX_VIDEO_DURATION} segundos.`);
          return;
        }

        const targetTime = Math.min(0.1, durationSec > 0.2 ? 0.1 : 0);
        let frameCaptured = false;
        const captureOnce = () => {
          if (frameCaptured || settled) return;
          frameCaptured = true;
          finishWithFrame(durationSec);
        };

        video.onseeked = captureOnce;
        try {
          video.currentTime = targetTime;
        } catch (e) {
          captureOnce();
        }

        // Respaldo si el navegador ya tenía el fotograma en 0 y no dispara seeked
        setTimeout(() => {
          if (!frameCaptured && !settled && video.readyState >= 2) {
            captureOnce();
          }
        }, 700);
      };

      timeoutId = setTimeout(() => {
        fail('Tiempo agotado al analizar el video. Verifica que no esté dañado.');
      }, 15000);

      video.muted = true;
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.preload = 'auto';

      video.onloadedmetadata = () => {
        if (settled) return;
        const rawDur = video.duration;
        if (Number.isFinite(rawDur) && rawDur > 0) {
          seekForFirstFrame(rawDur);
          return;
        }

        // Workaround para clips WebM grabados con MediaRecorder en Chrome/Android (duration === Infinity)
        if (typeof file._recordedDuration === 'number' && file._recordedDuration > 0) {
          seekForFirstFrame(file._recordedDuration);
          return;
        }

        const onDurationResolve = () => {
          video.removeEventListener('timeupdate', onDurationResolve);
          const resolvedDur = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
          seekForFirstFrame(resolvedDur);
        };
        video.addEventListener('timeupdate', onDurationResolve);
        try {
          video.currentTime = 1e101;
        } catch (e) {
          fail('No se pudo determinar la duración del video.');
        }
      };

      video.onerror = () => {
        fail('Formato de video no compatible con tu navegador. Usa MP4, MOV o WEBM.');
      };

      video.src = objUrl;
      video.load();
    });
  }

  async function processVideoForUpload(file) {
    if (file.size > MAX_VIDEO_SIZE) {
      const mb = (file.size / (1024 * 1024)).toFixed(1);
      throw new Error(`El video pesa ${mb} MB y el máximo permitido es de 30 MB.`);
    }

    let duration;
    let thumbFile;
    try {
      const extracted = await extractVideoMetadataAndThumb(file);
      duration = extracted.duration;
      thumbFile = extracted.thumbFile;
    } catch (err) {
      if (file._recordedThumbBlob && typeof file._recordedDuration === 'number' && file._recordedDuration > 0) {
        duration = Math.min(file._recordedDuration, MAX_VIDEO_DURATION);
        thumbFile = file._recordedThumbBlob instanceof File
          ? file._recordedThumbBlob
          : new File([file._recordedThumbBlob], `thumb_${Date.now()}.jpg`, { type: file._recordedThumbBlob.type || 'image/jpeg' });
      } else {
        throw err;
      }
    }
    const mimeType = normalizeVideoMime(file);

    return {
      mediaType: 'video',
      mainFile: file,
      mimeType,
      thumbFile,
      thumbMimeType: thumbFile.type,
      duration,
      originalName: file.name || `boda_video_${Date.now()}.mp4`
    };
  }

  // =====================================================================
  // 8. CÁMARA NATIVA DEL TELÉFONO (MODO STANDBY)
  // =====================================================================
  function openNativeCamera(mode = 'photo') {
    if (isUploadClosed()) {
      showToast(UPLOAD_CLOSED_MSG, 'warning', 'Subidas cerradas');
      applyUploadClosedUI();
      return false;
    }
    const targetInput = mode === 'video' ? inputNativeVideoCamera : inputNativePhotoCamera;
    if (!targetInput) return false;
    targetInput.value = '';
    targetInput.click();
    return true;
  }

  function getSessionReviewItems() {
    return sessionCaptureIds
      .map((id) => standbyItems.find((x) => x.id === id))
      .filter(Boolean);
  }

  function getSelectedSessionItems() {
    return getSessionReviewItems().filter((x) => x.selected);
  }

  function getSelectedSessionVideoCount() {
    return getSessionReviewItems().filter((x) => x.selected && x.type === 'video').length;
  }

  function reconcileSessionSelectionWithQuota() {
    const remainingTotal = getRemainingPublishSlots();
    const remainingVideos = getRemainingVideoPublishSlots();
    let keptTotal = 0;
    let keptVideos = 0;
    const items = getSessionReviewItems();

    items.forEach((item) => {
      if (!item.selected) return;
      if (keptTotal >= remainingTotal || (item.type === 'video' && keptVideos >= remainingVideos)) {
        item.selected = false;
        persistStandbyItem(item).catch(() => {});
      } else {
        keptTotal++;
        if (item.type === 'video') keptVideos++;
      }
    });
  }

  function openCaptureReview() {
    if (!captureReviewModal) return;
    reconcileSessionSelectionWithQuota();
    captureReviewModal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    renderCaptureReview();
  }

  function closeCaptureReview(options = {}) {
    if (!captureReviewModal) return;
    const remainingItems = getSessionReviewItems();
    const remainingCount = remainingItems.length;

    captureReviewModal.classList.remove('is-open');
    if (!options.keepBodyLocked) {
      document.body.style.overflow = '';
    }

    if (options.clearSession !== false) {
      sessionCaptureIds = [];
    }

    updateQuotaUI();
    renderStandbyGrid();

    if (!options.silent && remainingCount > 0) {
      showToast(
        remainingCount === 1
          ? 'Tu captura quedó guardada en Galería Temporal para cuando quieras publicarla.'
          : `Tus ${remainingCount} capturas quedaron guardadas en Galería Temporal para cuando quieras publicarlas.`,
        'info',
        'Guardado en temporales'
      );
    }
  }

  function toggleSessionItemSelection(id) {
    const item = standbyItems.find((x) => x.id === id);
    if (!item || isPublishingStandby) return false;

    if (item.selected) {
      item.selected = false;
      persistStandbyItem(item).catch(() => {});
      updateQuotaUI();
      renderStandbyGrid();
      renderCaptureReview();
      return true;
    }

    const remainingTotal = getRemainingPublishSlots();
    const remainingVideos = getRemainingVideoPublishSlots();
    const selectedTotal = getSelectedSessionItems().length;
    const selectedVideos = getSelectedSessionVideoCount();

    if (remainingTotal <= 0) {
      showToast(
        `Ya tienes ${getMaxItems()} recuerdos publicados. Elimina alguno en "Mis Recuerdos Publicados" si deseas subir nuevos.`,
        'warning',
        'Cupo publicado lleno'
      );
      return false;
    }

    if (selectedTotal >= remainingTotal) {
      showToast(
        `Solo puedes publicar hasta ${remainingTotal} ${remainingTotal === 1 ? 'recuerdo' : 'recuerdos'} más (máximo ${getMaxItems()} en total). Desmarca alguno para elegir este.`,
        'warning',
        'Límite de selección'
      );
      return false;
    }

    if (item.type === 'video') {
      if (remainingVideos <= 0) {
        showToast(
          `Ya tienes el máximo de ${getMaxVideos()} videos publicados. ¡Aún puedes publicar fotos!`,
          'warning',
          'Límite de videos'
        );
        return false;
      }
      if (selectedVideos >= remainingVideos) {
        showToast(
          `Solo puedes elegir hasta ${remainingVideos} ${remainingVideos === 1 ? 'video' : 'videos'} (máximo ${getMaxVideos()} en total). Desmarca otro video para elegir este.`,
          'warning',
          'Límite de videos'
        );
        return false;
      }
    }

    item.selected = true;
    persistStandbyItem(item).catch(() => {});
    updateQuotaUI();
    renderStandbyGrid();
    renderCaptureReview();
    return true;
  }

  function selectAllSessionItems() {
    if (isPublishingStandby) return;
    const items = getSessionReviewItems();
    const remainingTotal = getRemainingPublishSlots();
    const remainingVideos = getRemainingVideoPublishSlots();
    if (remainingTotal <= 0) {
      showToast(`Ya tienes ${getMaxItems()} recuerdos publicados.`, 'warning', 'Cupo lleno');
      return;
    }

    let selTotal = getSelectedSessionItems().length;
    let selVideos = getSelectedSessionVideoCount();

    items.forEach((item) => {
      if (item.selected) return;
      if (selTotal >= remainingTotal) return;
      if (item.type === 'video' && selVideos >= remainingVideos) return;
      item.selected = true;
      selTotal++;
      if (item.type === 'video') selVideos++;
      persistStandbyItem(item).catch(() => {});
    });

    updateQuotaUI();
    renderStandbyGrid();
    renderCaptureReview();
  }

  function deselectAllSessionItems() {
    if (isPublishingStandby) return;
    getSessionReviewItems().forEach((item) => {
      if (item.selected) {
        item.selected = false;
        persistStandbyItem(item).catch(() => {});
      }
    });
    updateQuotaUI();
    renderStandbyGrid();
    renderCaptureReview();
  }

  function renderCaptureReview() {
    if (!captureReviewModal || !captureReviewGrid) return;
    const items = getSessionReviewItems();
    const selectedItems = items.filter((x) => x.selected);
    const selectedCount = selectedItems.length;
    const remainingTotal = getRemainingPublishSlots();
    const remainingVideos = getRemainingVideoPublishSlots();
    const photoCount = items.filter((x) => x.type !== 'video').length;
    const videoCount = items.filter((x) => x.type === 'video').length;
    const hasMixed = photoCount > 0 && videoCount > 0;
    const isVideoOnly = videoCount > 0 && photoCount === 0;

    if (captureReviewTitle) {
      captureReviewTitle.textContent = hasMixed
        ? 'Elige qué recuerdos publicar'
        : (isVideoOnly ? 'Elige qué videos publicar' : 'Elige qué fotos publicar');
    }
    if (captureReviewSubtitle) {
      if (remainingTotal <= 0) {
        captureReviewSubtitle.textContent = `Cupo lleno (${getMaxItems()}/${getMaxItems()} publicados)`;
      } else {
        const showVidQuota = videoCount > 0 || sessionCaptureMode === 'video';
        captureReviewSubtitle.textContent = `${selectedCount} ${selectedCount === 1 ? 'seleccionado' : 'seleccionados'} · Te quedan ${remainingTotal} espacios${showVidQuota ? ` (${remainingVideos} videos)` : ''}`;
      }
    }
    if (captureReviewCountText) {
      if (hasMixed) {
        captureReviewCountText.textContent = `${photoCount} ${photoCount === 1 ? 'foto' : 'fotos'} · ${videoCount} ${videoCount === 1 ? 'video' : 'videos'} en caché`;
      } else {
        const noun = isVideoOnly ? (items.length === 1 ? 'video' : 'videos') : (items.length === 1 ? 'foto' : 'fotos');
        captureReviewCountText.textContent = `${items.length} ${noun} en caché`;
      }
    }
    if (btnReviewCaptureMoreLabel) {
      btnReviewCaptureMoreLabel.textContent = hasMixed
        ? 'Seguir capturando'
        : (sessionCaptureMode === 'video' ? 'Grabar más videos' : 'Tomar más fotos');
    }
    if (btnReviewPublishNow) {
      btnReviewPublishNow.disabled = isPublishingStandby || selectedCount === 0 || isUploadClosed();
    }
    if (btnReviewPublishLabel) {
      btnReviewPublishLabel.textContent = selectedCount > 0
        ? `Publicar ahora (${selectedCount})`
        : 'Selecciona al menos uno para publicar';
    }

    captureReviewGrid.innerHTML = '';

    if (items.length === 0) {
      if (captureReviewToolbar) captureReviewToolbar.style.display = 'none';
      if (captureReviewEmpty) captureReviewEmpty.style.display = 'flex';
      return;
    }

    if (captureReviewToolbar) captureReviewToolbar.style.display = 'flex';
    if (captureReviewEmpty) captureReviewEmpty.style.display = 'none';

    items.forEach((item, index) => {
      const tile = document.createElement('div');
      const isSelected = Boolean(item.selected);
      const isVideo = item.type === 'video';
      const durLabel = isVideo && item.duration ? ` · ${Math.round(item.duration)}s` : '';

      tile.className = `standby-tile${isSelected ? ' is-selected' : ''}`;
      tile.setAttribute('role', 'button');
      tile.setAttribute('aria-pressed', isSelected ? 'true' : 'false');

      tile.innerHTML = `
        ${item.thumbUrl
          ? `<img src="${escapeHtml(item.thumbUrl)}" alt="${escapeHtml(item.name)}" loading="lazy" decoding="async" />`
          : `<video muted playsinline preload="metadata"></video>`
        }
        <span class="standby-select-badge" aria-hidden="true">${isSelected ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 4 4L19 6"/></svg>' : ''}</span>
        <button type="button" class="standby-delete-btn" title="Eliminar del caché" aria-label="Eliminar del caché">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
        ${isVideo ? `<span class="standby-vid-pill">VID${escapeHtml(durLabel)}</span>` : ''}
        <button type="button" class="standby-preview-btn" title="Ver en pantalla completa" aria-label="Ver en pantalla completa">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
        </button>
      `;

      if (!item.thumbUrl && isVideo) {
        const vEl = tile.querySelector('video');
        if (vEl) {
          if (!item.fullUrl) item.fullUrl = URL.createObjectURL(item.file);
          vEl.src = item.fullUrl;
        }
      }

      tile.addEventListener('click', (e) => {
        if (e.target.closest('.standby-delete-btn')) {
          e.stopPropagation();
          deleteStandbyItem(item.id, { skipConfirm: true, silent: true });
          showToast('Eliminada del caché.', 'info', 'Eliminada');
          return;
        }
        if (e.target.closest('.standby-preview-btn')) {
          e.stopPropagation();
          openLightboxAtIndex(index, items, 'standby');
          return;
        }
        toggleSessionItemSelection(item.id);
      });

      captureReviewGrid.appendChild(tile);
    });
  }

  // Listeners de los 3 botones principales en /camara (cámara nativa del teléfono y galería)
  if (btnLivePhotoCamera) {
    btnLivePhotoCamera.addEventListener('click', () => {
      if (isUploadClosed()) {
        showToast(UPLOAD_CLOSED_MSG, 'warning', 'Subidas cerradas');
        applyUploadClosedUI();
        return;
      }
      sessionCaptureIds = [];
      sessionCaptureMode = 'photo';
      openNativeCamera('photo');
    });
  }
  if (btnLiveVideoCamera) {
    btnLiveVideoCamera.addEventListener('click', () => {
      if (isUploadClosed()) {
        showToast(UPLOAD_CLOSED_MSG, 'warning', 'Subidas cerradas');
        applyUploadClosedUI();
        return;
      }
      sessionCaptureIds = [];
      sessionCaptureMode = 'video';
      openNativeCamera('video');
    });
  }

  // Captura directa desde cámara nativa del teléfono (foto y video) -> guarda en caché de sesión y abre selección
  [inputNativePhotoCamera, inputNativeVideoCamera].forEach((nativeInput) => {
    if (!nativeInput) return;
    nativeInput.addEventListener('change', async () => {
      const files = Array.from(nativeInput.files || []);
      nativeInput.value = '';
      if (files.length === 0) return;

      sessionCaptureMode = nativeInput === inputNativeVideoCamera ? 'video' : 'photo';
      const { addedItems, errors } = await addFilesToStandby(files, { silent: true });
      if (errors.length > 0) {
        showToast(errors[0], 'warning', 'Algunos archivos no se agregaron');
      }
      addedItems.forEach((item) => {
        if (!sessionCaptureIds.includes(item.id)) {
          sessionCaptureIds.push(item.id);
        }
      });
      if (sessionCaptureIds.length > 0) {
        openCaptureReview();
      }
    });
  });

  if (btnUploadFromDevice && inputUploadDevice) {
    btnUploadFromDevice.addEventListener('click', () => {
      if (isUploadClosed()) {
        showToast(UPLOAD_CLOSED_MSG, 'warning', 'Subidas cerradas');
        applyUploadClosedUI();
        return;
      }
      inputUploadDevice.click();
    });

    // Subir desde galería del teléfono -> publicación directa sin caché temporal
    inputUploadDevice.addEventListener('change', () => {
      const files = Array.from(inputUploadDevice.files || []);
      inputUploadDevice.value = '';
      if (files.length > 0) {
        publishDirectFiles(files);
      }
    });
  }

  // Controles del modal de selección post-captura
  function reopenCameraFromReview() {
    closeCaptureReview({ silent: true, clearSession: false, keepBodyLocked: false });
    openNativeCamera(sessionCaptureMode);
  }

  if (btnReviewCancelTop) {
    btnReviewCancelTop.addEventListener('click', () => closeCaptureReview());
  }
  if (btnReviewSaveLater) {
    btnReviewSaveLater.addEventListener('click', () => closeCaptureReview());
  }
  if (btnReviewCaptureMore) {
    btnReviewCaptureMore.addEventListener('click', reopenCameraFromReview);
  }
  if (btnReviewEmptyRetake) {
    btnReviewEmptyRetake.addEventListener('click', reopenCameraFromReview);
  }
  if (btnReviewSelectAll) {
    btnReviewSelectAll.addEventListener('click', selectAllSessionItems);
  }
  if (btnReviewDeselectAll) {
    btnReviewDeselectAll.addEventListener('click', deselectAllSessionItems);
  }
  if (btnReviewPublishNow) {
    btnReviewPublishNow.addEventListener('click', () => {
      if (isPublishingStandby) return;
      if (isUploadClosed()) {
        showToast(UPLOAD_CLOSED_MSG, 'warning', 'Subidas cerradas');
        applyUploadClosedUI();
        return;
      }

      reconcileSessionSelectionWithQuota();
      const selected = getSelectedSessionItems();
      if (selected.length === 0) {
        showToast('Selecciona al menos una foto o video para publicar.', 'warning', 'Nada seleccionado');
        return;
      }

      if (!currentGuest) {
        pendingReviewPublishIds = selected.map((x) => x.id);
        promptGuestName(true);
        showToast('Escribe tu nombre para publicar tus recuerdos al instante.', 'info', 'Identifícate');
        return;
      }

      closeCaptureReview({ silent: true, clearSession: true });
      publishStandbyItems(selected, { skipConfirm: true });
    });
  }

  // =====================================================================
  // 8B. CARRETE TEMPORAL EN ESPERA (INDEXEDDB + VINCULACIÓN A COOKIES)
  // =====================================================================
  function getCookieValue(name) {
    const encodedName = `${encodeURIComponent(name)}=`;
    const parts = (document.cookie || '').split(';');
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      if (part.indexOf(encodedName) === 0) {
        return decodeURIComponent(part.slice(encodedName.length));
      }
    }
    return '';
  }

  function setCookieValue(name, value, days = 30) {
    try {
      const expires = new Date(Date.now() + days * 86400 * 1000).toUTCString();
      document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
    } catch (e) {}
  }

  function openStandbyDB() {
    if (standbyDb) return Promise.resolve(standbyDb);
    if (typeof window.indexedDB === 'undefined') {
      return Promise.resolve(null);
    }
    return new Promise((resolve) => {
      try {
        const req = window.indexedDB.open(STANDBY_DB_NAME, STANDBY_DB_VERSION);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains('drafts')) {
            db.createObjectStore('drafts', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('meta')) {
            db.createObjectStore('meta', { keyPath: 'key' });
          }
        };
        req.onsuccess = (e) => {
          standbyDb = e.target.result;
          resolve(standbyDb);
        };
        req.onerror = () => resolve(null);
      } catch (err) {
        resolve(null);
      }
    });
  }

  function idbRequest(storeName, mode, operation) {
    return openStandbyDB().then((db) => {
      if (!db) return null;
      return new Promise((resolve) => {
        try {
          const tx = db.transaction(storeName, mode);
          const store = tx.objectStore(storeName);
          const req = operation(store);
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => resolve(null);
        } catch (err) {
          resolve(null);
        }
      });
    });
  }

  async function ensureStandbyCookieSession() {
    let sid = getCookieValue(STANDBY_COOKIE_NAME);
    if (!sid) {
      sid = `sid_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      setCookieValue(STANDBY_COOKIE_NAME, sid, 30);
    }
    const verified = getCookieValue(STANDBY_COOKIE_NAME) === sid;
    await idbRequest('meta', 'readwrite', (s) => s.put({ key: 'session', sid, cookieBound: verified }));
  }

  function toSerializableDraft(item) {
    return {
      id: item.id,
      file: item.file,
      name: item.name,
      mimeType: item.mimeType,
      type: item.type,
      size: item.size,
      duration: item.duration,
      previewBlob: item.previewBlob || null,
      selected: Boolean(item.selected),
      createdAt: item.createdAt
    };
  }

  async function persistStandbyItem(item) {
    await ensureStandbyCookieSession();
    await idbRequest('drafts', 'readwrite', (s) => s.put(toSerializableDraft(item)));
  }

  async function removeStandbyRecordFromDB(id) {
    await idbRequest('drafts', 'readwrite', (s) => s.delete(id));
  }

  async function clearStandbyDB() {
    await idbRequest('drafts', 'readwrite', (s) => s.clear());
  }

  function revokeStandbyItemUrls(item) {
    if (!item) return;
    if (item.thumbUrl) {
      try { URL.revokeObjectURL(item.thumbUrl); } catch (e) {}
      item.thumbUrl = '';
    }
    if (item.fullUrl) {
      try { URL.revokeObjectURL(item.fullUrl); } catch (e) {}
      item.fullUrl = '';
    }
  }

  function createLightImagePreviewBlob(file) {
    return new Promise((resolve) => {
      const img = new Image();
      const objUrl = URL.createObjectURL(file);
      const cleanup = () => {
        try { URL.revokeObjectURL(objUrl); } catch (e) {}
      };
      img.onload = () => {
        cleanup();
        try {
          const maxDim = 320;
          let w = img.naturalWidth || img.width || 320;
          let h = img.naturalHeight || img.height || 320;
          if (w > maxDim || h > maxDim) {
            const r = Math.min(maxDim / w, maxDim / h);
            w = Math.max(1, Math.round(w * r));
            h = Math.max(1, Math.round(h * r));
          }
          const c = document.createElement('canvas');
          c.width = w;
          c.height = h;
          const ctx = c.getContext('2d');
          if (!ctx) {
            resolve(null);
            return;
          }
          ctx.drawImage(img, 0, 0, w, h);
          c.toBlob((blob) => resolve(blob || null), 'image/jpeg', 0.68);
        } catch (err) {
          resolve(null);
        }
      };
      img.onerror = () => {
        cleanup();
        resolve(null);
      };
      img.src = objUrl;
    });
  }

  async function loadStandbyFromCache() {
    if (!standbyGrid) return;
    const db = await openStandbyDB();
    if (!db) {
      renderStandbyGrid();
      return;
    }

    const sessionMeta = await idbRequest('meta', 'readonly', (s) => s.get('session'));
    const cookieSid = getCookieValue(STANDBY_COOKIE_NAME);

    // Si el usuario eliminó las cookies del navegador, limpiar también las fotos/videos en caché local
    if (sessionMeta && sessionMeta.cookieBound && (!cookieSid || cookieSid !== sessionMeta.sid)) {
      await clearStandbyDB();
      await idbRequest('meta', 'readwrite', (s) => s.delete('session'));
      standbyItems = [];
      updateQuotaUI();
      renderStandbyGrid();
      return;
    }

    const records = await idbRequest('drafts', 'readonly', (s) => s.getAll());
    standbyItems.forEach(revokeStandbyItemUrls);
    standbyItems = [];

    if (Array.isArray(records) && records.length > 0) {
      records.sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
      standbyItems = records
        .filter((rec) => rec && rec.id && rec.file)
        .map((rec) => {
          const thumbSource = rec.previewBlob || (rec.type === 'image' ? rec.file : null);
          return {
            id: String(rec.id),
            file: rec.file,
            name: rec.name || 'recuerdo',
            mimeType: rec.mimeType || (rec.file && rec.file.type) || '',
            type: rec.type === 'video' ? 'video' : 'image',
            size: Number(rec.size || (rec.file && rec.file.size) || 0),
            duration: typeof rec.duration === 'number' ? rec.duration : null,
            previewBlob: rec.previewBlob || null,
            selected: Boolean(rec.selected),
            createdAt: Number(rec.createdAt || Date.now()),
            thumbUrl: thumbSource ? URL.createObjectURL(thumbSource) : '',
            fullUrl: ''
          };
        });
    }

    reconcileStandbySelectionWithQuota();
    updateQuotaUI();
    renderStandbyGrid();
  }

  function reconcileStandbySelectionWithQuota() {
    const remainingTotal = getRemainingPublishSlots();
    const remainingVideos = getRemainingVideoPublishSlots();
    let keptTotal = 0;
    let keptVideos = 0;
    const changed = [];

    standbyItems.forEach((item) => {
      if (!item.selected) return;
      if (keptTotal >= remainingTotal || (item.type === 'video' && keptVideos >= remainingVideos)) {
        item.selected = false;
        changed.push(item);
      } else {
        keptTotal++;
        if (item.type === 'video') keptVideos++;
      }
    });

    changed.forEach((item) => {
      persistStandbyItem(item).catch(() => {});
    });
  }

  async function addFilesToStandby(rawFiles, options = {}) {
    const files = Array.from(rawFiles || []);
    if (files.length === 0) return { addedItems: [], errors: [] };

    if (isUploadClosed()) {
      if (!options.silent) {
        showToast(UPLOAD_CLOSED_MSG, 'warning', 'Subidas cerradas');
      }
      applyUploadClosedUI();
      return { addedItems: [], errors: [UPLOAD_CLOSED_MSG] };
    }

    const addedItems = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const isVid = isVideoFile(f);
      const isImg = isImageFile(f);

      if (!isVid && !isImg) {
        errors.push(`${f.name || 'Archivo'}: formato no compatible.`);
        continue;
      }

      let duration = null;
      let previewBlob = null;

      if (isVid) {
        if (f.size > MAX_VIDEO_SIZE) {
          const mb = (f.size / (1024 * 1024)).toFixed(1);
          errors.push(`"${f.name || 'Video'}" pesa ${mb} MB y el máximo permitido es de 30 MB.`);
          continue;
        }
        if (f._recordedThumbBlob && typeof f._recordedDuration === 'number' && f._recordedDuration > 0) {
          duration = Math.min(f._recordedDuration, MAX_VIDEO_DURATION);
          previewBlob = f._recordedThumbBlob;
        } else {
          try {
            const meta = await extractVideoMetadataAndThumb(f);
            duration = meta.duration;
            previewBlob = meta.thumbFile;
          } catch (vidErr) {
            errors.push((vidErr && vidErr.message) || 'No se pudo validar el video seleccionado.');
            continue;
          }
        }
      } else {
        previewBlob = await createLightImagePreviewBlob(f);
      }

      // Auto-seleccionar si todavía hay espacio disponible dentro de los 24 (máx. 4 videos)
      const remainingTotal = getRemainingPublishSlots();
      const remainingVideos = getRemainingVideoPublishSlots();
      const currentSelTotal = getSelectedStandbyItems().length;
      const currentSelVideos = getSelectedStandbyVideoCount();
      const canAutoSelect =
        currentSelTotal < remainingTotal &&
        (!isVid || currentSelVideos < remainingVideos);

      const thumbSource = previewBlob || (isImg ? f : null);
      const item = {
        id: `draft_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        file: f,
        name: f.name || (isVid ? `boda_video_${Date.now()}.mp4` : `boda_foto_${Date.now()}.jpg`),
        mimeType: f.type || (isVid ? normalizeVideoMime(f) : 'image/jpeg'),
        type: isVid ? 'video' : 'image',
        size: Number(f.size || 0),
        duration,
        previewBlob,
        selected: canAutoSelect,
        createdAt: Date.now() + i,
        thumbUrl: thumbSource ? URL.createObjectURL(thumbSource) : '',
        fullUrl: ''
      };

      standbyItems.unshift(item);
      addedItems.push(item);
      await persistStandbyItem(item);
    }

    updateQuotaUI();
    renderStandbyGrid();

    if (!options.silent) {
      if (addedItems.length > 0) {
        showToast(
          addedItems.length === 1
            ? '1 recuerdo guardado en espera. Elige tus favoritos y pulsa Publicar.'
            : `${addedItems.length} recuerdos guardados en espera. Selecciona tus mejores y pulsa Publicar.`,
          'success',
          'En espera'
        );
        if (options.scrollToStandby && standbySection) {
          standbySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
      if (errors.length > 0) {
        showToast(errors[0], 'warning', 'Algunos archivos no se agregaron');
      }
    }

    return { addedItems, errors };
  }

  function toggleStandbySelection(id) {
    const item = standbyItems.find((x) => x.id === id);
    if (!item || isPublishingStandby) return false;

    if (item.selected) {
      item.selected = false;
      persistStandbyItem(item).catch(() => {});
      updateQuotaUI();
      renderStandbyGrid();
      if (captureReviewModal && captureReviewModal.classList.contains('is-open')) {
        renderCaptureReview();
      }
      return true;
    }

    const remainingTotal = getRemainingPublishSlots();
    const remainingVideos = getRemainingVideoPublishSlots();
    const selectedTotal = getSelectedStandbyItems().length;
    const selectedVideos = getSelectedStandbyVideoCount();

    if (remainingTotal <= 0) {
      showToast(
        `Ya tienes ${getMaxItems()} recuerdos publicados. Elimina alguno abajo si deseas publicar nuevos.`,
        'warning',
        'Cupo publicado lleno'
      );
      return false;
    }

    if (selectedTotal >= remainingTotal) {
      showToast(
        `Solo puedes elegir hasta ${remainingTotal} ${remainingTotal === 1 ? 'recuerdo' : 'recuerdos'} (máximo ${getMaxItems()} publicados en total). Desmarca alguno para seleccionar este.`,
        'warning',
        'Límite de selección'
      );
      return false;
    }

    if (item.type === 'video') {
      if (remainingVideos <= 0) {
        showToast(
          `Ya tienes el máximo de ${getMaxVideos()} videos publicados. ¡Aún puedes seleccionar fotos!`,
          'warning',
          'Límite de videos'
        );
        return false;
      }
      if (selectedVideos >= remainingVideos) {
        showToast(
          `Solo puedes elegir hasta ${remainingVideos} ${remainingVideos === 1 ? 'video' : 'videos'} (máximo ${getMaxVideos()} en total). Desmarca otro video para elegir este.`,
          'warning',
          'Límite de videos'
        );
        return false;
      }
    }

    item.selected = true;
    persistStandbyItem(item).catch(() => {});
    updateQuotaUI();
    renderStandbyGrid();
    if (captureReviewModal && captureReviewModal.classList.contains('is-open')) {
      renderCaptureReview();
    }
    return true;
  }

  async function deleteStandbyItem(id, options = {}) {
    const idx = standbyItems.findIndex((x) => x.id === id);
    if (idx === -1) return;

    if (!options.skipConfirm) {
      const confirmed = await showConfirmDialog({
        title: '¿Quitar de espera?',
        message: 'Esta captura se eliminará de tu carrete temporal en este dispositivo.',
        confirmText: 'Sí, quitar',
        cancelText: 'Conservar',
        variant: 'danger'
      });
      if (!confirmed) return;
    }

    const [removed] = standbyItems.splice(idx, 1);
    sessionCaptureIds = sessionCaptureIds.filter((sid) => sid !== id);
    revokeStandbyItemUrls(removed);
    await removeStandbyRecordFromDB(id);

    updateQuotaUI();
    renderStandbyGrid();
    if (captureReviewModal && captureReviewModal.classList.contains('is-open')) {
      renderCaptureReview();
    }

    if (!options.silent) {
      showToast('Captura quitada del carrete en espera.', 'info', 'Eliminada');
    }
  }

  function autoSelectStandbyItems() {
    if (isPublishingStandby || standbyItems.length === 0) return;
    const remainingTotal = getRemainingPublishSlots();
    const remainingVideos = getRemainingVideoPublishSlots();

    if (remainingTotal <= 0) {
      showToast(`Ya tienes ${getMaxItems()} recuerdos publicados. Elimina alguno abajo para liberar espacio.`, 'warning', 'Cupo lleno');
      return;
    }

    let selTotal = getSelectedStandbyItems().length;
    let selVideos = getSelectedStandbyVideoCount();
    const changed = [];

    for (let i = 0; i < standbyItems.length; i++) {
      const item = standbyItems[i];
      if (item.selected) continue;
      if (selTotal >= remainingTotal) break;
      if (item.type === 'video' && selVideos >= remainingVideos) continue;
      item.selected = true;
      selTotal++;
      if (item.type === 'video') selVideos++;
      changed.push(item);
    }

    changed.forEach((item) => persistStandbyItem(item).catch(() => {}));
    updateQuotaUI();
    renderStandbyGrid();
  }

  function deselectAllStandbyItems() {
    if (isPublishingStandby) return;
    standbyItems.forEach((item) => {
      if (item.selected) {
        item.selected = false;
        persistStandbyItem(item).catch(() => {});
      }
    });
    updateQuotaUI();
    renderStandbyGrid();
  }

  async function clearAllStandbyItems() {
    if (isPublishingStandby || standbyItems.length === 0) return;
    const confirmed = await showConfirmDialog({
      title: '¿Vaciar carrete en espera?',
      message: `Se eliminarán las ${standbyItems.length} capturas temporales guardadas en este navegador. Tus recuerdos ya publicados no se verán afectados.`,
      confirmText: 'Sí, vaciar todo',
      cancelText: 'Cancelar',
      variant: 'danger'
    });
    if (!confirmed) return;

    standbyItems.forEach(revokeStandbyItemUrls);
    standbyItems = [];
    await clearStandbyDB();
    updateQuotaUI();
    renderStandbyGrid();
    showToast('Se vació tu carrete en espera.', 'info', 'Carrete vacío');
  }

  function renderStandbyGrid() {
    if (!standbyGrid) return;
    standbyGrid.innerHTML = '';

    const total = standbyItems.length;
    const selectedItems = getSelectedStandbyItems();
    const selectedCount = selectedItems.length;
    const selectedVideos = getSelectedStandbyVideoCount();
    const remainingTotal = getRemainingPublishSlots();
    const remainingVideos = getRemainingVideoPublishSlots();

    if (standbyTotalBadge) {
      standbyTotalBadge.textContent = `${total} ${total === 1 ? 'guardado' : 'guardados'}`;
    }

    if (total === 0) {
      if (standbyEmpty) standbyEmpty.style.display = 'block';
      if (standbyToolbar) standbyToolbar.style.display = 'none';
      return;
    }

    if (standbyEmpty) standbyEmpty.style.display = 'none';
    if (standbyToolbar) standbyToolbar.style.display = 'flex';

    if (standbySelectionSummary) {
      if (remainingTotal <= 0) {
        standbySelectionSummary.textContent = `Cupo lleno (${getMaxItems()}/${getMaxItems()} publicados)`;
      } else {
        standbySelectionSummary.textContent = `${selectedCount} de ${remainingTotal} elegidos · ${selectedVideos}/${remainingVideos} videos`;
      }
    }

    if (btnPublishStandby) {
      btnPublishStandby.disabled = isPublishingStandby || selectedCount === 0 || isUploadClosed();
    }
    if (btnPublishStandbyCount) {
      btnPublishStandbyCount.textContent = String(selectedCount);
    }
    if (btnPublishStandbyLabel) {
      btnPublishStandbyLabel.textContent = isPublishingStandby
        ? 'Publicando...'
        : (selectedCount === 1 ? 'Publicar recuerdo' : 'Publicar seleccionados');
    }

    // Asignar número de orden a los elementos seleccionados
    standbyItems.forEach((item, index) => {
      const tile = document.createElement('div');
      const isSelected = Boolean(item.selected);
      tile.className = `standby-tile${isSelected ? ' is-selected' : ''}`;
      tile.style.animationDelay = `${Math.min(index * 28, 280)}ms`;
      tile.setAttribute('role', 'button');
      tile.setAttribute('aria-pressed', isSelected ? 'true' : 'false');

      const isVideo = item.type === 'video';
      const durLabel = isVideo && item.duration ? ` · ${Math.round(item.duration)}s` : '';

      tile.innerHTML = `
        ${item.thumbUrl
          ? `<img src="${escapeHtml(item.thumbUrl)}" alt="${escapeHtml(item.name)}" loading="lazy" decoding="async" />`
          : `<video muted playsinline preload="metadata"></video>`
        }
        <span class="standby-select-badge" aria-hidden="true">${isSelected ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 4 4L19 6"/></svg>' : ''}</span>
        <button type="button" class="standby-delete-btn" title="Quitar de espera" aria-label="Quitar captura">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
        ${isVideo ? `<span class="standby-vid-pill">VID${escapeHtml(durLabel)}</span>` : ''}
        <button type="button" class="standby-preview-btn" title="Ver en pantalla completa" aria-label="Ver en pantalla completa">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
        </button>
      `;

      if (!item.thumbUrl && isVideo) {
        const vEl = tile.querySelector('video');
        if (vEl) {
          if (!item.fullUrl) item.fullUrl = URL.createObjectURL(item.file);
          vEl.src = item.fullUrl;
        }
      }

      tile.addEventListener('click', (e) => {
        if (e.target.closest('.standby-delete-btn')) {
          e.stopPropagation();
          deleteStandbyItem(item.id);
          return;
        }
        if (e.target.closest('.standby-preview-btn')) {
          e.stopPropagation();
          openLightboxAtIndex(index, standbyItems, 'standby');
          return;
        }
        toggleStandbySelection(item.id);
      });

      standbyGrid.appendChild(tile);
    });
  }

  if (btnStandbyAutoSelect) {
    btnStandbyAutoSelect.addEventListener('click', autoSelectStandbyItems);
  }
  if (btnStandbyDeselectAll) {
    btnStandbyDeselectAll.addEventListener('click', deselectAllStandbyItems);
  }
  if (btnStandbyClearAll) {
    btnStandbyClearAll.addEventListener('click', clearAllStandbyItems);
  }
  if (btnPublishStandby) {
    btnPublishStandby.addEventListener('click', () => {
      publishSelectedStandby();
    });
  }

  // =====================================================================
  // 9. PUBLICACIÓN DIRECTA A CLOUDFLARE R2 (CONVERSIÓN FRONTEND + PRESIGNED PUT)
  // =====================================================================
  function putBlobToPresignedUrl(url, blob, headers, onProgress) {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url, true);

      if (headers && typeof headers === 'object') {
        Object.keys(headers).forEach((key) => {
          xhr.setRequestHeader(key, headers[key]);
        });
      }

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(e.loaded / e.total);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({ ok: true });
        } else {
          resolve({ ok: false, error: `Error al subir a la nube (HTTP ${xhr.status}).` });
        }
      };

      xhr.onerror = () => resolve({ ok: false, error: 'Error de conexión o CORS al subir a Cloudflare R2.' });
      xhr.send(blob);
    });
  }

  async function uploadPreparedMediaToR2(prepared, onProgress) {
    const authHeaders = { 'Content-Type': 'application/json' };
    if (currentGuest && currentGuest.token) {
      authHeaders['X-Guest-Token'] = currentGuest.token;
    }

    // Paso 1: Solicitar Presigned PUT URLs a PHP (metadatos pequeños)
    let presignData;
    try {
      const presignRes = await fetch('/api/media/presign', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          media_type: prepared.mediaType,
          mime_type: prepared.mimeType,
          file_size: prepared.mainFile.size,
          original_name: prepared.originalName,
          thumb_mime_type: prepared.thumbMimeType,
          thumb_size: prepared.thumbFile.size,
          duration: prepared.duration
        })
      });
      presignData = await presignRes.json();
      syncUploadDeadlineFromApi(presignData);
      if (!presignRes.ok || !presignData.success) {
        return { ok: false, res: presignData || { error: 'No se pudo autorizar la subida.' } };
      }
    } catch (err) {
      return { ok: false, res: { error: 'Error de conexión con el servidor al preparar la subida.' } };
    }

    if (onProgress) onProgress(0.05);

    // Paso 2a: Subir thumbnail directamente a Cloudflare R2
    const thumbPut = await putBlobToPresignedUrl(
      presignData.thumb_upload.url,
      prepared.thumbFile,
      presignData.thumb_upload.headers,
      (f) => {
        if (onProgress) onProgress(0.05 + f * 0.10);
      }
    );
    if (!thumbPut.ok) {
      return { ok: false, res: { error: thumbPut.error || 'No se pudo subir la miniatura a la nube.' } };
    }

    // Paso 2b: Subir archivo principal directamente a Cloudflare R2
    const mainPut = await putBlobToPresignedUrl(
      presignData.main_upload.url,
      prepared.mainFile,
      presignData.main_upload.headers,
      (f) => {
        if (onProgress) onProgress(0.15 + f * 0.78);
      }
    );
    if (!mainPut.ok) {
      return { ok: false, res: { error: mainPut.error || 'No se pudo subir el archivo a la nube.' } };
    }

    if (onProgress) onProgress(0.95);

    // Paso 3: Confirmar en PHP (HeadObject + INSERT en MySQL con URLs de R2)
    try {
      const confirmRes = await fetch('/api/media/confirm', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ upload_token: presignData.upload_token })
      });
      const confirmData = await confirmRes.json();
      syncUploadDeadlineFromApi(confirmData);
      if (onProgress) onProgress(1);
      return { ok: confirmRes.status === 201 && confirmData.success, res: confirmData };
    } catch (err) {
      return { ok: false, res: { error: 'Error de conexión al confirmar tu recuerdo.' } };
    }
  }

  async function publishSelectedStandby() {
    if (isPublishingStandby) return;

    if (isUploadClosed()) {
      showToast(UPLOAD_CLOSED_MSG, 'warning', 'Subidas cerradas');
      applyUploadClosedUI();
      return;
    }

    reconcileStandbySelectionWithQuota();
    const selected = getSelectedStandbyItems();

    if (selected.length === 0) {
      showToast('Selecciona al menos un recuerdo de tu carrete en espera para publicar.', 'warning', 'Nada seleccionado');
      return;
    }

    if (!currentGuest) {
      pendingPublishStandby = true;
      promptGuestName(true);
      showToast('Escribe tu nombre para publicar tus recuerdos en el álbum.', 'info', 'Identifícate');
      return;
    }

    await publishStandbyItems(selected, { skipConfirm: true });
  }

  async function publishStandbyItems(selected, options = {}) {
    if (isPublishingStandby || !Array.isArray(selected) || selected.length === 0) return;

    if (isUploadClosed()) {
      showToast(UPLOAD_CLOSED_MSG, 'warning', 'Subidas cerradas');
      applyUploadClosedUI();
      return;
    }

    if (!options.skipConfirm) {
      const vidCount = selected.filter((i) => i.type === 'video').length;
      const summaryText = selected.length === 1
        ? 'Se optimizará y publicará 1 recuerdo en la galería para que Michelle, René y todos los invitados puedan verlo.'
        : `Se optimizarán y publicarán ${selected.length} recuerdos${vidCount > 0 ? ` (incluyendo ${vidCount} ${vidCount === 1 ? 'video' : 'videos'})` : ''} en la galería pública de la boda.`;

      const confirmed = await showConfirmDialog({
        title: selected.length === 1 ? '¿Publicar este recuerdo?' : `¿Publicar ${selected.length} recuerdos?`,
        message: summaryText,
        confirmText: 'Sí, publicar ahora',
        cancelText: 'Seguir eligiendo',
        variant: 'success'
      });
      if (!confirmed) return;
    }

    isPublishingStandby = true;
    renderStandbyGrid();

    if (uploadProgress) {
      uploadProgress.style.display = 'block';
      uploadProgress.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if (progressBarFill) progressBarFill.style.width = '4%';

    let uploadedOk = 0;
    const skippedErrors = [];

    for (let i = 0; i < selected.length; i++) {
      const draftItem = selected[i];
      const idxLabel = `${i + 1} de ${selected.length}`;
      const isVid = draftItem.type === 'video';

      // Reconstruir objeto File limpio desde IndexedDB (preservando nombre, tipo y duración grabada)
      const fileForUpload = new File(
        [draftItem.file],
        draftItem.name || (isVid ? `boda_video_${Date.now()}.mp4` : `boda_foto_${Date.now()}.jpg`),
        { type: draftItem.mimeType || (draftItem.file && draftItem.file.type) || (isVid ? 'video/mp4' : 'image/jpeg') }
      );
      if (isVid && typeof draftItem.duration === 'number' && draftItem.duration > 0) {
        fileForUpload._recordedDuration = draftItem.duration;
      }
      if (isVid && draftItem.previewBlob) {
        fileForUpload._recordedThumbBlob = draftItem.previewBlob;
      }

      if (progressText) {
        progressText.textContent = isVid
          ? `Validando video y portada ${idxLabel}...`
          : `Optimizando foto a WebP ${idxLabel}...`;
      }

      let prepared;
      try {
        prepared = isVid
          ? await processVideoForUpload(fileForUpload)
          : await processImageForUpload(fileForUpload);
      } catch (procErr) {
        skippedErrors.push((procErr && procErr.message) || 'No se pudo procesar el archivo.');
        continue;
      }

      const { ok, res } = await uploadPreparedMediaToR2(prepared, (fraction) => {
        const overall = Math.min(100, Math.max(4, Math.round(((i + fraction) / selected.length) * 100)));
        if (progressBarFill) progressBarFill.style.width = `${overall}%`;
        if (progressText) progressText.textContent = `Publicando ${idxLabel} · ${overall}%`;
      });

      if (ok) {
        uploadedOk++;
        // Quitar del caché en espera solo cuando se confirmó exitosamente en R2 y MySQL
        const liveIdx = standbyItems.findIndex((x) => x.id === draftItem.id);
        if (liveIdx !== -1) {
          const [removed] = standbyItems.splice(liveIdx, 1);
          revokeStandbyItemUrls(removed);
        }
        sessionCaptureIds = sessionCaptureIds.filter((sid) => sid !== draftItem.id);
        await removeStandbyRecordFromDB(draftItem.id);

        if (currentGuest) {
          if (res.guest_item_count !== undefined) currentGuest.item_count = res.guest_item_count;
          if (res.guest_video_count !== undefined) currentGuest.video_count = res.guest_video_count;
          updateQuotaUI();
        }
      } else {
        skippedErrors.push((res && res.error) || 'Error al publicar archivo');
        if (res && res.uploads_closed) {
          break;
        }
      }
    }

    isPublishingStandby = false;
    if (uploadProgress) uploadProgress.style.display = 'none';
    if (progressBarFill) progressBarFill.style.width = '0%';

    reconcileStandbySelectionWithQuota();
    updateQuotaUI();
    renderStandbyGrid();

    if (uploadedOk > 0) {
      showToast(
        uploadedOk === 1
          ? '¡Tu recuerdo se publicó en el álbum de la boda! Ya todos pueden verlo.'
          : `¡${uploadedOk} recuerdos publicados en el álbum! Ya todos los invitados pueden verlos.`,
        'success',
        uploadedOk === 1 ? 'Recuerdo publicado' : 'Recuerdos publicados'
      );
      if (myUploadsGrid) loadMyUploads();
      if (galleryGrid) loadGallery(false);
    }

    if (skippedErrors.length > 0) {
      showToast(skippedErrors[0], 'error', 'Algunos archivos no se publicaron');
    }
  }

  async function publishDirectFiles(rawFiles) {
    const files = Array.from(rawFiles || []);
    if (files.length === 0 || isPublishingStandby) return;

    if (isUploadClosed()) {
      showToast(UPLOAD_CLOSED_MSG, 'warning', 'Subidas cerradas');
      applyUploadClosedUI();
      return;
    }

    if (!currentGuest) {
      pendingGalleryPublishFiles = files;
      promptGuestName(true);
      showToast('Escribe tu nombre para publicar tus fotos y videos al instante.', 'info', 'Identifícate');
      return;
    }

    let remainingTotal = getRemainingPublishSlots();
    let remainingVideos = getRemainingVideoPublishSlots();
    if (remainingTotal <= 0) {
      showToast(
        `Ya tienes ${getMaxItems()} recuerdos publicados. Elimina alguno abajo si deseas publicar nuevos.`,
        'warning',
        'Cupo publicado lleno'
      );
      return;
    }

    const queue = [];
    const skippedErrors = [];

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const isVid = isVideoFile(f);
      const isImg = isImageFile(f);

      if (!isVid && !isImg) {
        skippedErrors.push(`${f.name || 'Archivo'}: formato no compatible.`);
        continue;
      }
      if (remainingTotal <= 0) {
        skippedErrors.push(`Solo puedes publicar hasta ${getMaxItems()} recuerdos en total; algunos archivos se omitieron.`);
        break;
      }
      if (isVid) {
        if (remainingVideos <= 0) {
          skippedErrors.push(`Ya alcanzaste el máximo de ${getMaxVideos()} videos publicados.`);
          continue;
        }
        if (f.size > MAX_VIDEO_SIZE) {
          const mb = (f.size / (1024 * 1024)).toFixed(1);
          skippedErrors.push(`"${f.name || 'Video'}" pesa ${mb} MB y el máximo permitido es de 30 MB.`);
          continue;
        }
        remainingVideos--;
      }

      remainingTotal--;
      queue.push({ file: f, isVid });
    }

    if (queue.length === 0) {
      if (skippedErrors.length > 0) {
        showToast(skippedErrors[0], 'warning', 'No se pudieron subir');
      }
      return;
    }

    isPublishingStandby = true;
    renderStandbyGrid();

    if (uploadProgress) {
      uploadProgress.style.display = 'block';
      uploadProgress.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if (progressBarFill) progressBarFill.style.width = '4%';

    let uploadedOk = 0;

    for (let i = 0; i < queue.length; i++) {
      const { file, isVid } = queue[i];
      const idxLabel = `${i + 1} de ${queue.length}`;

      if (progressText) {
        progressText.textContent = isVid
          ? `Validando video y portada ${idxLabel}...`
          : `Optimizando foto a WebP ${idxLabel}...`;
      }

      let prepared;
      try {
        prepared = isVid
          ? await processVideoForUpload(file)
          : await processImageForUpload(file);
      } catch (procErr) {
        skippedErrors.push((procErr && procErr.message) || 'No se pudo procesar el archivo.');
        continue;
      }

      const { ok, res } = await uploadPreparedMediaToR2(prepared, (fraction) => {
        const overall = Math.min(100, Math.max(4, Math.round(((i + fraction) / queue.length) * 100)));
        if (progressBarFill) progressBarFill.style.width = `${overall}%`;
        if (progressText) progressText.textContent = `Publicando ${idxLabel} · ${overall}%`;
      });

      if (ok) {
        uploadedOk++;
        if (currentGuest) {
          if (res.guest_item_count !== undefined) currentGuest.item_count = res.guest_item_count;
          if (res.guest_video_count !== undefined) currentGuest.video_count = res.guest_video_count;
          updateQuotaUI();
        }
      } else {
        skippedErrors.push((res && res.error) || 'Error al publicar archivo');
        if (res && res.uploads_closed) {
          break;
        }
      }
    }

    isPublishingStandby = false;
    if (uploadProgress) uploadProgress.style.display = 'none';
    if (progressBarFill) progressBarFill.style.width = '0%';

    reconcileStandbySelectionWithQuota();
    updateQuotaUI();
    renderStandbyGrid();

    if (uploadedOk > 0) {
      showToast(
        uploadedOk === 1
          ? '¡Tu recuerdo se publicó en el álbum de la boda! Ya todos pueden verlo.'
          : `¡${uploadedOk} recuerdos publicados en el álbum! Ya todos los invitados pueden verlos.`,
        'success',
        uploadedOk === 1 ? 'Recuerdo publicado' : 'Recuerdos publicados'
      );
      if (myUploadsGrid) loadMyUploads();
      if (galleryGrid) loadGallery(false);
    }

    if (skippedErrors.length > 0) {
      showToast(skippedErrors[0], 'warning', 'Algunos archivos no se publicaron');
    }
  }

  // =====================================================================
  // 10. GESTIÓN DE MIS FOTOS Y VIDEOS PUBLICADOS (EN /camara)
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
      syncUploadDeadlineFromApi(data);
      if (data.success && Array.isArray(data.items)) {
        myMediaCache = data.items;
        if (data.guest_item_count !== undefined) {
          currentGuest.item_count = data.guest_item_count;
        }
        if (data.guest_video_count !== undefined) {
          currentGuest.video_count = data.guest_video_count;
        }
        reconcileStandbySelectionWithQuota();
        updateQuotaUI();
        renderStandbyGrid();
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
      const thumbSrc = item.thumb_url || item.url;
      tile.innerHTML = `
        ${isVideo
          ? (item.thumb_url
              ? `<img src="${escapeHtml(item.thumb_url)}" alt="Portada de video" loading="lazy" decoding="async" /><span class="my-upload-badge-vid">Video</span>`
              : `<video src="${escapeHtml(item.url)}" muted playsinline preload="none"></video><span class="my-upload-badge-vid">Video</span>`)
          : `<img src="${escapeHtml(thumbSrc)}" alt="Mi recuerdo" loading="lazy" decoding="async" />`
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
        openLightboxAtIndex(index, myMediaCache, 'myUploads');
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
  // 11. GALERÍA DE ALTA GAMA CON PAGINACIÓN Y SCROLL INFINITO (/galeria)
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

  function ensureGalleryPaginationElements() {
    if (!galleryGrid) return;
    if (!galleryPaginationFooter) {
      galleryPaginationFooter = document.createElement('div');
      galleryPaginationFooter.id = 'galleryPaginationFooter';
      galleryPaginationFooter.className = 'gallery-pagination-footer';
      galleryPaginationFooter.style.display = 'none';
      galleryPaginationFooter.innerHTML = `
        <div id="galleryLoadMoreIndicator" class="gallery-load-more-indicator" style="display:none;" role="status" aria-live="polite">
          <span class="gallery-spinner gallery-spinner-sm" aria-hidden="true"></span>
          <span>Cargando más recuerdos...</span>
        </div>
        <button type="button" id="btnLoadMoreGallery" class="btn-gallery-action btn-gallery-load-more" style="display:none;">
          Cargar más recuerdos
        </button>
        <div id="gallerySentinel" class="gallery-sentinel" aria-hidden="true"></div>
      `;
      galleryGrid.insertAdjacentElement('afterend', galleryPaginationFooter);
      galleryLoadMoreIndicator = document.getElementById('galleryLoadMoreIndicator');
      btnLoadMoreGallery = document.getElementById('btnLoadMoreGallery');
      gallerySentinel = document.getElementById('gallerySentinel');
    }
  }

  function createGalleryTile(item, batchIndex) {
    const tile = document.createElement('div');
    tile.className = 'gallery-grid-item';
    tile.dataset.mediaId = String(item.id);
    tile.tabIndex = 0;
    tile.setAttribute('aria-label', `Abrir recuerdo de ${item.guest_name || 'Invitado'}`);
    tile.addEventListener('keydown', (event) => {
      if (event.target === tile && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); tile.click(); }
    });
    tile.style.transitionDelay = `${Math.min(batchIndex * 35, 320)}ms`;

    const isVideo = item.media_type === 'video';
    const isOwner = item.is_owner || (currentGuest && Number(item.guest_id) === Number(currentGuest.id));
    const thumbSrc = item.thumb_url || item.url;
    const imgLoadAttrs = (galleryCurrentPage <= 1 && batchIndex < 6)
      ? 'loading="eager" fetchpriority="high" decoding="async"'
      : 'loading="lazy" decoding="async"';

    tile.innerHTML = `
      <div class="gallery-item-aspect">
        ${isVideo
          ? `${item.thumb_url
              ? `<img src="${escapeHtml(item.thumb_url)}" alt="Video de ${escapeHtml(item.guest_name)}" class="gallery-item-media" ${imgLoadAttrs} />`
              : `<video src="${escapeHtml(item.url)}" class="gallery-item-media" muted playsinline preload="none"></video>`}
             <div class="gallery-video-indicator"><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg></div>`
          : `<img src="${escapeHtml(thumbSrc)}" alt="Recuerdo de ${escapeHtml(item.guest_name)}" class="gallery-item-media" ${imgLoadAttrs} />`
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
      const liveIndex = allMediaCache.findIndex((entry) => Number(entry.id) === Number(item.id));
      openLightboxAtIndex(liveIndex >= 0 ? liveIndex : 0, allMediaCache, 'gallery');
    });

    return tile;
  }

  function appendGalleryItems(items) {
    if (!galleryGrid || !Array.isArray(items) || items.length === 0) return;

    const fragment = document.createDocumentFragment();
    const newTiles = [];

    items.forEach((item, batchIndex) => {
      const tile = createGalleryTile(item, batchIndex);
      newTiles.push(tile);
      fragment.appendChild(tile);
    });

    galleryGrid.appendChild(fragment);
    layoutGalleryMosaic();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        newTiles.forEach((tile) => tile.classList.add('visible'));
      });
    });
  }

  function initScrollNavigation() {
    const nav = document.getElementById('siteNav');
    if (!nav || document.body.classList.contains('page-guestbook')) return;
    let lastY = Math.max(0, window.scrollY);
    let pointerNearTop = false;
    let framePending = false;
    const show = () => nav.classList.remove('is-scroll-hidden');
    const update = () => {
      framePending = false;
      const y = Math.max(0, window.scrollY);
      const delta = y - lastY;
      const menuButton = document.getElementById('navHamburgerBtn');
      const menuOpen = menuButton && menuButton.getAttribute('aria-expanded') === 'true';
      if (y <= nav.offsetHeight || pointerNearTop || nav.contains(document.activeElement) || menuOpen) {
        show(); lastY = y; return;
      }
      if (Math.abs(delta) < 6) return;
      nav.classList.toggle('is-scroll-hidden', delta > 0);
      lastY = y;
    };
    window.addEventListener('scroll', () => {
      if (!framePending) { framePending = true; requestAnimationFrame(update); }
    }, { passive: true });
    document.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'mouse') return;
      pointerNearTop = event.clientY <= nav.offsetHeight + 16;
      if (pointerNearTop) show();
    }, { passive: true });
    document.addEventListener('pointerleave', () => { pointerNearTop = false; });
    nav.addEventListener('focusin', show);
  }

  function getGalleryTileSpan(width, index, sparse) {
    const ratios = [3/4, 3/5, 1, 2/3, 5/6, 4/7];
    const height = sparse ? Math.min(440, width / ratios[index % ratios.length]) : width / ratios[index % ratios.length];
    return Math.max(1, Math.ceil((height + 10) / 14));
  }

  function layoutGalleryMosaic() {
    if (!galleryGrid) return;
    const tiles = Array.from(galleryGrid.querySelectorAll('.gallery-grid-item'));
    const sparse = !galleryHasMore && tiles.length <= 4;
    const levelRow = currentFilter === 'popular' && sparse && tiles.length > 0;
    galleryGrid.classList.toggle('is-sparse', sparse);
    galleryGrid.classList.toggle('is-level-row', levelRow);
    if (!tiles.length) return;
    // La misma cuadricula sirve a Todos, Mis Fotos y Mas Queridas.
    const columns = getComputedStyle(galleryGrid).gridTemplateColumns.split(' ').length;
    const width = (galleryGrid.clientWidth - (columns - 1) * 10) / columns;
    tiles.forEach((tile, index) => {
      const rowStart = Math.floor(index / columns) * columns;
      const rowCount = Math.min(columns, tiles.length - rowStart);
      const offset = Math.floor((columns - rowCount) / 2);
      tile.style.gridColumnStart = String(offset + index % columns + 1);
      tile.style.gridRowEnd = 'span ' + getGalleryTileSpan(width, levelRow ? 0 : index, sparse);
    });
  }

  if (galleryGrid) {
    let lastMosaicWidth = -1;
    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver((entries) => {
        const width = entries[0].contentRect.width;
        if (width !== lastMosaicWidth) { lastMosaicWidth = width; layoutGalleryMosaic(); }
      });
      observer.observe(galleryGrid);
    } else {
      window.addEventListener('resize', layoutGalleryMosaic);
    }
  }

  function syncGalleryTileLike(mediaId, hasLiked, likesCount) {
    if (!galleryGrid) return;
    const tile = galleryGrid.querySelector(`.gallery-grid-item[data-media-id="${String(mediaId)}"]`);
    if (!tile) return;
    const likeBtn = tile.querySelector('.gallery-item-like');
    if (!likeBtn) return;
    likeBtn.classList.toggle('liked', Boolean(hasLiked));
    const heart = likeBtn.querySelector('.like-heart');
    const cnt = likeBtn.querySelector('.like-cnt');
    if (heart) heart.textContent = hasLiked ? '♥' : '♡';
    if (cnt) cnt.textContent = String(likesCount);
  }

  function resetGalleryState() {
    allMediaCache = [];
    galleryLoadedItemIds.clear();
    galleryCurrentPage = 0;
    galleryTotal = 0;
    galleryHasMore = false;
    if (galleryGrid) { galleryGrid.innerHTML = ''; galleryGrid.classList.remove('is-sparse', 'is-level-row'); }
    if (galleryEmpty) galleryEmpty.style.display = 'none';
    if (currentLightboxSource === 'gallery') {
      currentLightboxItems = allMediaCache;
    }
  }

  function updateGalleryPaginationUI(shouldObserve = true) {
    if (!galleryGrid) return;
    ensureGalleryPaginationElements();

    const hasItems = allMediaCache.length > 0;
    const showFooter = hasItems && (galleryHasMore || galleryIsLoading);
    const showSpinner = hasItems && galleryIsLoading;
    const showButton = hasItems && galleryHasMore && !galleryIsLoading;

    if (galleryPaginationFooter) {
      galleryPaginationFooter.style.display = showFooter ? 'flex' : 'none';
    }
    if (galleryLoadMoreIndicator) {
      galleryLoadMoreIndicator.style.display = showSpinner ? 'inline-flex' : 'none';
    }
    if (btnLoadMoreGallery) {
      btnLoadMoreGallery.style.display = showButton ? 'inline-flex' : 'none';
      btnLoadMoreGallery.disabled = galleryIsLoading;
    }

    if (galleryObserver && gallerySentinel) {
      if (shouldObserve && galleryHasMore && !galleryIsLoading) {
        galleryObserver.observe(gallerySentinel);
      } else {
        galleryObserver.unobserve(gallerySentinel);
      }
    }
  }

  async function fetchGalleryPage(page = 1, options = {}) {
    if (!galleryGrid) return false;
    ensureGalleryPaginationElements();

    const reset = Boolean(options.reset);
    const silent = Boolean(options.silent);

    if (!reset) {
      if (galleryIsLoading) {
        return galleryActiveLoadPromise || false;
      }
      if (!galleryHasMore) return false;
    }

    const reqVersion = reset ? ++galleryRequestVersion : galleryRequestVersion;
    const token = currentGuest ? currentGuest.token : (localStorage.getItem('mr_guest_token') || '');

    if (reset) {
      resetGalleryState();
      galleryLastGuestToken = token;
      if (!silent && galleryLoadingState) {
        galleryLoadingState.style.display = 'flex';
      }
    }

    galleryIsLoading = true;
    updateGalleryPaginationUI(false);

    const loadPromise = (async () => {
      let loadedOk = false;
      try {
        const params = new URLSearchParams({
          filter: currentFilter,
          page: String(page),
          limit: String(GALLERY_PAGE_SIZE)
        });
        const res = await fetch(`/api/media?${params.toString()}`, {
          headers: token ? { 'X-Guest-Token': token } : {}
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        syncUploadDeadlineFromApi(data);

        // Ignorar respuestas obsoletas si el usuario cambió de pestaña o refrescó
        if (reqVersion !== galleryRequestVersion) {
          return false;
        }

        if (data.success && Array.isArray(data.items)) {
          const uniqueNewItems = [];
          data.items.forEach((item) => {
            const idKey = Number(item.id);
            if (!galleryLoadedItemIds.has(idKey)) {
              galleryLoadedItemIds.add(idKey);
              allMediaCache.push(item);
              uniqueNewItems.push(item);
            }
          });

          galleryCurrentPage = Number(data.page || page);
          galleryTotal = Number(data.total !== undefined ? data.total : allMediaCache.length);
          galleryHasMore = Boolean(data.has_more);

          if (galleryLoadingState) galleryLoadingState.style.display = 'none';

          if (uniqueNewItems.length > 0) {
            if (galleryEmpty) galleryEmpty.style.display = 'none';
            appendGalleryItems(uniqueNewItems);
          } else if (allMediaCache.length === 0) {
            if (galleryEmpty) galleryEmpty.style.display = 'flex';
          }

          if (currentLightboxSource === 'gallery') {
            currentLightboxItems = allMediaCache;
            syncOpenLightboxChrome();
          }

          if (currentGuest) {
            if (data.guest_item_count !== undefined) currentGuest.item_count = data.guest_item_count;
            if (data.guest_video_count !== undefined) currentGuest.video_count = data.guest_video_count;
            updateQuotaUI();
          }

          loadedOk = true;
        }
      } catch (e) {
        if (reqVersion === galleryRequestVersion) {
          if (galleryLoadingState) galleryLoadingState.style.display = 'none';
          if (reset && allMediaCache.length === 0 && galleryEmpty) {
            galleryEmpty.style.display = 'flex';
          } else if (!reset) {
            showToast('No se pudieron cargar más recuerdos. Toca "Cargar más recuerdos" para reintentar.', 'error', 'Error de conexión');
          }
        }
      } finally {
        if (reqVersion === galleryRequestVersion) {
          galleryIsLoading = false;
          galleryActiveLoadPromise = null;
          updateGalleryPaginationUI(loadedOk);

          // Re-evaluar intersección tras renderizar (útil en pantallas muy altas)
          if (loadedOk && galleryHasMore && galleryObserver && gallerySentinel) {
            requestAnimationFrame(() => {
              if (reqVersion === galleryRequestVersion && galleryHasMore && !galleryIsLoading && galleryObserver && gallerySentinel) {
                galleryObserver.unobserve(gallerySentinel);
                galleryObserver.observe(gallerySentinel);
              }
            });
          }
        }
      }
      return loadedOk;
    })();

    galleryActiveLoadPromise = loadPromise;
    return loadPromise;
  }

  function loadGallery(silent = false) {
    return fetchGalleryPage(1, { reset: true, silent });
  }

  function loadNextGalleryPage() {
    if (!galleryHasMore || galleryIsLoading) return Promise.resolve(false);
    return fetchGalleryPage(galleryCurrentPage + 1, { reset: false, silent: true });
  }

  function initGalleryInfiniteScroll() {
    if (!galleryGrid) return;
    ensureGalleryPaginationElements();

    if (btnLoadMoreGallery) {
      btnLoadMoreGallery.addEventListener('click', () => {
        loadNextGalleryPage();
      });
    }

    if ('IntersectionObserver' in window && gallerySentinel) {
      galleryObserver = new IntersectionObserver(
        (entries) => {
          for (let i = 0; i < entries.length; i++) {
            if (entries[i].isIntersecting && galleryHasMore && !galleryIsLoading) {
              loadNextGalleryPage();
              break;
            }
          }
        },
        {
          root: null,
          rootMargin: '250px 0px',
          threshold: 0.01
        }
      );
    }
  }

  galleryTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const nextFilter = tab.dataset.filter || 'all';
      if (nextFilter === currentFilter) return;
      galleryTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = nextFilter;
      loadGallery(false);
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
      if (heart && !heart.querySelector('svg')) heart.textContent = newHasLiked ? '♥' : '♡';
      if (cnt) cnt.textContent = newCount;
    }

    // Actualizar solo el mosaico afectado sin re-renderizar toda la cuadrícula
    if (galleryGrid) {
      syncGalleryTileLike(mediaId, newHasLiked, newCount);
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
        if (galleryGrid) {
          syncGalleryTileLike(mediaId, data.has_liked, data.likes_count);
        }
        const activeLightboxItem = currentLightboxItems[currentLightboxIndex];
        if (lightbox && lightbox.classList.contains('active') && activeLightboxItem && Number(activeLightboxItem.id) === Number(mediaId)) {
          if (lightboxLikeBtn) lightboxLikeBtn.classList.toggle('liked', Boolean(data.has_liked));
          if (lightboxLikeCount) lightboxLikeCount.textContent = String(data.likes_count);
        }
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

    const targetItem = allMediaCache.find((i) => Number(i.id) === Number(mediaId)) ||
                       myMediaCache.find((i) => Number(i.id) === Number(mediaId));
    const wasVideo = Boolean(targetItem && targetItem.media_type === 'video');

    const galleryIdx = allMediaCache.findIndex((i) => Number(i.id) === Number(mediaId));
    if (galleryIdx >= 0) {
      allMediaCache.splice(galleryIdx, 1);
      galleryLoadedItemIds.delete(Number(mediaId));
      galleryTotal = Math.max(0, galleryTotal - 1);
    }
    myMediaCache = myMediaCache.filter((i) => Number(i.id) !== Number(mediaId));

    // Eliminar solo el nodo afectado sin re-renderizar toda la cuadrícula
    if (galleryGrid) {
      const tileToRemove = galleryGrid.querySelector(`.gallery-grid-item[data-media-id="${String(mediaId)}"]`);
      if (tileToRemove) tileToRemove.remove();
      layoutGalleryMosaic();

      if (allMediaCache.length === 0) {
        if (galleryHasMore) {
          loadNextGalleryPage();
        } else {
          if (galleryEmpty) galleryEmpty.style.display = 'flex';
          updateGalleryPaginationUI(false);
        }
      }
      if (currentLightboxSource === 'gallery') {
        currentLightboxItems = allMediaCache;
        syncOpenLightboxChrome();
      }
    }
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
          currentGuest.item_count = data.guest_item_count !== undefined
            ? data.guest_item_count
            : Math.max(0, getUploadedCount() - 1);
          currentGuest.video_count = data.guest_video_count !== undefined
            ? data.guest_video_count
            : Math.max(0, getUploadedVideoCount() - (wasVideo ? 1 : 0));
          reconcileStandbySelectionWithQuota();
          updateQuotaUI();
          if (standbyGrid) renderStandbyGrid();
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
  // 12. LIGHTBOX ESTILO INSTAGRAM CON SWIPE TÁCTIL, DOBLE TOQUE Y TECLADO
  // =====================================================================
  function getAuthorInitials(name) {
    const clean = String(name || 'Invitado').trim();
    if (!clean) return 'IN';
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  }

  function triggerLightboxHeartBurst() {
    if (!lightboxHeartBurst) return;
    lightboxHeartBurst.classList.remove('is-bursting');
    void lightboxHeartBurst.offsetWidth;
    lightboxHeartBurst.classList.add('is-bursting');
  }

  function resetLightboxVideoElement() {
    if (!lightboxVideo) return;
    lightboxVideo.pause();
    lightboxVideo.preload = 'none';
    lightboxVideo.poster = '';
    lightboxVideo.removeAttribute('src');
    lightboxVideo.load();
  }

  function syncOpenLightboxChrome() {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    const totalLoaded = currentLightboxItems.length;
    if (totalLoaded === 0) return;

    if (currentLightboxIndex >= totalLoaded) {
      currentLightboxIndex = totalLoaded - 1;
    }

    const canNavigate = totalLoaded > 1 || (currentLightboxSource === 'gallery' && galleryHasMore);
    if (lightboxCounter) {
      lightboxCounter.textContent = `${currentLightboxIndex + 1} / ${totalLoaded}`;
      lightboxCounter.style.display = canNavigate ? 'inline-flex' : 'none';
    }
    if (lightboxPrev) lightboxPrev.style.display = canNavigate ? 'flex' : 'none';
    if (lightboxNext) lightboxNext.style.display = canNavigate ? 'flex' : 'none';
  }

  function openLightboxAtIndex(index, itemsList, source = null) {
    if (!lightbox || !itemsList || itemsList.length === 0) return;
    currentLightboxItems = itemsList;
    if (source !== null) {
      currentLightboxSource = source;
    } else if (itemsList === allMediaCache) {
      currentLightboxSource = 'gallery';
    } else if (itemsList === myMediaCache) {
      currentLightboxSource = 'myUploads';
    }

    if (index < 0) index = itemsList.length - 1;
    if (index >= itemsList.length) index = 0;
    currentLightboxIndex = index;

    const item = currentLightboxItems[currentLightboxIndex];
    if (!item) return;

    const isStandby = currentLightboxSource === 'standby';
    const isVideo = isStandby ? item.type === 'video' : item.media_type === 'video';
    const mediaUrl = isStandby
      ? (item.fullUrl || (item.fullUrl = URL.createObjectURL(item.file)))
      : item.url;
    const posterUrl = isStandby ? (item.thumbUrl || '') : (item.thumb_url || '');

    if (isVideo) {
      if (lightboxImg) {
        lightboxImg.style.display = 'none';
        lightboxImg.removeAttribute('src');
      }
      if (lightboxVideo) {
        lightboxVideo.pause();
        lightboxVideo.preload = isStandby ? 'metadata' : 'none';
        lightboxVideo.poster = posterUrl;
        lightboxVideo.src = mediaUrl;
        lightboxVideo.style.display = 'block';
      }
    } else {
      resetLightboxVideoElement();
      if (lightboxVideo) lightboxVideo.style.display = 'none';
      if (lightboxImg) {
        lightboxImg.style.display = 'block';
        lightboxImg.src = mediaUrl;
      }
    }

    if (isStandby) {
      if (lightboxAvatar) lightboxAvatar.innerHTML = '<svg class="ui-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/></svg>';
      if (lightboxAuthor) {
        lightboxAuthor.textContent = item.selected ? 'Seleccionado para publicar' : 'En espera (sin publicar)';
      }
      if (lightboxTime) lightboxTime.textContent = 'Guardado en tu dispositivo';
      if (lightboxLikeBtn) lightboxLikeBtn.style.display = 'none';
      if (lightboxLikesWrap) lightboxLikesWrap.style.display = 'none';
      if (lightboxStandbySelectBtn) {
        lightboxStandbySelectBtn.style.display = 'inline-flex';
        lightboxStandbySelectBtn.classList.toggle('is-selected', Boolean(item.selected));
      }
      if (lightboxStandbySelectLabel) {
        lightboxStandbySelectLabel.textContent = item.selected ? 'Seleccionado' : 'Seleccionar para publicar';
      }
      if (lightboxDeleteBtn) lightboxDeleteBtn.style.display = 'inline-flex';
    } else {
      const authorName = item.guest_name || 'Invitado';
      if (lightboxAvatar) lightboxAvatar.textContent = getAuthorInitials(authorName);
      if (lightboxAuthor) lightboxAuthor.textContent = authorName;
      if (lightboxTime) lightboxTime.textContent = formatTimeAgo(item.created_at);
      if (lightboxLikeCount) lightboxLikeCount.textContent = item.likes_count || 0;
      if (lightboxLikesLabel) lightboxLikesLabel.textContent = 'me gusta';
      if (lightboxLikeBtn) {
        lightboxLikeBtn.style.display = 'inline-flex';
        lightboxLikeBtn.classList.toggle('liked', Boolean(item.has_liked));
      }
      if (lightboxLikesWrap) lightboxLikesWrap.style.display = 'flex';
      if (lightboxStandbySelectBtn) lightboxStandbySelectBtn.style.display = 'none';
      if (lightboxDeleteBtn) {
        const isOwner = item.is_owner || (currentGuest && Number(item.guest_id) === Number(currentGuest.id));
        lightboxDeleteBtn.style.display = isOwner ? 'inline-flex' : 'none';
      }
    }

    if (lightboxDownloadBtn) {
      lightboxDownloadBtn.href = mediaUrl;
      const fallbackName = isVideo ? 'recuerdo_boda.mp4' : 'recuerdo_boda.webp';
      const downloadName = isStandby ? (item.name || fallbackName) : (item.original_name || fallbackName);
      lightboxDownloadBtn.setAttribute('download', downloadName);
      lightboxDownloadBtn.dataset.downloadUrl = mediaUrl;
      lightboxDownloadBtn.dataset.downloadName = downloadName;
    }

    lightbox.classList.add('active');
    syncOpenLightboxChrome();
    document.body.style.overflow = 'hidden';
    updateLandscapeAllowance();
  }

  async function navigateLightbox(step) {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    if (!currentLightboxItems || currentLightboxItems.length === 0) return;

    const nextIndex = currentLightboxIndex + step;
    if (
      step > 0 &&
      nextIndex >= currentLightboxItems.length &&
      currentLightboxSource === 'gallery' &&
      galleryHasMore
    ) {
      const prevLength = currentLightboxItems.length;
      await loadNextGalleryPage();
      currentLightboxItems = allMediaCache;
      if (currentLightboxItems.length > prevLength) {
        openLightboxAtIndex(prevLength, currentLightboxItems, 'gallery');
        return;
      }
    }

    openLightboxAtIndex(nextIndex, currentLightboxItems, currentLightboxSource);
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    currentLightboxSource = null;
    document.body.style.overflow = '';
    resetLightboxVideoElement();
    if (lightboxVideo) lightboxVideo.style.display = 'none';
    if (lightboxImg) lightboxImg.removeAttribute('src');
    updateLandscapeAllowance();
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
  if (lightboxNext) lightboxNext.addEventListener('click', () => navigateLightbox(1));

  if (lightboxLikeBtn) {
    lightboxLikeBtn.addEventListener('click', () => {
      if (currentLightboxSource === 'standby') return;
      const item = currentLightboxItems[currentLightboxIndex];
      if (item) toggleLike(item.id, lightboxLikeBtn);
    });
  }
  if (lightboxStandbySelectBtn) {
    lightboxStandbySelectBtn.addEventListener('click', () => {
      if (currentLightboxSource !== 'standby') return;
      const item = currentLightboxItems[currentLightboxIndex];
      if (!item) return;
      toggleStandbySelection(item.id);
      lightboxStandbySelectBtn.classList.toggle('is-selected', Boolean(item.selected));
      if (lightboxStandbySelectLabel) {
        lightboxStandbySelectLabel.textContent = item.selected ? 'Seleccionado' : 'Seleccionar para publicar';
      }
      if (lightboxAuthor) {
        lightboxAuthor.textContent = item.selected ? 'Seleccionado para publicar' : 'En espera (sin publicar)';
      }
    });
  }
  if (lightboxDeleteBtn) {
    lightboxDeleteBtn.addEventListener('click', async () => {
      const item = currentLightboxItems[currentLightboxIndex];
      if (!item) return;
      const source = currentLightboxSource;
      closeLightbox();
      if (source === 'standby') {
        await deleteStandbyItem(item.id);
      } else {
        deleteMyMedia(item.id);
      }
    });
  }

  // Descarga directa compatible con URLs remotas cross-origin (Cloudflare R2)
  if (lightboxDownloadBtn) {
    lightboxDownloadBtn.addEventListener('click', async (e) => {
      const url = lightboxDownloadBtn.dataset.downloadUrl || lightboxDownloadBtn.href;
      const fileName = lightboxDownloadBtn.dataset.downloadName || 'recuerdo_boda';
      if (!url || !/^https?:\/\//i.test(url) || url.startsWith(window.location.origin)) {
        return;
      }
      e.preventDefault();
      try {
        const res = await fetch(url, { mode: 'cors' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(blobUrl), 2500);
      } catch (err) {
        window.open(url, '_blank', 'noopener');
      }
    });
  }

  // Doble toque / doble clic en foto para dar Me Gusta estilo Instagram
  if (lightboxImg) {
    let lastTapAt = 0;
    const handleDoubleLike = () => {
      if (currentLightboxSource === 'standby') return;
      const item = currentLightboxItems[currentLightboxIndex];
      if (!item) return;
      triggerLightboxHeartBurst();
      if (!item.has_liked) {
        toggleLike(item.id, lightboxLikeBtn);
      }
    };
    lightboxImg.addEventListener('dblclick', handleDoubleLike);
    lightboxImg.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTapAt < 280 && e.changedTouches && e.changedTouches.length === 1) {
        e.preventDefault();
        handleDoubleLike();
        lastTapAt = 0;
      } else {
        lastTapAt = now;
      }
    }, { passive: false });
  }

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target === lightboxMediaContainer) closeLightbox();
    });

    let touchStartX = 0;
    lightbox.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    lightbox.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].screenX - touchStartX;
      const canNav = currentLightboxItems.length > 1 || (currentLightboxSource === 'gallery' && galleryHasMore);
      if (Math.abs(dx) > 50 && canNav) {
        if (dx > 0) navigateLightbox(-1);
        else navigateLightbox(1);
      }
    }, { passive: true });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (captureReviewModal && captureReviewModal.classList.contains('is-open')) {
        closeCaptureReview();
      }
      closeLightbox();
      closeMobileDrawer();
      closeGuestModal();
      closeSignatureModal();
    }
    if (lightbox && lightbox.classList.contains('active')) {
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
      if (e.key === 'ArrowRight') navigateLightbox(1);
      return;
    }
    if (bookReadView && !bookFlipStage.hidden && bookReadView.classList.contains('is-active') && !(bookSigModal && bookSigModal.classList.contains('is-open'))) {
      if (e.target && e.target.closest && e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
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

  function isWideBook() { return window.innerWidth >= 1000; }

  function isBookSpreadReading() {
    const sheet = document.getElementById('weddingBookSheet');
    return isWideBook() && sheet && sheet.dataset.mode === 'read';
  }

  function syncBookLayout() {
    const sheet = document.getElementById('weddingBookSheet');
    if (!sheet) return;
    const open = sheet.classList.contains('is-open');
    const writing = sheet.dataset.mode === 'write';
    sheet.classList.toggle('is-two-page', isWideBook() && open);
    sheet.parentElement.classList.toggle('is-open-book', open);
    sheet.parentElement.classList.toggle('is-spread-open', isWideBook() && open);
    document.body.classList.toggle('has-open-book', open);
    if (bookFlipStage) bookFlipStage.hidden = !open || (writing && !isWideBook());
  }

  function computeBookPageSize() {
    return 5;
  }

  function computeLineClamp(pageSize) {
    const stageH = bookFlipStage ? bookFlipStage.clientHeight : (window.innerHeight - 260);
    const usableH = Math.max(220, stageH - 78);
    const slotH = usableH / pageSize;
    return slotH >= 132 ? 3 : 2;
  }

  function getTotalBookPages() {
    return Math.max(1, Math.ceil(guestbookEntries.length / currentBookPageSize));
  }

  function getBookPageSwipeHint(pageNum, totalPages, totalEntries) {
    if (totalPages <= 1) {
      return totalEntries > 0 ? 'Toca una firma para leerla completa' : 'Agrega la primera dedicatoria';
    }
    if (pageNum <= 1) {
      return 'Desliza la esquina o la hoja a la izquierda con tu dedo';
    }
    if (pageNum >= totalPages) {
      return 'Última hoja · Desliza a la derecha para regresar';
    }
    return 'Desliza a la izquierda o a la derecha con tu dedo para hojear';
  }

  function buildBookPageFooterHtml(pageNum, totalPages, totalEntries) {
    const hintText = getBookPageSwipeHint(pageNum, totalPages, totalEntries);
    const spread = isBookSpreadReading();
    const sheet = document.getElementById('weddingBookSheet');
    const writingSpread = isWideBook() && sheet && sheet.dataset.mode === 'write';
    const hideArrows = !writingSpread && (totalEntries === 0 || totalPages <= (spread ? 2 : 1));
    const prevDisabled = hideArrows || pageNum <= (spread ? 2 : 1);
    const nextDisabled = !writingSpread && (hideArrows || pageNum >= totalPages);
    const hiddenClass = hideArrows ? ' is-hidden' : '';

    return `
      <div class="book-paper-footer">
        <button
          type="button"
          class="book-paper-corner-btn book-corner-prev${hiddenClass}"
          data-book-dir="prev"
          aria-label="Hoja anterior"
          ${prevDisabled ? 'disabled' : ''}
        ><svg class="ui-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12H4m6-6-6 6 6 6"/></svg></button>
        <span class="book-paper-swipe-hint">${escapeHtml(hintText)}</span>
        <button type="button" class="book-paper-corner-btn book-mode-switch" data-book-mode="write" aria-label="Escribir firma">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          <span class="book-mode-tooltip" aria-hidden="true">Escribir firma</span>
        </button>
        <button
          type="button"
          class="book-paper-corner-btn book-corner-next${hiddenClass}"
          data-book-dir="next"
          aria-label="Hoja siguiente"
          ${nextDisabled ? 'disabled' : ''}
        ><svg class="ui-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16m-6-6 6 6-6 6"/></svg></button>
      </div>
    `;
  }

  function buildBookPaperHtml(pageNum) {
    const side = pageNum % 2 ? 'left' : 'right';
    const totalPages = getTotalBookPages();
    const html = pageNum <= totalPages ? buildBookPageHtml(pageNum) :
      '<div class="book-paper-running-head"><span>Libro de Honor</span><span></span></div><div class="book-paper-empty" aria-label="Hoja en blanco"></div>' + buildBookPageFooterHtml(pageNum, totalPages, guestbookEntries.length);
    return '<div class="book-paper-page" data-book-side="' + side + '">' + html + '</div>';
  }

  function buildBookPageHtml(pageNum) {
    const total = guestbookEntries.length;
    const totalPages = getTotalBookPages();

    if (total === 0) {
      return `
        <div class="book-paper-running-head">
          <span>Libro de Honor</span>
          <span>Hoja 1 de 1</span>
        </div>
        <div class="book-paper-empty">
          <p class="book-paper-empty-title">Sé el primero en estrenar este libro</p>
          <p class="book-paper-empty-sub">
            Tus palabras quedarán escritas con tinta y cariño en el recuerdo de Michelle &amp; René.
          </p>
        </div>
        ${buildBookPageFooterHtml(1, 1, 0)}
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
        <article class="book-signature-entry sig-font-${fontKey} is-clickable${Number(entry.id) === celebratingSignatureId ? ' is-new-signature' : ''}" data-entry-id="${Number(entry.id)}">
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
      ${buildBookPageFooterHtml(safePage, totalPages, total)}
    `;
  }

  let signatureRevealCleanup = null;
  let signatureRevealScheduled = false;

  // Medir el texto original conserva las ligaduras y la caligrafia: no se divide en spans.
  function measureSignatureLines(target) {
    const box = target.getBoundingClientRect();
    const node = target.firstChild;
    if (!node || node.nodeType !== 3 || !box.width || !box.height) return [];
    const range = document.createRange();
    const lines = [];
    let offset = 0;
    for (const char of Array.from(node.textContent).slice(0, 800)) {
      range.setStart(node, offset);
      offset += char.length;
      range.setEnd(node, offset);
      const rect = range.getBoundingClientRect();
      if (!rect.width || rect.top >= box.bottom - 1 || rect.bottom <= box.top || rect.left >= box.right) continue;
      let line = lines.find((item) => Math.abs(item.top - rect.top) < 4);
      if (!line) { line = { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right }; lines.push(line); }
      line.left = Math.min(line.left, rect.left);
      line.right = Math.min(box.right, Math.max(line.right, rect.right));
      line.bottom = Math.min(box.bottom, Math.max(line.bottom, rect.bottom));
    }
    return lines.map((line) => ({ target, x: Math.max(0, line.left - box.left - 2), y: Math.max(0, line.top - box.top), width: line.right - line.left + 4, height: line.bottom - Math.max(line.top, box.top), left: line.left, top: line.top }));
  }

  function animateNewSignature(entry) {
    if (signatureRevealCleanup) signatureRevealCleanup();
    const targets = Array.from(entry.querySelectorAll('.book-sig-message, .book-sig-author'));
    const lines = targets.flatMap(measureSignatureLines);
    if (!lines.length || !window.CSS || !CSS.supports('mask-image', 'linear-gradient(black, black)')) {
      entry.classList.remove('is-new-signature'); celebratingSignatureId = null; return;
    }
    const box = entry.getBoundingClientRect();
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.classList.add('signature-magic-layer');
    svg.setAttribute('viewBox', '0 0 ' + box.width + ' ' + box.height);
    svg.setAttribute('aria-hidden', 'true');
    const make = (tag, attrs) => {
      const node = document.createElementNS(ns, tag);
      Object.entries(attrs).forEach(([key,value]) => node.setAttribute(key, value));
      svg.appendChild(node); return node;
    };
    const defs = document.createElementNS(ns, 'defs');
    const gradient = document.createElementNS(ns, 'linearGradient');
    const gradientId = 'signature-trail-' + celebratingSignatureId;
    gradient.setAttribute('id', gradientId); gradient.setAttribute('gradientUnits', 'userSpaceOnUse');
    [[0, '#F4E2B7', 0], [.45, '#F4E2B7', .3], [1, '#FFFDF8', 1]].forEach(([offset, color, opacity]) => {
      const stop = document.createElementNS(ns, 'stop');
      stop.setAttribute('offset', offset); stop.setAttribute('stop-color', color); stop.setAttribute('stop-opacity', opacity); gradient.appendChild(stop);
    });
    defs.appendChild(gradient); svg.appendChild(defs);
    const trail = make('path', {class: 'signature-light-trail', fill: 'url(#' + gradientId + ')'});
    const tip = make('circle', {class: 'signature-light-tip', r: 3.2});
    const particles = Array.from({length: 12}, (_,i) => make('path', {class: 'signature-light-spark', d: i % 3 === 0 ? 'M0 -4 1 -1 4 0 1 1 0 4 -1 1 -4 0 -1 -1Z' : 'M0 -1.4A1.4 1.4 0 1 0 0 1.4A1.4 1.4 0 1 0 0 -1.4'}));
    entry.appendChild(svg);
    targets.forEach((target) => {
      const own = lines.filter((line) => line.target === target);
      target.style.maskImage = own.map(() => 'linear-gradient(black,black)').join(',');
      target.style.webkitMaskImage = target.style.maskImage;
      target.style.maskRepeat = 'no-repeat'; target.style.webkitMaskRepeat = 'no-repeat';
      target.style.maskPosition = own.map((line) => line.x + 'px ' + line.y + 'px').join(',');
      target.style.webkitMaskPosition = target.style.maskPosition;
      target.style.maskSize = own.map((line) => '0px ' + line.height + 'px').join(',');
      target.style.webkitMaskSize = target.style.maskSize;
    });
    entry.classList.add('signature-revealing');
    const totalWidth = lines.reduce((sum,line) => sum + line.width, 0);
    const duration = Math.min(4100, Math.max(2200, totalWidth * 3.9));
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0, started = null, finished = false;
    const cleanup = () => {
      if (finished) return;
      finished = true; cancelAnimationFrame(frame);
      targets.forEach((target) => {
        ['mask-image','mask-size','mask-position','mask-repeat','-webkit-mask-image','-webkit-mask-size','-webkit-mask-position','-webkit-mask-repeat'].forEach((property) => target.style.removeProperty(property));
      });
      svg.remove(); entry.classList.remove('is-new-signature','signature-revealing');
      if (signatureRevealCleanup === cleanup) signatureRevealCleanup = null;
    };
    signatureRevealCleanup = cleanup;
    const draw = (time) => {
      if (!entry.isConnected || motion.matches || document.hidden || bookFlipStage.hidden || bookIsFlipping) {
        cleanup(); if (entry.isConnected) celebratingSignatureId = null; return;
      }
      if (started === null) started = time;
      const progress = Math.min(1, (time - started) / duration);
      let remaining = progress * totalWidth;
      let active = lines[0], activeWidth = 0;
      targets.forEach((target) => {
        const sizes = lines.filter((line) => line.target === target).map((line) => {
          const width = Math.min(line.width, Math.max(0, remaining));
          if (remaining >= 0 && remaining <= line.width) { active = line; activeWidth = width; }
          remaining -= line.width;
          return width + 'px ' + line.height + 'px';
        });
        target.style.maskSize = sizes.join(','); target.style.webkitMaskSize = target.style.maskSize;
      });
      const x = active.left - box.left + activeWidth;
      const y = active.top - box.top + active.height * .73;
      const tailX = Math.max(active.left - box.left, x - 44);
      gradient.setAttribute('x1', tailX); gradient.setAttribute('x2', Math.max(tailX + .01, x));
      gradient.setAttribute('y1', y); gradient.setAttribute('y2', y);
      trail.setAttribute('d', 'M' + tailX + ' ' + y + ' Q' + (x - 12) + ' ' + (y - .3) + ' ' + x + ' ' + (y - 1.2) + ' L' + x + ' ' + (y + 1.2) + ' Q' + (x - 12) + ' ' + (y + .3) + ' ' + tailX + ' ' + y + 'Z');
      tip.setAttribute('cx', x); tip.setAttribute('cy', y);
      const fade = progress > .93 ? (1 - progress) / .07 : Math.min(1, progress * 25);
      svg.style.opacity = fade;
      particles.forEach((particle,i) => {
        const phase = ((time - started) / 460 + i / 12) % 1;
        const px = x - phase * (18 + i * 2);
        const py = y + Math.sin(i * 2.4) * phase * (10 + i);
        particle.setAttribute('transform', 'translate(' + px + ' ' + py + ') scale(' + (1 - phase) + ')');
        particle.style.opacity = (1 - phase) * .9;
      });
      if (progress < 1) frame = requestAnimationFrame(draw);
      else { cleanup(); celebratingSignatureId = null; clearTimeout(signatureCelebrationTimer); }
    };
    frame = requestAnimationFrame(draw);
  }

  function scheduleNewSignatureReveal() {
    if (celebratingSignatureId === null || signatureRevealScheduled) return;
    signatureRevealScheduled = true;
    setTimeout(async () => {
      try {
        if (document.fonts) await document.fonts.ready;
        if (celebratingSignatureId === null) return;
        const entry = bookFlipHostWrap.querySelector('.is-new-signature[data-entry-id="' + celebratingSignatureId + '"]');
        if (!entry || entry.classList.contains('signature-revealing')) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          entry.classList.remove('is-new-signature'); celebratingSignatureId = null; return;
        }
        animateNewSignature(entry);
      } catch (error) {
        if (signatureRevealCleanup) signatureRevealCleanup();
        bookFlipHostWrap.querySelectorAll('.is-new-signature').forEach((entry) => entry.classList.remove('is-new-signature'));
        celebratingSignatureId = null;
        console.warn('No se pudo animar la nueva firma:', error);
      } finally { signatureRevealScheduled = false; }
    }, 750);
  }

  if (bookFlipHostWrap) {
    new MutationObserver(scheduleNewSignatureReveal).observe(bookFlipHostWrap, {childList: true, subtree: true});
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

  function getGuestbookSnapshotKey(entries, pageSize, width, height) {
    const ids = (entries || []).map((e) => `${e.id}:${e.font_family || ''}`).join(',');
    return `${pageSize}|${width}x${height}|${ids}`;
  }

  function destroyBookPageFlip() {
    if (bookPageFlipInstance) {
      try {
        bookPageFlipInstance.destroy();
      } catch (e) {}
      bookPageFlipInstance = null;
    }
    bookIsFlipping = false;
    lastMountedBookKey = '';
  }

  function updateBookChrome() {
    const total = guestbookEntries.length;
    const totalPages = getTotalBookPages();
    currentBookPage = Math.min(Math.max(1, currentBookPage), totalPages);

    if (gbBookCountPill) gbBookCountPill.textContent = String(total);

    if (bookPagesStack) {
      const remaining = Math.max(0, totalPages - currentBookPage);
      bookPagesStack.dataset.depth = String(Math.min(3, remaining));
    }
  }

  function renderGuestbookPage(pageNum, forceRemount = false) {
    if (!bookFlipHostWrap) return;

    syncBookLayout();
    if (bookFlipStage.hidden) return;
    currentBookPageSize = computeBookPageSize();
    const total = guestbookEntries.length;
    const totalPages = getTotalBookPages();
    const spread = isBookSpreadReading();
    currentBookPage = Math.min(Math.max(1, pageNum), totalPages);
    if (spread) currentBookPage = Math.floor((currentBookPage - 1) / 2) * 2 + 1;

    updateBookChrome();

    // Si la pestaña de lectura aún no está visible, esperar a que tenga dimensiones reales
    const hostW = Math.floor(bookFlipHostWrap.clientWidth || 0);
    const hostH = Math.floor(bookFlipHostWrap.clientHeight || 0);
    if (hostW < 80 || hostH < 120) {
      return;
    }

    const nextKey = getGuestbookSnapshotKey(guestbookEntries, currentBookPageSize, hostW, hostH) + ':' + (spread ? 'spread' : 'single');
    if (!forceRemount && bookPageFlipInstance && lastMountedBookKey === nextKey) {
      // La libreria pudo medir cero al ocultarse o al cambiar el teclado de Android.
      const ui = bookPageFlipInstance.getUI && bookPageFlipInstance.getUI();
      if (ui && typeof ui.update === 'function') ui.update();
      return;
    }

    destroyBookPageFlip();
    bookFlipHostWrap.innerHTML = '';

    // Si hay 0 o 1 hoja, o si la librería no cargó, mostrar hoja directa sin necesidad de volteo
    const hasPageFlipLib = typeof window.St !== 'undefined' && typeof window.St.PageFlip === 'function';
    if (total === 0 || totalPages <= 1 || !hasPageFlipLib || (spread && totalPages <= 2)) {
      if (spread) {
        bookFlipHostWrap.innerHTML = '<div class="book-static-spread"><div class="book-stf-page">' + buildBookPaperHtml(currentBookPage) + '</div><div class="book-stf-page">' + buildBookPaperHtml(currentBookPage + 1) + '</div></div>';
      } else {
        bookFlipHostWrap.innerHTML = '<div class="book-stf-page">' + buildBookPaperHtml(currentBookPage) + '</div>';
      }
      lastMountedBookKey = nextKey;
      return;
    }

    const hostEl = document.createElement('div');
    hostEl.className = 'book-flip-host';

    const pageNodes = [];
    const renderedPages = spread ? Math.ceil(totalPages / 2) * 2 : totalPages;
    for (let p = 1; p <= renderedPages; p++) {
      const pageEl = document.createElement('div');
      pageEl.className = 'book-stf-page';
      pageEl.innerHTML = buildBookPaperHtml(p);
      hostEl.appendChild(pageEl);
      pageNodes.push(pageEl);
    }

    bookFlipHostWrap.appendChild(hostEl);

    try {
      const startIndex = Math.min(Math.max(0, currentBookPage - 1), totalPages - 1);
      bookPageFlipInstance = new window.St.PageFlip(hostEl, {
        width: spread ? Math.floor(hostW / 2) : hostW,
        height: hostH,
        size: 'fixed',
        autoSize: false,
        usePortrait: !spread,
        showCover: false,
        startPage: startIndex,
        drawShadow: true,
        maxShadowOpacity: 0.42,
        flippingTime: 500,
        showPageCorners: false,
        swipeDistance: 999999,
        mobileScrollSupport: false,
        disableFlipByClick: true,
        useMouseEvents: true
      });

      bookPageFlipInstance.loadFromHTML(pageNodes);
      // StPageFlip dibuja las hojas blandas en 2D: backface-visibility por si solo no oculta el verso.
      const renderer = bookPageFlipInstance.getRender();
      const setFlippingPage = renderer.setFlippingPage.bind(renderer);
      renderer.setFlippingPage = (page) => {
        setFlippingPage(page);
        const element = page && page.getElement && page.getElement();
        if (element) element.classList.add('is-turning-verso');
      };
      lastMountedBookKey = nextKey;

      const fc = bookPageFlipInstance.getFlipController && bookPageFlipInstance.getFlipController();
      const ui = bookPageFlipInstance.getUI && bookPageFlipInstance.getUI();

      // Bloqueo atómico: garantiza que cada deslizamiento cambie EXACTAMENTE 1 hoja a la vez,
      // evitando que StPageFlip dispare un doble giro en swipes rápidos o interrumpa una hoja en vuelo.
      let allowProgrammaticFlip = false;

      if (fc) {
        const isFlipBusy = () => {
          const state = typeof fc.getState === 'function' ? fc.getState() : 'read';
          const hasAnim = Boolean(fc.render && fc.render.animation !== null);
          return state === 'flipping' || hasAnim;
        };

        if (typeof fc.flip === 'function') {
          const origFlip = fc.flip.bind(fc);
          fc.flip = function (point) {
            // Nunca interrumpir una animación activa (evita finishAnimation() + segundo giro = salto de 2+ hojas)
            if (isFlipBusy()) return;
            // Bloquear clics implícitos en esquinas de StPageFlip; solo permitir giros explícitos controlados
            if (!allowProgrammaticFlip) return;
            return origFlip(point);
          };
        }

        if (typeof fc.fold === 'function') {
          fc.fold = function (point) {
            if (isFlipBusy()) return;
            if (this.calc === null) {
              // Evitar bug de StPageFlip: si start() falla (ej. última hoja hacia adelante
              // o primera hoja hacia atrás), nunca dejar el estado atascado en 'user_fold'.
              if (!this.start(point)) {
                if (this.getState() !== 'read') this.setState('read');
                return;
              }
            }
            this.setState('user_fold');
            this.do(this.render.convertToPage(point));
          };
        }

        if (typeof fc.flipPrev === 'function') {
          // Bug conocido de StPageFlip en modo portrait con disableFlipByClick:true:
          // flipPrev() evalúa isPointOnCorners({x:10}) que cae al centro del libro virtual y cancela el giro.
          const origFlipPrev = fc.flipPrev.bind(fc);
          fc.flipPrev = function (corner) {
            if (this.getState() !== 'read' || isFlipBusy()) return;
            const settings = this.app.getSettings();
            const prevDisable = settings.disableFlipByClick;
            settings.disableFlipByClick = false;
            allowProgrammaticFlip = true;
            try {
              return origFlipPrev(corner);
            } finally {
              allowProgrammaticFlip = false;
              settings.disableFlipByClick = prevDisable;
            }
          };
        }

        if (typeof fc.flipNext === 'function') {
          const origFlipNext = fc.flipNext.bind(fc);
          fc.flipNext = function (corner) {
            if (this.getState() !== 'read' || isFlipBusy()) return;
            const settings = this.app.getSettings();
            const prevDisable = settings.disableFlipByClick;
            settings.disableFlipByClick = false;
            allowProgrammaticFlip = true;
            try {
              return origFlipNext(corner);
            } finally {
              allowProgrammaticFlip = false;
              settings.disableFlipByClick = prevDisable;
            }
          };
        }

        if (typeof fc.stopMove === 'function') {
          fc.stopMove = function () {
            if (this.calc === null) {
              if (this.getState() === 'user_fold') {
                this.setState('read');
              }
              return;
            }
            if (this.getState() !== 'user_fold' || isFlipBusy()) return;

            const pos = this.calc.getPosition();
            const rect = this.getBoundsRect();
            const corner = this.calc.getCorner() === 'bottom' ? 'bottom' : 'top';
            const targetY = corner === 'bottom' ? rect.height : 0;
            const dir = this.calc.getDirection(); // 0 = siguiente, 1 = anterior
            const isPortrait = this.render.getOrientation() === 'portrait';
            const dragDx = bookLastDragDx;
            bookLastDragDx = 0;

            let shouldFlip = false;
            if (isPortrait) {
              if (dir === 0) {
                // Solo avanzar si arrastró al menos 28px a la izquierda (o sin dragDx conocido, cruzó >55% de la hoja)
                shouldFlip = dragDx <= -28 || (dragDx === 0 && pos.x <= rect.pageWidth * 0.45);
              } else {
                // Solo regresar si arrastró al menos 28px a la derecha (o sin dragDx conocido, cruzó 14%)
                shouldFlip = dragDx >= 28 || (dragDx === 0 && pos.x <= -rect.pageWidth * 0.14);
              }
            } else {
              shouldFlip = pos.x <= 0;
            }

            if (shouldFlip) {
              this.setState('flipping');
              bookIsFlipping = true;
              lastFlipCommitTs = performance.now();
              this.animateFlippingTo(pos, { x: -rect.pageWidth, y: targetY }, true);
              return;
            }

            // Si el dedo empezó en zona contraria pero deslizó claramente en la dirección opuesta,
            // cancelar el micro-doblez y voltear exactamente 1 hoja en la dirección real del dedo.
            const wantPrevInstead = isPortrait && dir === 0 && dragDx >= 34 && currentBookPage > 1;
            const wantNextInstead = isPortrait && dir === 1 && dragDx <= -34 && currentBookPage < totalPages;
            if (wantPrevInstead || wantNextInstead) {
              this.render.setBottomPage(null);
              this.render.setFlippingPage(null);
              this.render.clearShadow();
              this.setState('read');
              this.reset();
              bookIsFlipping = false;
              triggerBookFlip(wantPrevInstead ? 'prev' : 'next', corner);
              return;
            }

            this.animateFlippingTo(pos, { x: rect.pageWidth, y: targetY }, false);
          };
        }
      }

      // Control limpio de eventos táctiles/ratón en StPageFlip:
      // 1. Elimina el timer huérfano de onTouchStart y el detector de swipe duplicado de onTouchEnd.
      // 2. Ignora nuevos toques/arrastres mientras una hoja está girando y filtra multi-touch.
      if (ui && typeof ui.removeHandlers === 'function' && typeof ui.setHandlers === 'function') {
        const origRemoveHandlers = ui.removeHandlers.bind(ui);
        const origSetHandlers = ui.setHandlers.bind(ui);
        let touchStartTimer = null;
        let activeTouchId = null;

        const clearTouchTimer = () => {
          if (touchStartTimer !== null) {
            clearTimeout(touchStartTimer);
            touchStartTimer = null;
          }
        };

        const isBusyForInput = () => {
          if (bookIsFlipping || (performance.now() - lastFlipEndTs < BOOK_FLIP_SETTLE_MS)) return true;
          if (!fc) return false;
          const st = typeof fc.getState === 'function' ? fc.getState() : 'read';
          return st !== 'read' || Boolean(fc.render && fc.render.animation !== null);
        };

        const findTouchById = (touchList, id) => {
          for (let i = 0; i < touchList.length; i++) {
            if (touchList[i].identifier === id) return touchList[i];
          }
          return null;
        };

        origRemoveHandlers();
        ui.swipeTimeout = 75;
        ui.swipeDistance = 999999;

        ui.onMouseDown = (e) => {
          if (e.button !== 0 || !ui.checkTarget(e.target)) return;
          if (isBusyForInput()) return;
          const pos = ui.getMousePos(e.clientX, e.clientY);
          ui.app.startUserTouch(pos);
          e.preventDefault();
        };

        ui.onMouseMove = (e) => {
          if (fc && fc.getState && fc.getState() === 'flipping') return;
          const pos = ui.getMousePos(e.clientX, e.clientY);
          ui.app.userMove(pos, false);
        };

        ui.onMouseUp = (e) => {
          if (!ui.app.isUserTouch) return;
          const pos = ui.getMousePos(e.clientX, e.clientY);
          ui.app.userStop(pos, false);
        };

        ui.onTouchStart = (e) => {
          if (!ui.checkTarget(e.target) || e.changedTouches.length === 0) return;
          if (!ui.app.getSettings().mobileScrollSupport && e.cancelable) {
            e.preventDefault();
          }
          if (activeTouchId !== null || isBusyForInput()) return;

          const touch = e.changedTouches[0];
          const pos = ui.getMousePos(touch.clientX, touch.clientY);
          activeTouchId = touch.identifier;
          ui.touchPoint = { point: pos, time: Date.now() };
          clearTouchTimer();
          touchStartTimer = setTimeout(() => {
            touchStartTimer = null;
            if (ui.touchPoint !== null && activeTouchId === touch.identifier && !isBusyForInput()) {
              ui.app.startUserTouch(pos);
            }
          }, ui.swipeTimeout);
        };

        ui.onTouchMove = (e) => {
          if (activeTouchId === null) return;
          const touch = findTouchById(e.changedTouches, activeTouchId);
          if (!touch) return;
          if (fc && fc.getState && fc.getState() === 'flipping') return;

          const pos = ui.getMousePos(touch.clientX, touch.clientY);
          if (ui.touchPoint !== null && !ui.app.isUserTouch) {
            const dxMove = pos.x - ui.touchPoint.point.x;
            const dyMove = Math.abs(pos.y - ui.touchPoint.point.y);
            const elapsedMs = Date.now() - ui.touchPoint.time;
            if (Math.abs(dxMove) > 10 && Math.abs(dxMove) > dyMove && elapsedMs >= 55 && !isBusyForInput()) {
              clearTouchTimer();
              if (dxMove < 0 && currentBookPage < totalPages) {
                const startPt = { x: Math.max(pos.x, hostW * 0.72), y: ui.touchPoint.point.y };
                if (fc && fc.calc === null && typeof fc.start === 'function') fc.start(startPt);
                ui.app.startUserTouch(ui.touchPoint.point);
              } else if (dxMove > 0 && currentBookPage > 1) {
                const startPt = { x: 10, y: ui.touchPoint.point.y };
                if (fc && fc.calc === null && typeof fc.start === 'function') fc.start(startPt);
                ui.app.startUserTouch(ui.touchPoint.point);
              }
            }
          }
          if (ui.app.isUserTouch) {
            ui.app.userMove(pos, true);
          }
        };

        ui.onTouchEnd = (e) => {
          if (activeTouchId === null) return;
          const touch = findTouchById(e.changedTouches, activeTouchId);
          if (!touch) return;

          clearTouchTimer();
          const pos = ui.getMousePos(touch.clientX, touch.clientY);
          activeTouchId = null;
          ui.touchPoint = null;
          if (ui.app.isUserTouch) {
            ui.app.userStop(pos, false);
          }
        };

        ui.onTouchCancel = (e) => {
          if (activeTouchId === null) return;
          const touch = findTouchById(e.changedTouches, activeTouchId);
          if (!touch) return;

          clearTouchTimer();
          activeTouchId = null;
          ui.touchPoint = null;
          if (ui.app.isUserTouch) {
            ui.app.userStop({ x: 0, y: 0 }, true);
          }
        };

        ui.removeHandlers = () => {
          clearTouchTimer();
          activeTouchId = null;
          ui.touchPoint = null;
          window.removeEventListener('touchcancel', ui.onTouchCancel);
          origRemoveHandlers();
        };

        ui.setHandlers = () => {
          origSetHandlers();
          if (ui.app.getSettings().useMouseEvents) {
            window.addEventListener('touchcancel', ui.onTouchCancel);
          }
        };

        ui.setHandlers();
      }

      bookPageFlipInstance.on('flip', (e) => {
        const now = performance.now();
        lastFlipCommitTs = now;
        lastFlipEndTs = now;
        const nextIndex = Number(e && e.data !== undefined ? e.data : 0);
        const sheet = document.getElementById('weddingBookSheet');
        const leaveWriting = isWideBook() && sheet && sheet.dataset.mode === 'write' && nextIndex + 1 > currentBookPage;
        currentBookPage = Math.min(Math.max(1, nextIndex + 1), totalPages);
        if (spread) currentBookPage = Math.floor((currentBookPage - 1) / 2) * 2 + 1;
        updateBookChrome();
        if (leaveWriting) requestAnimationFrame(() => setBookMode('read'));
      });

      bookPageFlipInstance.on('changeState', (e) => {
        const state = e && e.data ? String(e.data) : 'read';
        bookIsFlipping = state !== 'read';
        if (state === 'read') {
          bookFlipHostWrap.querySelectorAll('.is-turning-verso').forEach((page) => page.classList.remove('is-turning-verso'));
        }
        if (bookFlipStage) {
          bookFlipStage.classList.toggle('is-dragging', state === 'user_fold');
        }
      });
    } catch (err) {
      console.error('Error iniciando StPageFlip:', err);
      destroyBookPageFlip();
      bookFlipHostWrap.innerHTML = spread
        ? '<div class="book-static-spread"><div class="book-stf-page">' + buildBookPaperHtml(currentBookPage) + '</div><div class="book-stf-page">' + buildBookPaperHtml(currentBookPage + 1) + '</div></div>'
        : '<div class="book-stf-page">' + buildBookPaperHtml(currentBookPage) + '</div>';
    }
  }

  function isBookFlipBusy() {
    if (!bookPageFlipInstance) return false;
    const fc = bookPageFlipInstance.getFlipController && bookPageFlipInstance.getFlipController();
    if (!fc) return bookIsFlipping;
    const state = typeof fc.getState === 'function' ? fc.getState() : 'read';
    return state !== 'read' || Boolean(fc.render && fc.render.animation !== null);
  }

  function isBookFlipLocked() {
    return isBookFlipBusy() || (performance.now() - lastFlipEndTs < BOOK_FLIP_SETTLE_MS);
  }

  function triggerBookFlip(dir, corner = 'bottom') {
    const totalPages = getTotalBookPages();
    const sheet = document.getElementById('weddingBookSheet');
    const writingSpread = isWideBook() && sheet && sheet.dataset.mode === 'write';
    if (writingSpread && dir === 'next' && (!bookPageFlipInstance || currentBookPage >= totalPages)) {
      setBookMode('read');
      return true;
    }
    const step = isBookSpreadReading() ? 2 : 1;
    const canNext = currentBookPage + step - 1 < totalPages;
    if (totalPages <= 1) return false;

    if (bookPageFlipInstance) {
      // Bloquear si ya hay una hoja girando o recién aterrizando (1 hoja por gesto)
      if (isBookFlipLocked()) return false;
      try {
        if (dir === 'next' && canNext) {
          lastFlipCommitTs = performance.now();
          bookIsFlipping = true;
          bookPageFlipInstance.flipNext(corner);
          if (!isBookFlipBusy()) {
            bookIsFlipping = false;
            return false;
          }
          return true;
        }
        if (dir === 'prev' && currentBookPage > 1) {
          lastFlipCommitTs = performance.now();
          bookIsFlipping = true;
          bookPageFlipInstance.flipPrev(corner);
          if (!isBookFlipBusy()) {
            bookIsFlipping = false;
            return false;
          }
          return true;
        }
        return false;
      } catch (err) {
        bookIsFlipping = false;
      }
    }

    // Respaldo si no hay instancia activa
    if (dir === 'next' && canNext) {
      renderGuestbookPage(currentBookPage + step);
      return true;
    }
    if (dir === 'prev' && currentBookPage > 1) {
      renderGuestbookPage(Math.max(1, currentBookPage - step));
      return true;
    }
    return false;
  }

  function initBookSignatureTap() {
    if (!bookFlipHostWrap) return;

    let gestureActive = false;
    let pointerId = null;
    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let pageAtStart = 1;
    let tapEntryId = null;
    let startedOnCornerBtn = false;
    let swipeLockedAtStart = false;
    let lastSwipeHandledTs = 0;
    let hostRect = null;

    // Clic/toque en las flechas integradas en las esquinas de cada hoja
    bookFlipHostWrap.addEventListener('click', (e) => {
      const navBtn = e.target && e.target.closest ? e.target.closest('.book-paper-corner-btn') : null;
      if (!navBtn || navBtn.disabled) return;
      e.stopPropagation();
      if (performance.now() - lastSwipeHandledTs < 280) return;
      if (isBookFlipLocked()) return;
      const dir = navBtn.dataset.bookDir;
      if (dir === 'prev' || dir === 'next') {
        triggerBookFlip(dir, 'bottom');
      }
    });

    // Evitar que clics derechos/medios inicien arrastre en StPageFlip
    bookFlipHostWrap.addEventListener('mousedown', (e) => {
      if (e.button !== 0) {
        e.stopPropagation();
      }
    }, true);

    window.addEventListener('blur', () => {
      gestureActive = false;
      pointerId = null;
      tapEntryId = null;
      startedOnCornerBtn = false;
      swipeLockedAtStart = false;
      bookLastDragDx = 0;
      if (bookPageFlipInstance && bookPageFlipInstance.isUserTouch) {
        bookPageFlipInstance.userStop({ x: 0, y: 0 }, true);
      }
    });

    bookFlipHostWrap.addEventListener('pointerdown', (e) => {
      if (guestbookEntries.length === 0) return;
      if (e.button !== undefined && e.button !== 0) return;
      // Ignorar dedos adicionales (multi-touch) o gestos iniciados mientras una hoja aún está volando
      if (gestureActive || isBookFlipBusy()) return;

      gestureActive = true;
      pointerId = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      startTime = performance.now();
      pageAtStart = currentBookPage;
      bookLastDragDx = 0;
      hostRect = bookFlipHostWrap.getBoundingClientRect();

      startedOnCornerBtn = Boolean(e.target && e.target.closest && e.target.closest('.book-paper-corner-btn'));
      swipeLockedAtStart = isBookFlipLocked();
      const entryEl = e.target && e.target.closest ? e.target.closest('.book-signature-entry') : null;
      tapEntryId = entryEl ? entryEl.dataset.entryId : null;
    }, true);

    window.addEventListener('pointermove', (e) => {
      if (!gestureActive || e.pointerId !== pointerId) return;
      bookLastDragDx = e.clientX - startX;
    }, { passive: true });

    const finishGesture = (e) => {
      if (!gestureActive || e.pointerId !== pointerId) return;
      gestureActive = false;
      pointerId = null;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const dist = Math.hypot(dx, dy);
      const elapsed = performance.now() - startTime;
      const rect = hostRect || bookFlipHostWrap.getBoundingClientRect();
      const relX = startX - rect.left;
      const relY = startY - rect.top;
      const corner = relY < rect.height / 2 ? 'top' : 'bottom';
      const totalPages = getTotalBookPages();
      const capturedStartTime = startTime;
      const capturedPageAtStart = pageAtStart;
      const capturedTapEntryId = tapEntryId;
      const capturedStartedOnCornerBtn = startedOnCornerBtn;
      const capturedSwipeLockedAtStart = swipeLockedAtStart;

      tapEntryId = null;
      startedOnCornerBtn = false;
      swipeLockedAtStart = false;

      const commitSingleFlipIfStillIdle = (dir) => {
        if (capturedSwipeLockedAtStart || isBookFlipLocked()) return;
        if (lastFlipCommitTs >= capturedStartTime || currentBookPage !== capturedPageAtStart) {
          return;
        }
        triggerBookFlip(dir, corner);
      };

      // 1. Deslizamiento horizontal suave (desde cualquier parte de la hoja, solo ~34px necesarios)
      if (totalPages > 1 && Math.abs(dx) >= 34 && Math.abs(dx) > Math.abs(dy) * 1.05 && elapsed < 1300) {
        lastSwipeHandledTs = performance.now();
        const dir = dx < 0 ? 'next' : 'prev';
        const stfDragging = Boolean(bookPageFlipInstance && bookPageFlipInstance.isUserTouch);
        if (!stfDragging) {
          // Swipe rápido (sin arrastre activo de StPageFlip): girar inmediatamente EXACTAMENTE 1 hoja
          commitSingleFlipIfStillIdle(dir);
        } else {
          // Si StPageFlip sí tenía arrastre activo, esperar un tick para que stopMove() lo resuelva primero
          setTimeout(() => commitSingleFlipIfStillIdle(dir), 25);
        }
        return;
      }

      // Si inició sobre una flecha de esquina y fue toque corto, deja que su evento click lo maneje una sola vez
      if (capturedStartedOnCornerBtn) {
        return;
      }

      // 2. Toque corto (sin arrastre)
      if (dist < 10 && elapsed < 380) {
        const edgeZone = 42;
        if (totalPages > 1 && relX >= rect.width - edgeZone && currentBookPage < totalPages) {
          commitSingleFlipIfStillIdle('next');
          return;
        }
        if (totalPages > 1 && relX <= edgeZone && currentBookPage > 1) {
          commitSingleFlipIfStillIdle('prev');
          return;
        }
        if (capturedTapEntryId && !isBookFlipBusy()) {
          openSignatureModal(capturedTapEntryId);
        }
      }
    };

    window.addEventListener('pointerup', finishGesture, { passive: true });
    window.addEventListener('pointercancel', () => {
      gestureActive = false;
      pointerId = null;
      tapEntryId = null;
      startedOnCornerBtn = false;
      swipeLockedAtStart = false;
      bookLastDragDx = 0;
    }, { passive: true });
  }

  function setBookMode(mode) {
    const isRead = mode === 'read';
    // Nunca conservar una instancia que vaya a medir su host oculto.
    destroyBookPageFlip();
    if (isRead && bookWriteView && bookWriteView.contains(document.activeElement)) document.activeElement.blur();
    if (!isRead && signatureRevealCleanup) { signatureRevealCleanup(); celebratingSignatureId = null; }
    const sheet = document.getElementById('weddingBookSheet');
    if (sheet) {
      if (!isRead && sheet.dataset.mode !== 'write') currentBookPage = 1;
      sheet.classList.add('is-open'); sheet.dataset.mode = mode;
    }
    syncBookLayout();
    [btnBookWriteTab, btnBookReadTab].forEach((button) => {
      if (button) button.setAttribute('aria-expanded', 'true');
    });
    if (bookFlipStage) bookFlipStage.hidden = !isRead && !isWideBook();
    if (bookWriteView) bookWriteView.classList.toggle('is-active', !isRead);
    if (bookReadView) bookReadView.classList.add('is-active');
    if (!isRead && guestbookAuthorInput) requestAnimationFrame(() => guestbookAuthorInput.focus({ preventScroll: true }));
    if (btnBookWriteTab) btnBookWriteTab.classList.toggle('is-active', !isRead);
    if (btnBookReadTab) btnBookReadTab.classList.toggle('is-active', isRead);
    if (isRead || isWideBook()) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          renderGuestbookPage(currentBookPage);
          loadGuestbook();
        });
      });
    }
  }

  if (bookReadView) {
    bookReadView.addEventListener('click', (event) => {
      const button = event.target.closest('[data-book-mode]');
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      if (!isSubmittingSignature) setBookMode(button.dataset.bookMode);
    }, true);
    // El control de modo no inicia un arrastre de hoja.
    ['pointerdown', 'mousedown', 'touchstart'].forEach((type) => {
      bookReadView.addEventListener(type, (event) => {
        if (event.target.closest('[data-book-mode]')) event.stopPropagation();
      }, { capture: true, passive: true });
    });
  }

  if (btnBookWriteTab) btnBookWriteTab.addEventListener('click', () => setBookMode('write'));
  if (btnBookReadTab) btnBookReadTab.addEventListener('click', () => setBookMode('read'));
  if (btnGoToReadSignatures) btnGoToReadSignatures.addEventListener('click', () => setBookMode('read'));

  // Mantener cinco firmas por hoja y alternar una o dos hojas al redimensionar.
  let bookResizeTimer = null;
  function scheduleBookResize() {
    if (shouldFreezeLayoutForLandscape()) return;
    if (!bookFlipStage || !bookReadView || !bookReadView.classList.contains('is-active')) return;
    syncBookLayout();
    if (bookFlipStage.hidden) return;
    clearTimeout(bookResizeTimer);
    bookResizeTimer = setTimeout(() => {
      if (!bookIsFlipping && !shouldFreezeLayoutForLandscape()) {
        renderGuestbookPage(currentBookPage);
      }
    }, 180);
  }
  window.addEventListener('resize', scheduleBookResize);
  window.addEventListener('boda:portrait-restored', scheduleBookResize);
  if (bookFlipHostWrap && 'ResizeObserver' in window) {
    let lastBookWidth = -1, lastBookHeight = -1;
    const bookSizeObserver = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      const width = Math.floor(rect.width), height = Math.floor(rect.height);
      if (width === lastBookWidth && height === lastBookHeight) return;
      lastBookWidth = width; lastBookHeight = height;
      if (width >= 80 && height >= 120) scheduleBookResize();
    });
    bookSizeObserver.observe(bookFlipHostWrap);
  }
  if (window.visualViewport) window.visualViewport.addEventListener('resize', scheduleBookResize);

  async function loadGuestbook() {
    if (!bookFlipHostWrap) return;
    try {
      const res = await fetch('/api/guestbook');
      const data = await res.json();
      if (data.success && Array.isArray(data.entries)) {
        guestbookEntries = data.entries;
        if (celebratingSignatureId !== null) {
          currentBookPageSize = computeBookPageSize();
          const index = guestbookEntries.findIndex((entry) => Number(entry.id) === celebratingSignatureId);
          if (index >= 0) currentBookPage = Math.floor(index / currentBookPageSize) + 1;
        }
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

  // Animación de pluma firmando el libro mientras se guarda la dedicatoria
  let signingAnimFrame = null;
  let isSubmittingSignature = false;

  function startSigningPenAnimation(authorName) {
    if (!bookSigningOverlay) return;
    if (signingAnimFrame) {
      cancelAnimationFrame(signingAnimFrame);
      signingAnimFrame = null;
    }

    if (bookSigningAuthorLabel) {
      bookSigningAuthorLabel.textContent = authorName ? `— ${authorName}` : '';
    }

    bookSigningOverlay.classList.add('is-active');
    bookSigningOverlay.setAttribute('aria-hidden', 'false');

    if (!bookSigningPath || !bookSigningPen || typeof bookSigningPath.getTotalLength !== 'function') {
      return;
    }

    const totalLen = bookSigningPath.getTotalLength();
    bookSigningPath.style.strokeDasharray = `${totalLen}`;
    bookSigningPath.style.strokeDashoffset = `${totalLen}`;

    const drawMs = 1150;
    const holdMs = 280;
    const cycleMs = drawMs + holdMs;
    const startedAt = performance.now();

    const step = (now) => {
      if (!bookSigningOverlay.classList.contains('is-active')) {
        signingAnimFrame = null;
        return;
      }

      const elapsed = (now - startedAt) % cycleMs;
      const rawT = Math.min(1, elapsed / drawMs);
      // Curva suave con sensación natural de pulso de mano
      const eased = rawT < 0.5
        ? 2 * rawT * rawT
        : 1 - Math.pow(-2 * rawT + 2, 2) / 2;

      const curLen = totalLen * eased;
      bookSigningPath.style.strokeDashoffset = `${(totalLen - curLen).toFixed(2)}`;

      const pt = bookSigningPath.getPointAtLength(curLen);
      const ptAhead = bookSigningPath.getPointAtLength(Math.min(totalLen, curLen + 2.5));
      const tilt = Math.max(-7, Math.min(7, (ptAhead.y - pt.y) * 2.1));

      bookSigningPen.setAttribute('transform', `translate(${pt.x.toFixed(2)} ${pt.y.toFixed(2)}) rotate(${tilt.toFixed(2)})`);
      if (bookSigningInkDot) {
        bookSigningInkDot.setAttribute('cx', pt.x.toFixed(2));
        bookSigningInkDot.setAttribute('cy', pt.y.toFixed(2));
        bookSigningInkDot.setAttribute('opacity', rawT < 1 ? '0.88' : '0');
      }

      signingAnimFrame = requestAnimationFrame(step);
    };

    signingAnimFrame = requestAnimationFrame(step);
  }

  function stopSigningPenAnimation() {
    if (signingAnimFrame) {
      cancelAnimationFrame(signingAnimFrame);
      signingAnimFrame = null;
    }
    if (bookSigningOverlay) {
      bookSigningOverlay.classList.remove('is-active');
      bookSigningOverlay.setAttribute('aria-hidden', 'true');
    }
  }

  if (guestbookForm) {
    guestbookForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (isSubmittingSignature) return;

      const author = guestbookAuthorInput ? guestbookAuthorInput.value.trim() : '';
      const message = guestbookMsgInput ? guestbookMsgInput.value.trim() : '';

      if (!author || !message) {
        showToast('Por favor escribe tu nombre y tu dedicatoria.', 'warning', 'Completa tu firma');
        return;
      }

      const submitBtn = guestbookForm.querySelector('button[type="submit"]');
      isSubmittingSignature = true;
      if (submitBtn) submitBtn.disabled = true;
      startSigningPenAnimation(author);

      const minAnimDelay = new Promise((resolve) => setTimeout(resolve, 1250));

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
          // Dejar que la pluma complete el trazo elegante antes de abrir la hoja con la nueva firma
          await minAnimDelay;
          stopSigningPenAnimation();
          showToast('¡Tu firma ha quedado guardada en el libro!', 'success', '¡Gracias por firmar!');
          if (guestbookMsgInput) guestbookMsgInput.value = '';
          if (data.entry) {
            celebratingSignatureId = Number(data.entry.id);
            clearTimeout(signatureCelebrationTimer);
            signatureCelebrationTimer = setTimeout(() => {
              celebratingSignatureId = null;
              document.querySelectorAll('.is-new-signature').forEach((entry) => entry.classList.remove('is-new-signature'));
              if (signatureRevealCleanup) signatureRevealCleanup();
            }, 12000);
            guestbookEntries = [data.entry, ...guestbookEntries.filter((x) => Number(x.id) !== Number(data.entry.id))];
          }
          currentBookPage = 1;
          setBookMode('read');
        } else {
          stopSigningPenAnimation();
          showToast(data.error || 'No se pudo guardar tu firma.', 'error', 'No se pudo guardar');
        }
      } catch (err) {
        stopSigningPenAnimation();
        showToast('Error de conexión al enviar tu firma.', 'error', 'Sin conexión');
      } finally {
        isSubmittingSignature = false;
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  // =====================================================================
  // INICIALIZACIÓN
  // =====================================================================
  initScrollNavigation();
  initPWA();
  initPreloader();
  initHeroSlideshow();
  initFallingPetals();
  initGuestbookChips();
  initBookSignatureTap();
  initGalleryInfiniteScroll();
  applyUploadClosedUI();
  checkGuestSession();

  if (standbyGrid) loadStandbyFromCache();
  if (galleryGrid) loadGallery(false);
  if (bookFlipHostWrap) loadGuestbook();
})();
