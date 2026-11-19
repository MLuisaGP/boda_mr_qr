/**
 * BODA MICHELLE & RENÉ — Interacción Web & App Móvil para Invitados
 */

(function () {
  'use strict';

  // Configuración
  const WEDDING_DATE = new Date('2026-12-19T18:00:00-07:00').getTime();
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
  const MAX_ITEMS = 25;

  let currentGuest = null;
  let currentFilter = 'all';

  // Elementos DOM
  const countdownDays = document.getElementById('cd-days');
  const countdownHours = document.getElementById('cd-hours');
  const countdownMins = document.getElementById('cd-mins');
  const countdownSecs = document.getElementById('cd-secs');

  const guestModal = document.getElementById('guestModal');
  const guestModalClose = document.getElementById('guestModalClose');
  const guestModalCurrentName = document.getElementById('guestModalCurrentName');
  const guestNameInput = document.getElementById('guestNameInput');
  const guestForm = document.getElementById('guestForm');
  const guestDisplayBadge = document.getElementById('guestDisplayBadge');
  const guestDisplayName = document.getElementById('guestDisplayName');
  const guestQuotaText = document.getElementById('guestQuotaText');
  const btnRefreshGallery = document.getElementById('btnRefreshGallery');

  const btnUploadFromDevice = document.getElementById('btnUploadFromDevice');
  const btnCaptureFromCamera = document.getElementById('btnCaptureFromCamera');
  const btnCapturePhoto = document.getElementById('btnCapturePhoto');
  const btnCaptureVideo = document.getElementById('btnCaptureVideo');
  const uploadDropzone = document.getElementById('uploadDropzone');
  const inputUploadDevice = document.getElementById('inputUploadDevice');
  const inputNativePhoto = document.getElementById('inputNativePhoto');
  const inputNativeVideo = document.getElementById('inputNativeVideo');

  // Elementos de la Cámara en Vivo
  const cameraModal = document.getElementById('cameraModal');
  const cameraVideo = document.getElementById('cameraVideo');
  const cameraCanvas = document.getElementById('cameraCanvas');
  const cameraFlash = document.getElementById('cameraFlash');
  const cameraRecBadge = document.getElementById('cameraRecBadge');
  const cameraRecTimer = document.getElementById('cameraRecTimer');
  const cameraPreviewOverlay = document.getElementById('cameraPreviewOverlay');
  const cameraPreviewImg = document.getElementById('cameraPreviewImg');
  const cameraPreviewVideo = document.getElementById('cameraPreviewVideo');
  const btnCameraRetake = document.getElementById('btnCameraRetake');
  const btnCameraConfirm = document.getElementById('btnCameraConfirm');
  const btnCameraShutter = document.getElementById('btnCameraShutter');
  const btnCameraRecord = document.getElementById('btnCameraRecord');
  const btnCameraFlip = document.getElementById('btnCameraFlip');
  const btnCameraClose = document.getElementById('btnCameraClose');
  const modePhotoBtn = document.getElementById('modePhotoBtn');
  const modeVideoBtn = document.getElementById('modeVideoBtn');
  const btnLaunchNativePhoto = document.getElementById('btnLaunchNativePhoto');
  const btnLaunchNativeVideo = document.getElementById('btnLaunchNativeVideo');

  // Cuadro desplegado elegante para elegir Foto o Video
  const cameraMobileSheet = document.getElementById('cameraMobileSheet');
  const btnSheetPhoto = document.getElementById('btnSheetPhoto');
  const btnSheetVideo = document.getElementById('btnSheetVideo');
  const btnSheetCancel = document.getElementById('btnSheetCancel');

  let cameraStream = null;
  let currentFacingMode = 'environment';
  let currentCameraMode = 'photo';
  let mediaRecorder = null;
  let recordedChunks = [];
  let recordTimerInterval = null;
  let recordSeconds = 0;
  let pendingCapturedBlob = null;
  let pendingCapturedType = 'image';
  let pendingUploadFile = null;

  // Caché en memoria para cambio instantáneo de pestañas (0 ms)
  let allMediaCache = [];

  const uploadProgress = document.getElementById('uploadProgress');
  const progressBarFill = document.getElementById('progressBarFill');
  const progressText = document.getElementById('progressText');

  const galleryGrid = document.getElementById('galleryGrid');
  const galleryEmpty = document.getElementById('galleryEmpty');
  const galleryTabs = document.querySelectorAll('.tab-btn');

  const guestbookForm = document.getElementById('guestbookForm');
  const guestbookList = document.getElementById('guestbookList');
  const guestbookAuthorInput = document.getElementById('gbAuthor');
  const guestbookMsgInput = document.getElementById('gbMessage');

  const lightbox = document.getElementById('gallery-lightbox') || document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxVideo = document.getElementById('lightboxVideo');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const lightboxAuthor = document.getElementById('lightboxAuthor');
  const lightboxLikeBtn = document.getElementById('lightboxLikeBtn');
  const lightboxLikeCount = document.getElementById('lightboxLikeCount');
  const lightboxDownloadBtn = document.getElementById('lightboxDownloadBtn');
  const lightboxDeleteBtn = document.getElementById('lightboxDeleteBtn');
  const btnGalleryUploadMain = document.getElementById('btnGalleryUploadMain');
  const btnGalleryCameraMain = document.getElementById('btnGalleryCameraMain');
  let currentLightboxItems = [];
  let currentLightboxIndex = 0;

  const toastContainer = document.getElementById('toastContainer');

  // =====================================================================
  // PRELOADER INTERACTIVO DE LUJO (INSPIRADO EN WEDDING.JONGJEONGLEE.COM)
  // Monograma MyR y anillo circular progresivo con porcentaje 0% - 100%
  // =====================================================================
  function initPreloader() {
    const preloader = document.getElementById('interactive-preloader');
    if (!preloader) {
      document.body.classList.remove('loading');
      return;
    }

    const percentageEl = document.getElementById('preloader-percentage');
    const ringCircle = document.getElementById('preloader-ring-circle');
    const skipBtn = document.getElementById('pl-skip-btn');
    const totalLength = 1320; // 2 * PI * 210

    let progress = 0;
    let isFinished = false;

    function setProgress(val) {
      val = Math.min(100, Math.max(0, Math.round(val)));
      if (percentageEl) percentageEl.textContent = val + '%';
      if (ringCircle) {
        const offset = totalLength - (totalLength * (val / 100));
        ringCircle.style.strokeDashoffset = offset;
      }
    }

    function dismissPreloader() {
      if (isFinished) return;
      isFinished = true;
      setProgress(100);

      setTimeout(() => {
        preloader.classList.add('is-hidden');
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');
        setTimeout(() => {
          if (preloader && preloader.parentNode) preloader.parentNode.removeChild(preloader);
        }, 700);
      }, 200);
    }

    if (skipBtn) {
      skipBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dismissPreloader();
      });
    }

    preloader.addEventListener('click', (e) => {
      dismissPreloader();
    });

    // Simulación progresiva fluida inmediata
    const interval = setInterval(() => {
      if (progress < 90) {
        const step = Math.max(2, Math.floor((94 - progress) / 5));
        progress += step;
        setProgress(progress);
      }
    }, 35);

    const completeLoad = () => {
      const finishTimer = setInterval(() => {
        progress += 5;
        if (progress >= 100) {
          clearInterval(finishTimer);
          clearInterval(interval);
          dismissPreloader();
        } else {
          setProgress(progress);
        }
      }, 15);
    };

    if (document.readyState === 'complete') {
      completeLoad();
    } else {
      window.addEventListener('load', completeLoad);
    }

    // Límite de seguridad
    setTimeout(() => {
      clearInterval(interval);
      dismissPreloader();
    }, 2000);
  }

  // Lanzar el preloader de inmediato
  initPreloader();

  // =====================================================================
  // 1. SISTEMA DE ALERTAS Y NOTIFICACIONES ELEGANTES
  // =====================================================================
  function showToast(message, type = 'info', title = '') {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = '✦';
    if (type === 'success') icon = '✓';
    if (type === 'error') icon = '✕';

    const defaultTitle = type === 'success' ? '¡Excelente!' : (type === 'error' ? 'Atención' : 'Información');

    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-content">
        <div class="toast-title">${title || defaultTitle}</div>
        <div class="toast-msg">${message}</div>
      </div>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(40px)';
      setTimeout(() => toast.remove(), 400);
    }, 4500);
  }

  // =====================================================================
  // 2. CUENTA REGRESIVA ROMÁNTICA
  // =====================================================================
  function updateCountdown() {
    const now = Date.now();
    const distance = Math.max(0, WEDDING_DATE - now);

    const d = Math.floor(distance / (1000 * 60 * 60 * 24));
    const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((distance % (1000 * 60)) / 1000);

    if (countdownDays) countdownDays.textContent = String(d).padStart(2, '0');
    if (countdownHours) countdownHours.textContent = String(h).padStart(2, '0');
    if (countdownMins) countdownMins.textContent = String(m).padStart(2, '0');
    if (countdownSecs) countdownSecs.textContent = String(s).padStart(2, '0');
  }
  setInterval(updateCountdown, 1000);
  updateCountdown();

  // =====================================================================
  // 3. IDENTIFICACIÓN Y SESIÓN DEL INVITADO
  // =====================================================================
  async function checkGuestSession() {
    const savedToken = localStorage.getItem('mr_guest_token');
    try {
      const res = await fetch('/api/auth/guest-me', {
        headers: savedToken ? { 'X-Guest-Token': savedToken } : {}
      });
      const data = await res.json();
      if (data.success && data.guest) {
        setGuestSession(data.guest);
      } else {
        promptGuestName();
      }
    } catch (e) {
      promptGuestName();
    }
  }

  function promptGuestName(canClose = false) {
    if (!guestModal) return;
    const existingName = localStorage.getItem('mr_guest_name') || (currentGuest ? currentGuest.name : '');
    if (guestNameInput && existingName) {
      guestNameInput.value = existingName;
    }
    if (guestModalCurrentName) {
      if (existingName) {
        guestModalCurrentName.textContent = existingName;
        const infoWrap = guestModalCurrentName.closest('.modal-current-info');
        if (infoWrap) infoWrap.style.display = 'block';
      } else {
        const infoWrap = guestModalCurrentName.closest('.modal-current-info');
        if (infoWrap) infoWrap.style.display = 'none';
      }
    }
    if (guestModalClose) {
      guestModalClose.style.display = (canClose || Boolean(existingName)) ? 'grid' : 'none';
    }
    guestModal.classList.add('active');
  }

  function closeGuestModal() {
    if (guestModal) guestModal.classList.remove('active');
  }

  if (guestModalClose) {
    guestModalClose.addEventListener('click', closeGuestModal);
  }

  if (guestModal) {
    guestModal.addEventListener('click', (e) => {
      const existingName = localStorage.getItem('mr_guest_name') || (currentGuest ? currentGuest.name : '');
      if (e.target === guestModal && existingName) {
        closeGuestModal();
      }
    });
  }

  // Exportar funciones de modal a window para uso en onclick
  window.promptGuestName = promptGuestName;
  window.closeGuestModal = closeGuestModal;

  function setGuestSession(guest) {
    currentGuest = guest;
    localStorage.setItem('mr_guest_token', guest.token);
    localStorage.setItem('mr_guest_name', guest.name);

    if (guestModal) guestModal.classList.remove('active');

    if (guestDisplayName) guestDisplayName.textContent = guest.name;
    if (guestDisplayBadge) guestDisplayBadge.style.display = 'inline-flex';
    if (guestQuotaText) {
      guestQuotaText.textContent = `${guest.item_count} de ${guest.max_items || MAX_ITEMS} recuerdos`;
    }
    if (guestbookAuthorInput && !guestbookAuthorInput.value) {
      guestbookAuthorInput.value = guest.name;
    }

    if (pendingUploadFile) {
      const fileToUpload = pendingUploadFile;
      pendingUploadFile = null;
      handleFileUpload(fileToUpload);
    }

    loadGallery();
  }

  if (guestForm) {
    guestForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = guestNameInput.value.trim();
      if (!name) {
        showToast('Por favor escribe tu nombre para continuar.', 'error');
        return;
      }

      const existingToken = localStorage.getItem('mr_guest_token') || '';

      try {
        const res = await fetch('/api/auth/guest-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name,
            token: existingToken
          })
        });

        const data = await res.json();
        if (data.success) {
          setGuestSession(data.guest);
          showToast(`¡Bienvenido a la celebración, ${data.guest.name}!`, 'success');
        } else {
          showToast(data.error || 'No se pudo iniciar sesión', 'error');
        }
      } catch (err) {
        showToast('Error de conexión al servidor.', 'error');
      }
    });
  }

  // =====================================================================
  // 4. CÁMARA EN VIVO & SUBIDA DE FOTOS Y VIDEOS (MÁX 2MB & 25 ELEMENTOS)
  // =====================================================================

  // GESTIÓN DEL STREAM DE LA CÁMARA EN VIVO
  async function startCameraStream(facingMode = 'environment') {
    stopCameraStream();
    currentFacingMode = facingMode;

    try {
      const isVideoMode = (currentCameraMode === 'video');
      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: isVideoMode
      };

      cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
      if (cameraVideo) {
        cameraVideo.srcObject = cameraStream;
        await cameraVideo.play();
      }
      return true;
    } catch (err) {
      console.warn('getUserMedia con constraints ideales falló, intentando fallback básico:', err);
      try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: (currentCameraMode === 'video')
        });
        if (cameraVideo) {
          cameraVideo.srcObject = cameraStream;
          await cameraVideo.play();
        }
        return true;
      } catch (fallbackErr) {
        console.error('No se pudo acceder a la cámara mediante WebRTC:', fallbackErr);
        return false;
      }
    }
  }

  function stopCameraStream() {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => {
        try { track.stop(); } catch (e) {}
      });
      cameraStream = null;
    }
    if (cameraVideo) {
      cameraVideo.srcObject = null;
    }
    stopRecording(false);
  }

  async function openCameraModal() {
    if (!currentGuest) {
      promptGuestName();
      showToast('Por favor escribe tu nombre antes de capturar tu recuerdo.', 'info');
      return;
    }

    if (cameraPreviewOverlay) cameraPreviewOverlay.style.display = 'none';
    pendingCapturedBlob = null;

    if (cameraModal) cameraModal.classList.add('active');

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const ok = await startCameraStream(currentFacingMode);
      if (!ok) {
        showToast('Abriendo la cámara nativa de tu dispositivo...', 'info');
        if (inputNativePhoto) inputNativePhoto.click();
      }
    } else {
      if (inputNativePhoto) inputNativePhoto.click();
    }
  }

  function closeCameraModal() {
    stopCameraStream();
    if (cameraModal) cameraModal.classList.remove('active');
    if (cameraPreviewOverlay) cameraPreviewOverlay.style.display = 'none';
    if (cameraPreviewVideo) {
      cameraPreviewVideo.pause();
      cameraPreviewVideo.src = '';
    }
    pendingCapturedBlob = null;
  }

  function snapPhoto() {
    if (!cameraVideo || !cameraCanvas) return;

    if (cameraFlash) {
      cameraFlash.classList.add('flash-active');
      setTimeout(() => cameraFlash.classList.remove('flash-active'), 150);
    }

    const vw = cameraVideo.videoWidth || 1280;
    const vh = cameraVideo.videoHeight || 720;
    cameraCanvas.width = vw;
    cameraCanvas.height = vh;
    const ctx = cameraCanvas.getContext('2d');

    if (currentFacingMode === 'user') {
      ctx.translate(vw, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(cameraVideo, 0, 0, vw, vh);

    cameraCanvas.toBlob((blob) => {
      if (!blob) return;
      pendingCapturedBlob = blob;
      pendingCapturedType = 'image';

      const url = URL.createObjectURL(blob);
      if (cameraPreviewImg) {
        cameraPreviewImg.src = url;
        cameraPreviewImg.style.display = 'block';
      }
      if (cameraPreviewVideo) cameraPreviewVideo.style.display = 'none';
      if (cameraPreviewOverlay) cameraPreviewOverlay.style.display = 'flex';
    }, 'image/jpeg', 0.90);
  }

  function startRecording() {
    if (!cameraStream) return;
    recordedChunks = [];

    let mimeType = 'video/webm;codecs=vp9';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/mp4';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = '';
        }
      }
    }

    try {
      const options = mimeType ? { mimeType } : {};
      mediaRecorder = new MediaRecorder(cameraStream, options);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        clearInterval(recordTimerInterval);
        if (cameraRecBadge) cameraRecBadge.style.display = 'none';
        if (btnCameraRecord) btnCameraRecord.classList.remove('recording');

        const blobType = mediaRecorder.mimeType || 'video/webm';
        const blob = new Blob(recordedChunks, { type: blobType });
        pendingCapturedBlob = blob;
        pendingCapturedType = 'video';

        const videoUrl = URL.createObjectURL(blob);
        if (cameraPreviewVideo) {
          cameraPreviewVideo.src = videoUrl;
          cameraPreviewVideo.style.display = 'block';
        }
        if (cameraPreviewImg) cameraPreviewImg.style.display = 'none';
        if (cameraPreviewOverlay) cameraPreviewOverlay.style.display = 'flex';
      };

      mediaRecorder.start(100);
      if (btnCameraRecord) btnCameraRecord.classList.add('recording');
      if (cameraRecBadge) cameraRecBadge.style.display = 'flex';

      recordSeconds = 0;
      if (cameraRecTimer) cameraRecTimer.textContent = '00:00';
      recordTimerInterval = setInterval(() => {
        recordSeconds++;
        const mins = String(Math.floor(recordSeconds / 60)).padStart(2, '0');
        const secs = String(recordSeconds % 60).padStart(2, '0');
        if (cameraRecTimer) cameraRecTimer.textContent = `${mins}:${secs}`;

        // Límite de seguridad: 15 segundos para mantener < 2MB
        if (recordSeconds >= 15) {
          stopRecording(true);
        }
      }, 1000);

    } catch (err) {
      showToast('Grabando mediante la cámara nativa de tu dispositivo...', 'info');
      if (inputNativeVideo) inputNativeVideo.click();
    }
  }

  function stopRecording(save = true) {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      if (!save) {
        mediaRecorder.ondataavailable = null;
        mediaRecorder.onstop = null;
      }
      mediaRecorder.stop();
    }
    clearInterval(recordTimerInterval);
    if (cameraRecBadge) cameraRecBadge.style.display = 'none';
    if (btnCameraRecord) btnCameraRecord.classList.remove('recording');
  }

  // BOTÓN 1: Subir archivos desde el dispositivo
  if (btnUploadFromDevice && inputUploadDevice) {
    btnUploadFromDevice.addEventListener('click', (e) => {
      e.stopPropagation();
      inputUploadDevice.click();
    });

    inputUploadDevice.addEventListener('change', () => {
      if (inputUploadDevice.files && inputUploadDevice.files.length > 0) {
        handleFileUpload(inputUploadDevice.files[0]);
      }
    });
  }

  // DROPZONE INTERACTIVO (Arrastrar y soltar o clic)
  if (uploadDropzone) {
    ['dragenter', 'dragover'].forEach(eventName => {
      uploadDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadDropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      uploadDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadDropzone.classList.remove('dragover');
      });
    });

    uploadDropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      if (dt && dt.files && dt.files.length > 0) {
        handleFileUpload(dt.files[0]);
      }
    });

    uploadDropzone.addEventListener('click', (e) => {
      // Si el usuario hace clic en el área del dropzone (pero no directamente en los botones)
      if (e.target.closest('#btnUploadFromDevice') || e.target.closest('#btnCaptureFromCamera')) {
        return;
      }
      if (inputUploadDevice) {
        inputUploadDevice.click();
      }
    });
  }

  function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 768 && ('ontouchstart' in window || navigator.maxTouchPoints > 0));
  }

  function openCameraForPhoto() {
    if (isMobileDevice()) {
      // En celular móvil: abrir DIRECTAMENTE la cámara fotográfica del sistema
      if (inputNativePhoto) {
        inputNativePhoto.click();
      }
      return;
    }

    // En computadora / laptop: abrir el visor de cámara web en modo foto
    currentCameraMode = 'photo';
    if (modePhotoBtn) modePhotoBtn.classList.add('active');
    if (modeVideoBtn) modeVideoBtn.classList.remove('active');
    if (btnCameraShutter) btnCameraShutter.style.display = 'grid';
    if (btnCameraRecord) btnCameraRecord.style.display = 'none';
    openCameraModal();
  }

  function openCameraForVideo() {
    if (isMobileDevice()) {
      // En celular móvil: abrir DIRECTAMENTE la cámara de video del sistema
      if (inputNativeVideo) {
        inputNativeVideo.click();
      }
      return;
    }

    // En computadora / laptop: abrir el visor de cámara web en modo video
    currentCameraMode = 'video';
    if (modeVideoBtn) modeVideoBtn.classList.add('active');
    if (modePhotoBtn) modePhotoBtn.classList.remove('active');
    if (btnCameraShutter) btnCameraShutter.style.display = 'none';
    if (btnCameraRecord) btnCameraRecord.style.display = 'grid';
    openCameraModal();
  }

  // Exportar para llamadas directas
  window.openCameraForPhoto = openCameraForPhoto;
  window.openCameraForVideo = openCameraForVideo;
  window.openCameraAction = openCameraAction;
  window.closeMobileSheet = closeMobileSheet;

  function openCameraAction() {
    if (cameraMobileSheet) {
      cameraMobileSheet.classList.add('active');
    }
  }

  function closeMobileSheet() {
    if (cameraMobileSheet) {
      cameraMobileSheet.classList.remove('active');
    }
  }

  // BOTÓN PRINCIPAL DE CÁMARA: Despliega el cuadro bonito para elegir Foto o Video
  if (btnCaptureFromCamera) {
    btnCaptureFromCamera.addEventListener('click', (e) => {
      e.stopPropagation();
      openCameraAction();
    });
  }

  // BOTÓN DE CÁMARA DEL PANEL DE NAVEGACIÓN MÓVIL (En barra inferior)
  const navCameraFabs = document.querySelectorAll('.mobile-upload-fab, #navCameraFab');
  navCameraFabs.forEach(fab => {
    fab.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openCameraAction();
    });
  });

  // BOTÓN CANCELAR DEL CUADRO DESPLEGABLE
  if (btnSheetCancel) {
    btnSheetCancel.addEventListener('click', (e) => {
      e.stopPropagation();
      closeMobileSheet();
    });
  }

  // CERRAR SI SE TOCA EL FONDO OSCURO DEL CUADRO DESPLEGABLE
  if (cameraMobileSheet) {
    cameraMobileSheet.addEventListener('click', (e) => {
      if (e.target === cameraMobileSheet) {
        closeMobileSheet();
      }
    });
  }

  // OPCIÓN 1: TOMAR FOTO CON LA CÁMARA (Dentro del cuadro desplegado)
  if (btnSheetPhoto) {
    btnSheetPhoto.addEventListener('click', (e) => {
      closeMobileSheet();
      if (!isMobileDevice()) {
        e.preventDefault();
        openCameraForPhoto();
      }
    });
  }

  // OPCIÓN 2: GRABAR VIDEO CON LA CÁMARA (Dentro del cuadro desplegado)
  if (btnSheetVideo) {
    btnSheetVideo.addEventListener('click', (e) => {
      closeMobileSheet();
      if (!isMobileDevice()) {
        e.preventDefault();
        openCameraForVideo();
      }
    });
  }

  // CONTROLES Y DISPARADORES DENTRO DEL MODAL DE CÁMARA (ESCRITORIO)
  if (btnCameraShutter) {
    btnCameraShutter.addEventListener('click', snapPhoto);
  }

  if (btnCameraRecord) {
    btnCameraRecord.addEventListener('click', () => {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        stopRecording(true);
      } else {
        startRecording();
      }
    });
  }

  if (btnCameraFlip) {
    btnCameraFlip.addEventListener('click', () => {
      currentFacingMode = (currentFacingMode === 'environment') ? 'user' : 'environment';
      startCameraStream(currentFacingMode);
    });
  }

  if (btnCameraClose) {
    btnCameraClose.addEventListener('click', closeCameraModal);
  }

  if (modePhotoBtn && modeVideoBtn) {
    modePhotoBtn.addEventListener('click', () => {
      currentCameraMode = 'photo';
      modePhotoBtn.classList.add('active');
      modeVideoBtn.classList.remove('active');
      if (btnCameraShutter) btnCameraShutter.style.display = 'grid';
      if (btnCameraRecord) btnCameraRecord.style.display = 'none';
      startCameraStream(currentFacingMode);
    });

    modeVideoBtn.addEventListener('click', () => {
      currentCameraMode = 'video';
      modeVideoBtn.classList.add('active');
      modePhotoBtn.classList.remove('active');
      if (btnCameraShutter) btnCameraShutter.style.display = 'none';
      if (btnCameraRecord) btnCameraRecord.style.display = 'grid';
      startCameraStream(currentFacingMode);
    });
  }

  if (btnCameraConfirm) {
    btnCameraConfirm.addEventListener('click', () => {
      if (!pendingCapturedBlob) return;
      const isVideo = (pendingCapturedType === 'video');
      const ext = isVideo ? 'webm' : 'jpg';
      const mime = isVideo ? (pendingCapturedBlob.type || 'video/webm') : 'image/jpeg';
      const file = new File([pendingCapturedBlob], `boda_mr_${Date.now()}.${ext}`, { type: mime });

      closeCameraModal();
      handleFileUpload(file);
    });
  }

  if (btnCameraRetake) {
    btnCameraRetake.addEventListener('click', () => {
      if (cameraPreviewOverlay) cameraPreviewOverlay.style.display = 'none';
      if (cameraPreviewVideo) {
        cameraPreviewVideo.pause();
        cameraPreviewVideo.src = '';
      }
      pendingCapturedBlob = null;
    });
  }

  // ACCESO DIRECTO A CÁMARAS NATIVAS DEL DISPOSITIVO
  if (btnLaunchNativePhoto && inputNativePhoto) {
    btnLaunchNativePhoto.addEventListener('click', () => {
      inputNativePhoto.click();
    });
  }

  if (btnLaunchNativeVideo && inputNativeVideo) {
    btnLaunchNativeVideo.addEventListener('click', () => {
      inputNativeVideo.click();
    });
  }

  if (inputNativePhoto) {
    inputNativePhoto.addEventListener('change', () => {
      if (inputNativePhoto.files && inputNativePhoto.files.length > 0) {
        closeCameraModal();
        handleFileUpload(inputNativePhoto.files[0]);
      }
    });
  }

  if (inputNativeVideo) {
    inputNativeVideo.addEventListener('change', () => {
      if (inputNativeVideo.files && inputNativeVideo.files.length > 0) {
        closeCameraModal();
        handleFileUpload(inputNativeVideo.files[0]);
      }
    });
  }

  function handleFileUpload(file) {
    if (!currentGuest) {
      pendingUploadFile = file;
      promptGuestName();
      showToast('Por favor escribe tu nombre para guardar tu recuerdo.', 'info');
      return;
    }

    // Función auxiliar para resetear inputs
    const resetInputs = () => {
      if (inputUploadDevice) inputUploadDevice.value = '';
      if (inputNativePhoto) inputNativePhoto.value = '';
      if (inputNativeVideo) inputNativeVideo.value = '';
    };

    // Validación de tamaño (Máx 2 MB estrictos)
    if (file.size > MAX_FILE_SIZE) {
      const mbSize = (file.size / (1024 * 1024)).toFixed(1);
      showToast(
        `Tu archivo pesa ${mbSize} MB. El tamaño máximo permitido es de 2 MB. Puedes comprimirlo o elegir otra foto.`,
        'error',
        'Archivo demasiado pesado'
      );
      resetInputs();
      return;
    }

    // Validación de cupo (Máx 25 elementos)
    if (currentGuest.item_count >= MAX_ITEMS) {
      showToast(
        `Ya has alcanzado tu límite de ${MAX_ITEMS} recuerdos compartidos. Puedes eliminar alguno anterior si deseas subir este nuevo.`,
        'error',
        'Límite de recuerdos alcanzado'
      );
      resetInputs();
      return;
    }

    // Progreso interactivo de subida
    const formData = new FormData();
    const fileName = file.name || (`recuerdo_${Date.now()}.${file.type && file.type.includes('video') ? 'webm' : 'jpg'}`);
    formData.append('file', file, fileName);
    formData.append('action', 'upload');

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/media', true);
    if (currentGuest.token) {
      xhr.setRequestHeader('X-Guest-Token', currentGuest.token);
    }

    if (uploadProgress) uploadProgress.style.display = 'block';

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        if (progressBarFill) progressBarFill.style.width = percent + '%';
        if (progressText) progressText.textContent = `Subiendo momento especial... ${percent}%`;
      }
    };

    xhr.onload = () => {
      if (uploadProgress) uploadProgress.style.display = 'none';
      if (progressBarFill) progressBarFill.style.width = '0%';
      resetInputs();

      try {
        const res = JSON.parse(xhr.responseText);
        if (xhr.status === 201 && res.success) {
          showToast('¡Tu recuerdo se ha compartido en la galería!', 'success');
          if (res.guest_item_count !== undefined) {
            currentGuest.item_count = res.guest_item_count;
            if (guestQuotaText) {
              guestQuotaText.textContent = `${currentGuest.item_count} de ${MAX_ITEMS} recuerdos`;
            }
          }
          loadGallery();
        } else {
          showToast(res.error || 'Error al procesar el archivo.', 'error');
        }
      } catch (err) {
        showToast('Error inesperado al subir.', 'error');
      }
    };

    xhr.onerror = () => {
      if (uploadProgress) uploadProgress.style.display = 'none';
      showToast('Error en la conexión con el servidor.', 'error');
    };

    xhr.send(formData);
  }

  // =====================================================================
  // 5. CARGA Y GESTIÓN DE LA GALERÍA (INSTANTÁNEA CON CACHÉ LOCAL)
  // =====================================================================
  function formatTimeAgo(dateString) {
    if (!dateString) return 'Reciente';
    try {
      const date = new Date(dateString.replace(' ', 'T'));
      const now = new Date();
      const diffSec = Math.floor((now - date) / 1000);
      if (isNaN(diffSec) || diffSec < 0) return 'Reciente';
      if (diffSec < 60) return 'Hace un momento';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `Hace ${diffMin} min`;
      const diffHour = Math.floor(diffMin / 60);
      if (diffHour < 24) return `Hace ${diffHour} h`;
      const diffDay = Math.floor(diffHour / 24);
      return `Hace ${diffDay} d`;
    } catch (e) {
      return 'Reciente';
    }
  }

  function getFilteredItems(filter, items) {
    if (!items || !Array.isArray(items)) return [];
    if (filter === 'popular') {
      // Solo recuerdos con 1 o más likes, ordenados de mayor a menor
      return items
        .filter(i => (Number(i.likes_count) || 0) > 0)
        .sort((a, b) => (Number(b.likes_count) || 0) - (Number(a.likes_count) || 0));
    }
    if (filter === 'my') {
      return items.filter(i => {
        if (i.is_owner) return true;
        if (currentGuest && Number(i.guest_id) === Number(currentGuest.id)) return true;
        return false;
      });
    }
    return items;
  }

  function renderGallery(items) {
    if (!galleryGrid) return;
    galleryGrid.innerHTML = '';

    const emptyTextMap = {
      popular: {
        title: '¡Aún no hay fotos con "Me Gusta"!',
        desc: 'Sé el primero en darle like ♥ a tus fotos y videos favoritos de la boda para verlos aquí destacados.'
      },
      my: {
        title: 'Aún no has compartido recuerdos',
        desc: 'Captura un momento inolvidable con tu cámara o súbelo desde tu celular.'
      },
      all: {
        title: 'Aún no hay fotos en esta sección',
        desc: 'Sé el primero en estrenar el álbum de la boda compartiendo tu fotografía o video.'
      }
    };

    if (!items || items.length === 0) {
      if (galleryEmpty) {
        galleryEmpty.style.display = 'flex';
        const emptyTitle = galleryEmpty.querySelector('.gallery-empty-title') || galleryEmpty.querySelector('p:first-child');
        const emptyDesc = galleryEmpty.querySelector('.gallery-empty-desc') || galleryEmpty.querySelector('p:nth-child(2)');
        const copy = emptyTextMap[currentFilter] || emptyTextMap.all;
        if (emptyTitle) emptyTitle.textContent = copy.title;
        if (emptyDesc) emptyDesc.textContent = copy.desc;
      }
      return;
    }

    if (galleryEmpty) galleryEmpty.style.display = 'none';

    items.forEach((item, index) => {
      const card = document.createElement('article');
      card.className = 'gallery-grid-item';
      card.dataset.id = item.id;

      const isVideo = item.media_type === 'video';
      const isOwner = item.is_owner || (currentGuest && Number(item.guest_id) === Number(currentGuest.id));

      card.innerHTML = `
        <div class="gallery-item-aspect">
          ${isVideo ? `
            <video class="gallery-item-media" src="${item.url}" preload="metadata" muted playsinline></video>
            <div class="gallery-video-indicator" title="Video">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            </div>
          ` : `
            <img class="gallery-item-media" src="${item.url}" alt="${item.original_name || 'Recuerdo de boda'}" loading="lazy" />
          `}

          <div class="gallery-item-overlay">
            <div class="gallery-overlay-top">
              ${isOwner ? `
                <button type="button" class="gallery-owner-badge btn-delete-badge" data-id="${item.id}" title="Eliminar mi foto">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              ` : ''}
            </div>
            <div class="gallery-overlay-bottom">
              <span class="gallery-item-author" title="${item.guest_name}">${item.guest_name}</span>
              <button type="button" class="gallery-item-like btn-like ${item.has_liked ? 'liked' : ''}" data-id="${item.id}" title="Dar like">
                <span class="like-heart">${item.has_liked ? '♥' : '♡'}</span>
                <span class="like-cnt">${item.likes_count || 0}</span>
              </button>
            </div>
          </div>
        </div>
      `;

      // Clic para abrir Lightbox cinematográfico
      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-delete-badge')) return;
        if (e.target.closest('.btn-like')) return;
        openLightboxAtIndex(index, items);
      });

      // Botón de Like dentro de la tarjeta
      const likeBtn = card.querySelector('.btn-like');
      if (likeBtn) {
        likeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleLike(item.id, likeBtn);
        });
      }

      // Botón de Eliminar foto propia
      const delBtn = card.querySelector('.btn-delete-badge');
      if (delBtn) {
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          deleteMyMedia(item.id);
        });
      }

      galleryGrid.appendChild(card);

      // Entrada suave y escalonada de las tarjetas
      requestAnimationFrame(() => {
        setTimeout(() => {
          card.classList.add('visible');
        }, Math.min(index * 30, 600));
      });
    });
  }

  // Pestañas de filtrado con respuesta INSTANTÁNEA (0 ms, sin parpadeos ni recargas de red)
  const allTabs = document.querySelectorAll('.tab-btn, .gallery-tab-item');
  allTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      allTabs.forEach(t => t.classList.remove('active'));
      const filter = tab.dataset.filter || 'all';
      currentFilter = filter;
      document.querySelectorAll(`[data-filter="${filter}"]`).forEach(t => t.classList.add('active'));

      // Filtrado instantáneo desde memoria local precargada
      renderGallery(getFilteredItems(currentFilter, allMediaCache));
    });
  });

  // Acciones en la cabecera de la galería
  if (btnGalleryUploadMain && inputUploadDevice) {
    btnGalleryUploadMain.addEventListener('click', () => {
      inputUploadDevice.click();
    });
  }
  if (btnGalleryCameraMain) {
    btnGalleryCameraMain.addEventListener('click', () => {
      if (window.openCameraAction) {
        window.openCameraAction();
      } else {
        const sheet = document.getElementById('cameraMobileSheet');
        if (sheet) sheet.classList.add('active');
        else if (inputNativePhoto) inputNativePhoto.click();
      }
    });
  }

  // Precargar imágenes en segundo plano para que al cambiar de pestaña no haya demora
  function preloadImages(items) {
    if (!Array.isArray(items)) return;
    items.forEach(item => {
      if (item.media_type !== 'video' && item.url) {
        const img = new Image();
        img.src = item.url;
      }
    });
  }

  async function loadGallery(silent = false) {
    if (!galleryGrid) return;

    // Si ya tenemos datos en caché y no es refresco explícito, usar caché
    if (!silent && allMediaCache && allMediaCache.length > 0) {
      renderGallery(getFilteredItems(currentFilter, allMediaCache));
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
        preloadImages(data.items);

        if (data.guest_item_count !== undefined && currentGuest) {
          currentGuest.item_count = data.guest_item_count;
          if (guestQuotaText) {
            guestQuotaText.textContent = `${data.guest_item_count} de ${MAX_ITEMS} recuerdos`;
          }
        }
      }
    } catch (e) {
      console.error('Error cargando galería:', e);
    }
  }

  // Toggle Like Optimista e Instantáneo
  async function toggleLike(mediaId, btnElement) {
    const target = allMediaCache.find(i => Number(i.id) === Number(mediaId));
    let newHasLiked = true;
    let newCount = 1;

    if (target) {
      target.has_liked = !target.has_liked;
      target.likes_count = target.has_liked ? (Number(target.likes_count) + 1) : Math.max(0, Number(target.likes_count) - 1);
      newHasLiked = target.has_liked;
      newCount = target.likes_count;
    }

    btnElement.classList.toggle('liked', newHasLiked);
    const heart = btnElement.querySelector('.like-heart');
    const cnt = btnElement.querySelector('.like-cnt');
    if (heart) heart.textContent = newHasLiked ? '♥' : '♡';
    if (cnt) cnt.textContent = newCount;

    // Si estamos en la pestaña "popular", refrescar de inmediato
    if (currentFilter === 'popular') {
      renderGallery(getFilteredItems('popular', allMediaCache));
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
        if (cnt) cnt.textContent = data.likes_count;
      }
    } catch (e) {
      console.error('Error al dar like:', e);
    }
  }

  // Eliminar propia foto con confirmación
  async function deleteMyMedia(mediaId) {
    if (!confirm('¿Deseas eliminar este recuerdo del álbum de la boda?')) {
      return;
    }

    // Eliminación optimista inmediata en memoria local
    allMediaCache = allMediaCache.filter(i => Number(i.id) !== Number(mediaId));
    renderGallery(getFilteredItems(currentFilter, allMediaCache));

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
        showToast('Recuerdo eliminado de la galería.', 'info');
        if (data.guest_item_count !== undefined && currentGuest) {
          currentGuest.item_count = data.guest_item_count;
          if (guestQuotaText) {
            guestQuotaText.textContent = `${data.guest_item_count} de ${MAX_ITEMS} recuerdos`;
          }
        }
      } else {
        showToast(data.error || 'No se pudo eliminar el archivo.', 'error');
        loadGallery(false);
      }
    } catch (e) {
      showToast('Error de conexión.', 'error');
      loadGallery(false);
    }
  }

  // =====================================================================
  // 6. LIGHTBOX CINEMATOGRÁFICO DE PANTALLA COMPLETA (ESTILO WEDDING.JONGJEONGLEE.COM)
  // =====================================================================
  function openLightboxAtIndex(index, itemsList) {
    if (!lightbox) return;
    currentLightboxItems = itemsList || getFilteredItems(currentFilter, allMediaCache);
    if (!currentLightboxItems || currentLightboxItems.length === 0) return;

    if (index < 0) index = currentLightboxItems.length - 1;
    if (index >= currentLightboxItems.length) index = 0;
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

    if (lightboxCounter) {
      lightboxCounter.textContent = `${currentLightboxIndex + 1} / ${currentLightboxItems.length}`;
    }

    if (lightboxAuthor) {
      const timeAgo = formatTimeAgo(item.created_at);
      lightboxAuthor.textContent = `${item.guest_name || 'Invitado'} · ${timeAgo}`;
    }

    if (lightboxCaption) {
      lightboxCaption.textContent = `Fotografía de ${item.guest_name} · ${item.likes_count || 0} likes`;
    }

    if (lightboxLikeCount) {
      lightboxLikeCount.textContent = item.likes_count || 0;
    }

    if (lightboxLikeBtn) {
      const heart = lightboxLikeBtn.querySelector('.lb-heart');
      if (item.has_liked) {
        lightboxLikeBtn.classList.add('liked');
        if (heart) heart.textContent = '♥';
      } else {
        lightboxLikeBtn.classList.remove('liked');
        if (heart) heart.textContent = '♡';
      }
    }

    if (lightboxDownloadBtn) {
      lightboxDownloadBtn.href = item.url;
      lightboxDownloadBtn.setAttribute('download', item.original_name || 'recuerdo_boda.jpg');
    }

    if (lightboxDeleteBtn) {
      const isOwner = item.is_owner || (currentGuest && Number(item.guest_id) === Number(currentGuest.id));
      lightboxDeleteBtn.style.display = isOwner ? 'inline-flex' : 'none';
    }

    if (lightboxPrev) {
      lightboxPrev.style.display = currentLightboxItems.length > 1 ? 'flex' : 'none';
    }
    if (lightboxNext) {
      lightboxNext.style.display = currentLightboxItems.length > 1 ? 'flex' : 'none';
    }

    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function showPrevLightbox() {
    if (currentLightboxItems.length <= 1) return;
    openLightboxAtIndex(currentLightboxIndex - 1, currentLightboxItems);
  }

  function showNextLightbox() {
    if (currentLightboxItems.length <= 1) return;
    openLightboxAtIndex(currentLightboxIndex + 1, currentLightboxItems);
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

  function openLightbox(item) {
    const list = getFilteredItems(currentFilter, allMediaCache);
    const idx = list.findIndex(i => Number(i.id) === Number(item.id));
    openLightboxAtIndex(idx !== -1 ? idx : 0, list);
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', showPrevLightbox);
  if (lightboxNext) lightboxNext.addEventListener('click', showNextLightbox);

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || (e.target.id === 'lightboxMediaContainer')) {
        closeLightbox();
      }
    });
  }

  if (lightboxLikeBtn) {
    lightboxLikeBtn.addEventListener('click', () => {
      if (!currentLightboxItems || !currentLightboxItems[currentLightboxIndex]) return;
      const item = currentLightboxItems[currentLightboxIndex];
      toggleLike(item.id, lightboxLikeBtn);
      if (lightboxLikeCount) lightboxLikeCount.textContent = item.likes_count;
      const heart = lightboxLikeBtn.querySelector('.lb-heart');
      if (heart) heart.textContent = item.has_liked ? '♥' : '♡';
    });
  }

  if (lightboxDeleteBtn) {
    lightboxDeleteBtn.addEventListener('click', () => {
      if (!currentLightboxItems || !currentLightboxItems[currentLightboxIndex]) return;
      const item = currentLightboxItems[currentLightboxIndex];
      deleteMyMedia(item.id);
      closeLightbox();
    });
  }

  // Atajos de teclado para el visor
  window.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    if (e.key === 'ArrowLeft') showPrevLightbox();
    else if (e.key === 'ArrowRight') showNextLightbox();
    else if (e.key === 'Escape') closeLightbox();
  });

  // Gesto táctil swipe en móviles
  let touchStartX = 0;
  let touchStartY = 0;
  if (lightbox) {
    lightbox.addEventListener('touchstart', (e) => {
      if (e.changedTouches && e.changedTouches[0]) {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
      }
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
      if (!e.changedTouches || !e.changedTouches[0]) return;
      const deltaX = e.changedTouches[0].screenX - touchStartX;
      const deltaY = e.changedTouches[0].screenY - touchStartY;
      if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX < 0) showNextLightbox();
        else showPrevLightbox();
      } else if (deltaY > 80 && Math.abs(deltaY) > Math.abs(deltaX)) {
        closeLightbox();
      }
    }, { passive: true });
  }

  // =====================================================================
  // 7. LIBRO DE FIRMAS Y DESEOS (Guestbook)
  // =====================================================================
  async function loadGuestbook() {
    if (!guestbookList) return;

    try {
      const res = await fetch('/api/guestbook');
      const data = await res.json();
      if (data.success) {
        renderGuestbook(data.entries);
      }
    } catch (e) {
      console.error(e);
    }
  }

  function renderGuestbook(entries) {
    if (!guestbookList) return;
    guestbookList.innerHTML = '';

    const counterBadge = document.getElementById('gbCounterBadge');
    if (counterBadge) {
      const count = entries ? entries.length : 0;
      counterBadge.textContent = `${count} ${count === 1 ? 'Dedicatoria' : 'Dedicatorias de Amor'}`;
    }

    if (!entries || entries.length === 0) {
      guestbookList.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:36px 20px; color:var(--color-olive);"><p style="font-family:var(--font-serif); font-size:1.4rem; margin-bottom:6px;">¡Sé el primero en dedicar unas hermosas palabras!</p><p style="font-size:0.86rem; color:#82917D;">Tus bendiciones quedarán grabadas en el corazón de Michelle & René.</p></div>';
      return;
    }

    entries.forEach((entry, idx) => {
      const card = document.createElement('article');
      card.className = 'guestbook-letter-card';
      
      const initial = entry.guest_name ? entry.guest_name.trim().charAt(0).toUpperCase() : '♥';
      const dateStr = entry.created_at ? entry.created_at.substring(0, 10) : '';

      card.innerHTML = `
        <div class="gb-card-top">
          <div class="gb-author-badge">
            <span class="gb-avatar">${initial}</span>
            <div class="gb-meta">
              <h4 class="gb-author-name">${entry.guest_name}</h4>
              <span class="gb-date">${dateStr}</span>
            </div>
          </div>
          <div class="gb-wax-seal" title="Bendición para los novios">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          </div>
        </div>
        <div class="gb-card-body">
          <span class="gb-quote-mark">“</span>
          <p class="gb-message-text">${entry.message}</p>
          <span class="gb-quote-mark right">”</span>
        </div>
        <div class="gb-card-footer">
          <button type="button" class="gb-like-btn" title="Enviar amor a este mensaje">
            <span>♥</span> <span>Deseo con Amor</span>
          </button>
        </div>
      `;

      const likeBtn = card.querySelector('.gb-like-btn');
      if (likeBtn) {
        likeBtn.addEventListener('click', () => {
          likeBtn.style.color = '#E53935';
          likeBtn.querySelector('span:last-child').textContent = '¡Amor Enviado!';
        });
      }

      guestbookList.appendChild(card);
    });
  }

  // Chips de inspiración rápida para el libro de firmas
  function initGuestbookChips() {
    const chips = document.querySelectorAll('.gb-chip-btn');
    const msgInput = document.getElementById('gbMessage');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const text = chip.dataset.msg;
        if (msgInput && text) {
          msgInput.value = text;
          msgInput.focus();
          showToast('Mensaje de inspiración añadido', 'info');
        }
      });
    });
  }

  if (guestbookForm) {
    guestbookForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const author = guestbookAuthorInput.value.trim();
      const message = guestbookMsgInput.value.trim();

      if (!author || !message) {
        showToast('Por favor escribe tu nombre y tu mensaje.', 'error');
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
          body: JSON.stringify({ name: author, message: message })
        });
        const data = await res.json();
        if (data.success) {
          showToast('¡Gracias por tus hermosos deseos!', 'success');
          guestbookMsgInput.value = '';
          loadGuestbook();
          // Cambiar a la vista de dedicatorias para ver su mensaje publicado
          if (gbTabRead && gbPaneRead && gbTabSign && gbPaneSign) {
            gbTabRead.classList.add('active');
            gbTabSign.classList.remove('active');
            gbPaneRead.classList.add('active');
            gbPaneSign.classList.remove('active');
          }
        } else {
          showToast(data.error || 'No se pudo enviar el mensaje.', 'error');
        }
      } catch (err) {
        showToast('Error de red al enviar el mensaje.', 'error');
      }
    });
  }
  // Alternancia entre vistas de libro de firmas (Firmar vs Ver Dedicatorias)
  const gbTabSign = document.getElementById('gbTabSign');
  const gbTabRead = document.getElementById('gbTabRead');
  const gbPaneSign = document.getElementById('gbPaneSign');
  const gbPaneRead = document.getElementById('gbPaneRead');

  if (gbTabSign && gbTabRead && gbPaneSign && gbPaneRead) {
    gbTabSign.addEventListener('click', () => {
      gbTabSign.classList.add('active');
      gbTabRead.classList.remove('active');
      gbPaneSign.classList.add('active');
      gbPaneRead.classList.remove('active');
    });

    gbTabRead.addEventListener('click', () => {
      gbTabRead.classList.add('active');
      gbTabSign.classList.remove('active');
      gbPaneRead.classList.add('active');
      gbPaneSign.classList.remove('active');
      loadGuestbook();
    });
  }

  // Botón manual para refrescar la galería
  if (btnRefreshGallery) {
    btnRefreshGallery.addEventListener('click', () => {
      btnRefreshGallery.querySelector('svg')?.animate([
        { transform: 'rotate(0deg)' },
        { transform: 'rotate(360deg)' }
      ], { duration: 600, iterations: 1 });
      showToast('Actualizando galería...', 'info');
      loadGallery(false);
    });
  }

  // =====================================================================
  // CARRUSEL INTERACTIVO DE NUESTRA HISTORIA (100% MANUAL, SIN MOVIMIENTOS BRUSCOS)
  // =====================================================================
  function initStoryCarousel() {
    const container = document.getElementById('storyCarouselContainer');
    const slides = document.querySelectorAll('.story-slide');
    const thumbs = document.querySelectorAll('.story-thumb-item');
    const prevBtn = document.getElementById('storyPrevBtn');
    const nextBtn = document.getElementById('storyNextBtn');
    const currentIdxEl = document.getElementById('storyCurrentIndex');
    const totalIdxEl = document.getElementById('storyTotalIndex');
    const track = document.getElementById('storyThumbnailsTrack');

    if (!container || slides.length === 0) return;

    let activeIndex = 0;
    const totalSlides = slides.length;

    if (totalIdxEl) {
      totalIdxEl.textContent = String(totalSlides).padStart(2, '0');
    }

    function goToSlide(index) {
      if (index < 0) index = totalSlides - 1;
      if (index >= totalSlides) index = 0;
      activeIndex = index;

      slides.forEach((slide, idx) => {
        slide.classList.toggle('active', idx === activeIndex);
      });

      thumbs.forEach((thumb, idx) => {
        const isActive = idx === activeIndex;
        thumb.classList.toggle('active', isActive);
        if (isActive && track && track.parentElement) {
          const scrollTarget = thumb.offsetLeft - (track.parentElement.clientWidth / 2) + (thumb.clientWidth / 2);
          track.parentElement.scrollTo({ left: Math.max(0, scrollTarget), behavior: 'smooth' });
        }
      });

      if (currentIdxEl) {
        currentIdxEl.textContent = String(activeIndex + 1).padStart(2, '0');
      }
    }

    thumbs.forEach(thumb => {
      thumb.addEventListener('click', (e) => {
        e.preventDefault();
        const idx = parseInt(thumb.dataset.index, 10);
        goToSlide(idx);
      });
    });

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        goToSlide(activeIndex - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        goToSlide(activeIndex + 1);
      });
    }

    let carouselTouchStartX = 0;
    container.addEventListener('touchstart', (e) => {
      if (e.changedTouches && e.changedTouches[0]) {
        carouselTouchStartX = e.changedTouches[0].screenX;
      }
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
      if (!e.changedTouches || !e.changedTouches[0]) return;
      const deltaX = e.changedTouches[0].screenX - carouselTouchStartX;
      if (Math.abs(deltaX) > 45) {
        if (deltaX < 0) goToSlide(activeIndex + 1);
        else goToSlide(activeIndex - 1);
      }
    }, { passive: true });
  }

  // Asegura que la barra de navegación móvil siempre permanezca 100% pegada al fondo físico en teléfonos
  function initMobileNavPin() {
    const nav = document.querySelector('.mobile-app-nav');
    if (!nav) return;

    const pinNav = () => {
      if (window.innerWidth > 768) return;
      if (window.visualViewport) {
        const offset = Math.max(0, window.innerHeight - window.visualViewport.height - window.visualViewport.offsetTop);
        nav.style.bottom = `${offset}px`;
      } else {
        nav.style.bottom = '0px';
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', pinNav, { passive: true });
      window.visualViewport.addEventListener('scroll', pinNav, { passive: true });
    }
    window.addEventListener('scroll', pinNav, { passive: true });
    pinNav();
  }

  // Inicialización única al cargar la página
  checkGuestSession();
  loadGallery();
  loadGuestbook();
  initStoryCarousel();
  initGuestbookChips();
  initMobileNavPin();

})();
