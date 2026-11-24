/**
 * BodaMediaDownload: Guarda fotos y videos en las Fotos/Galería del dispositivo.
 * - iOS / iPadOS: convierte WebP -> JPEG y usa Web Share API ({ files }) para mostrar
 *   directamente "Guardar imagen" / "Guardar video" en el carrete (Fotos), con caché en memoria
 *   para evitar expiración de gesto de usuario en descargas lentas.
 * - Android: convierte WebP -> JPEG y descarga el archivo normalizado (.jpg / .mp4) vía Blob
 *   para que DownloadManager / MediaStore lo indexe automáticamente en Fotos / Galería.
 * - Escritorio: descarga directa con nombre y extensión normalizados.
 */
(function (global) {
  'use strict';

  const MAX_CACHE_ENTRIES = 3;
  const MAX_CACHE_ITEM_BYTES = 35 * 1024 * 1024;
  const BLOB_REVOKE_DELAY_MS = 15000;
  const SLOW_FETCH_NOTICE_MS = 600;

  const fileCache = new Map();
  const inFlight = new Map();

  function getNav() {
    return typeof navigator !== 'undefined' ? navigator : {};
  }

  function isAppleMobile(nav) {
    const n = nav || getNav();
    const ua = String(n.userAgent || '');
    const platform = String(n.platform || '');
    const touchPoints = Number(n.maxTouchPoints || 0);
    return /iPad|iPhone|iPod/i.test(ua) || (platform === 'MacIntel' && touchPoints > 1);
  }

  function isAndroid(nav) {
    const n = nav || getNav();
    return /Android/i.test(String(n.userAgent || ''));
  }

  function isMobileDevice(nav) {
    return isAppleMobile(nav) || isAndroid(nav);
  }

  function getPlatform(nav) {
    if (isAppleMobile(nav)) return 'ios';
    if (isAndroid(nav)) return 'android';
    return 'desktop';
  }

  function cleanMime(mime) {
    return String(mime || '').split(';')[0].trim().toLowerCase();
  }

  function extractExt(value) {
    const clean = String(value || '').split(/[?#]/)[0];
    const match = clean.match(/\.([a-z0-9]{2,5})$/i);
    return match ? match[1].toLowerCase() : '';
  }

  function inferIsVideo(mediaType, mime, url, fileName) {
    if (mediaType === 'video') return true;
    if (mediaType === 'image') return false;
    const m = cleanMime(mime);
    if (m.startsWith('video/')) return true;
    if (m.startsWith('image/')) return false;
    const ext = extractExt(url) || extractExt(fileName);
    return ext === 'mp4' || ext === 'mov' || ext === 'webm' || ext === 'm4v';
  }

  function mimeFromExt(ext) {
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'webp':
        return 'image/webp';
      case 'gif':
        return 'image/gif';
      case 'mp4':
      case 'm4v':
        return 'video/mp4';
      case 'mov':
        return 'video/quicktime';
      case 'webm':
        return 'video/webm';
      default:
        return '';
    }
  }

  function resolveMime(rawMime, isVideo, url, fileName) {
    const cleaned = cleanMime(rawMime);
    if (cleaned && (cleaned.startsWith('image/') || cleaned.startsWith('video/'))) {
      return cleaned === 'image/jpg' ? 'image/jpeg' : cleaned;
    }
    const fromUrl = mimeFromExt(extractExt(url));
    if (fromUrl) return fromUrl;
    const fromName = mimeFromExt(extractExt(fileName));
    if (fromName) return fromName;
    return isVideo ? 'video/mp4' : 'image/jpeg';
  }

  function extensionForMime(mime, isVideo) {
    switch (cleanMime(mime)) {
      case 'image/jpeg':
        return 'jpg';
      case 'image/png':
        return 'png';
      case 'image/gif':
        return 'gif';
      case 'image/webp':
        return 'webp';
      case 'video/mp4':
        return 'mp4';
      case 'video/quicktime':
        return 'mov';
      case 'video/webm':
        return 'webm';
      default:
        return isVideo ? 'mp4' : 'jpg';
    }
  }

  function normalizeFileName(rawName, mime, isVideo) {
    const ext = extensionForMime(mime, isVideo);
    const fallbackBase = isVideo ? 'video_boda_MR' : 'foto_boda_MR';
    let base = String(rawName || '').trim();
    base = base.replace(/[\\/:*?"<>|]+/g, '_').replace(/\s+/g, ' ').trim();
    base = base.replace(/\.[a-z0-9]{2,5}$/i, '').trim();
    if (!base) base = fallbackBase;
    if (base.length > 100) base = base.slice(0, 100).trim();
    return base + '.' + ext;
  }

  function makeFile(blob, fileName, mime) {
    if (typeof File === 'function') {
      try {
        return new File([blob], fileName, { type: mime, lastModified: Date.now() });
      } catch (_) {
        // Fallback below if File constructor is restricted.
      }
    }
    try {
      blob.name = fileName;
    } catch (_) {
      // Ignore readonly name.
    }
    return blob;
  }

  async function convertImageBlobToJpeg(blob, quality) {
    if (typeof document === 'undefined' || typeof document.createElement !== 'function') {
      return null;
    }
    const q = typeof quality === 'number' ? quality : 0.92;
    let bitmap = null;
    let objectUrl = null;
    try {
      let width = 0;
      let height = 0;
      let source = null;

      if (typeof createImageBitmap === 'function') {
        bitmap = await createImageBitmap(blob);
        width = bitmap.width;
        height = bitmap.height;
        source = bitmap;
      } else if (typeof Image === 'function' && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
        objectUrl = URL.createObjectURL(blob);
        source = await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error('Image decode failed'));
          img.src = objectUrl;
        });
        width = source.naturalWidth || source.width;
        height = source.naturalHeight || source.height;
      }

      if (!source || !width || !height) return null;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(source, 0, 0, width, height);

      const jpegBlob = await new Promise((resolve) => {
        if (typeof canvas.toBlob === 'function') {
          canvas.toBlob((out) => resolve(out || null), 'image/jpeg', q);
        } else {
          resolve(null);
        }
      });

      return jpegBlob && jpegBlob.size > 0 ? jpegBlob : null;
    } catch (_) {
      return null;
    } finally {
      if (bitmap && typeof bitmap.close === 'function') {
        try { bitmap.close(); } catch (_) {}
      }
      if (objectUrl && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
        try { URL.revokeObjectURL(objectUrl); } catch (_) {}
      }
    }
  }

  async function prepareMediaFile(blob, options) {
    const opts = options || {};
    const isVideo = inferIsVideo(opts.mediaType, blob && blob.type, opts.url, opts.fileName);
    let mime = resolveMime(blob && blob.type, isVideo, opts.url, opts.fileName);
    let finalBlob = blob;

    // Convertir WebP/AVIF a JPEG en móviles para garantizar "Guardar imagen" en iOS Fotos
    // e indexación universal en Galería / Google Photos en Android.
    const shouldConvertToJpeg = !isVideo &&
      (mime === 'image/webp' || mime === 'image/avif') &&
      (opts.forceJpeg || isMobileDevice());

    if (shouldConvertToJpeg) {
      const converted = await convertImageBlobToJpeg(blob, 0.92);
      if (converted) {
        finalBlob = converted;
        mime = 'image/jpeg';
      }
    }

    const finalName = normalizeFileName(opts.fileName, mime, isVideo);
    const file = makeFile(finalBlob, finalName, mime);
    return { file, fileName: finalName, mime, isVideo };
  }

  function cacheSet(key, entry) {
    if (!key || !entry || !entry.file) return;
    const size = Number(entry.file.size || 0);
    if (size <= 0 || size > MAX_CACHE_ITEM_BYTES) return;
    if (fileCache.has(key)) fileCache.delete(key);
    fileCache.set(key, entry);
    while (fileCache.size > MAX_CACHE_ENTRIES) {
      const oldestKey = fileCache.keys().next().value;
      fileCache.delete(oldestKey);
    }
  }

  function isCrossOriginUrl(url) {
    if (!/^https?:\/\//i.test(String(url || ''))) return false;
    if (typeof window === 'undefined' || !window.location || !window.location.origin) return true;
    return !String(url).startsWith(window.location.origin);
  }

  async function fetchAndPrepare(options) {
    const opts = options || {};
    const url = String(opts.url || '');

    if (opts.sourceBlob) {
      return prepareMediaFile(opts.sourceBlob, opts);
    }

    if (!url) {
      throw new Error('URL de archivo no válida.');
    }

    const cached = fileCache.get(url);
    if (cached) {
      return cached;
    }

    if (inFlight.has(url)) {
      return inFlight.get(url);
    }

    const task = (async () => {
      const fetchOpts = isCrossOriginUrl(url) ? { mode: 'cors' } : undefined;
      const res = await fetch(url, fetchOpts);
      if (!res || !res.ok) {
        throw new Error('HTTP ' + (res ? res.status : 'error'));
      }
      const blob = await res.blob();
      const prepared = await prepareMediaFile(blob, opts);
      cacheSet(url, prepared);
      return prepared;
    })();

    inFlight.set(url, task);
    try {
      return await task;
    } finally {
      inFlight.delete(url);
    }
  }

  function prefetchMedia(options) {
    const opts = options || {};
    const url = String(opts.url || '');
    if (!url || !isMobileDevice()) return;
    // No precargar videos pesados automáticamente para cuidar datos móviles.
    const isVideo = inferIsVideo(opts.mediaType, '', url, opts.fileName);
    if (isVideo) return;
    if (fileCache.has(url) || inFlight.has(url)) return;

    fetchAndPrepare(opts).catch(() => {
      // Silencioso: si falla la precarga, el clic volverá a intentar.
    });
  }

  function canShareFile(file, nav) {
    const n = nav || getNav();
    if (typeof n.share !== 'function') return false;
    if (typeof n.canShare === 'function') {
      try {
        return Boolean(n.canShare({ files: [file] }));
      } catch (_) {
        return false;
      }
    }
    return false;
  }

  function triggerAnchorDownload(blob, fileName) {
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    a.rel = 'noopener';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => {
      try { URL.revokeObjectURL(blobUrl); } catch (_) {}
    }, BLOB_REVOKE_DELAY_MS);
  }

  async function saveMediaToDevice(options) {
    const opts = options || {};
    const url = String(opts.url || '');
    const platform = getPlatform();
    const likelyVideo = inferIsVideo(opts.mediaType, '', url, opts.fileName);

    let slowTimer = null;
    if (typeof opts.onSlowFetch === 'function' && !opts.sourceBlob && !fileCache.has(url)) {
      slowTimer = setTimeout(() => {
        try { opts.onSlowFetch({ isVideo: likelyVideo, platform }); } catch (_) {}
      }, SLOW_FETCH_NOTICE_MS);
    }

    let prepared;
    try {
      prepared = await fetchAndPrepare(opts);
    } catch (err) {
      if (url && typeof window !== 'undefined' && typeof window.open === 'function') {
        window.open(url, '_blank', 'noopener');
      }
      return {
        ok: false,
        status: 'opened',
        method: 'window-open',
        isVideo: likelyVideo,
        platform,
        error: err,
      };
    } finally {
      if (slowTimer) clearTimeout(slowTimer);
    }

    const { file, fileName, isVideo } = prepared;

    // En iOS / iPadOS, la hoja nativa de compartir con { files: [file] } (sin text/title)
    // muestra "Guardar imagen" / "Guardar video" para guardar directamente en la app Fotos.
    if (platform === 'ios' && canShareFile(file)) {
      try {
        await getNav().share({ files: [file] });
        return {
          ok: true,
          status: 'shared',
          method: 'share',
          fileName,
          isVideo,
          platform,
        };
      } catch (err) {
        const errName = err && err.name ? String(err.name) : '';
        if (errName === 'AbortError') {
          return {
            ok: true,
            status: 'cancelled',
            method: 'share',
            fileName,
            isVideo,
            platform,
          };
        }
        if (errName === 'NotAllowedError') {
          // El archivo ya quedó en caché en memoria: el siguiente toque abrirá la hoja de Fotos al instante.
          return {
            ok: false,
            status: 'needs-retry',
            method: 'share',
            fileName,
            isVideo,
            platform,
            message: isVideo
              ? 'Video listo. Toca descargar de nuevo para guardarlo en Fotos.'
              : 'Foto lista. Toca descargar de nuevo para guardarla en Fotos.',
          };
        }
        // Cualquier otro error de Web Share: intentar descarga por enlace como respaldo.
        triggerAnchorDownload(file, fileName);
        return {
          ok: true,
          status: 'downloaded',
          method: 'anchor-fallback',
          fileName,
          isVideo,
          platform,
        };
      }
    }

    // Android (MediaStore indexa .jpg y .mp4 en Galería/Fotos), iOS sin Web Share y Escritorio.
    triggerAnchorDownload(file, fileName);
    return {
      ok: true,
      status: 'downloaded',
      method: platform === 'ios' ? 'anchor-fallback' : 'anchor',
      fileName,
      isVideo,
      platform,
    };
  }

  function clearCache() {
    fileCache.clear();
  }

  global.BodaMediaDownload = {
    saveMediaToDevice,
    prefetchMedia,
    normalizeFileName,
    isAppleMobile,
    isAndroid,
    isMobileDevice,
    getPlatform,
    clearCache,
  };
})(typeof window !== 'undefined' ? window : globalThis);
