// Unit & browser-flow tests for public/assets/js/media-download.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const code = fs.readFileSync('public/assets/js/media-download.js', 'utf8');

function createHarness({
  userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0',
  platform = 'Win32',
  maxTouchPoints = 0,
  canShareFiles = false,
  shareImpl = null,
  fetchImpl = null,
  canvasWorks = true,
} = {}) {
  const sharedPayloads = [];
  const anchorDownloads = [];
  const openedUrls = [];
  const fetchedUrls = [];
  const revokedUrls = [];
  let canvasConversions = 0;

  const navigatorObj = {
    userAgent,
    platform,
    maxTouchPoints,
  };

  if (canShareFiles || shareImpl) {
    navigatorObj.canShare = (data) => Boolean(canShareFiles && data && Array.isArray(data.files) && data.files.length > 0);
    navigatorObj.share = async (data) => {
      sharedPayloads.push(data);
      if (shareImpl) return shareImpl(data);
    };
  }

  const documentObj = {
    body: { appendChild() {} },
    createElement(tag) {
      if (tag === 'canvas') {
        return {
          width: 0,
          height: 0,
          getContext() {
            if (!canvasWorks) return null;
            return {
              fillStyle: '',
              fillRect() {},
              drawImage() {},
            };
          },
          toBlob(cb, type) {
            if (!canvasWorks) {
              cb(null);
              return;
            }
            canvasConversions++;
            cb(new Blob([new Uint8Array([0xff, 0xd8, 0xff, 0xe0])], { type }));
          },
        };
      }
      const el = {
        tag,
        href: '',
        download: '',
        rel: '',
        style: {},
        click() {
          anchorDownloads.push({ href: el.href, download: el.download });
        },
        remove() {},
      };
      return el;
    },
  };

  const windowObj = {
    location: { origin: 'https://boda.example.test' },
    open(url, target, features) {
      openedUrls.push({ url, target, features });
    },
  };

  const urlApi = {
    createObjectURL(blob) {
      return 'blob:test/' + Math.random().toString(36).slice(2) + '#' + (blob.type || '');
    },
    revokeObjectURL(u) {
      revokedUrls.push(u);
    },
  };

  const ctx = {
    window: windowObj,
    navigator: navigatorObj,
    document: documentObj,
    URL: urlApi,
    Blob,
    File,
    setTimeout: (fn) => {
      // Do not keep event loop alive; run revoke/slow timers only when needed
      return { unref() {}, _fn: fn };
    },
    clearTimeout() {},
    createImageBitmap: async () => ({ width: 800, height: 600, close() {} }),
    fetch: async (url, opts) => {
      fetchedUrls.push({ url, opts });
      if (fetchImpl) return fetchImpl(url, opts);
      return {
        ok: true,
        status: 200,
        async blob() {
          return new Blob([new Uint8Array([1, 2, 3, 4])], { type: 'image/webp' });
        },
      };
    },
  };

  vm.runInNewContext(code, ctx);
  return {
    api: windowObj.BodaMediaDownload,
    sharedPayloads,
    anchorDownloads,
    openedUrls,
    fetchedUrls,
    revokedUrls,
    getCanvasConversions: () => canvasConversions,
  };
}

async function run() {
  // 1. iOS iPhone: WebP photo -> JPEG + Web Share API ({ files }) only + prefetch cache
  {
    const h = createHarness({
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1',
      platform: 'iPhone',
      maxTouchPoints: 5,
      canShareFiles: true,
    });

    const photoUrl = 'https://cdn.example.invalid/media/2026_foto.webp';
    h.api.prefetchMedia({ url: photoUrl, fileName: 'IMG_4521.HEIC', mediaType: 'image' });
    await new Promise((r) => setImmediate(r));

    const res = await h.api.saveMediaToDevice({
      url: photoUrl,
      fileName: 'IMG_4521.HEIC',
      mediaType: 'image',
    });

    assert.equal(res.ok, true);
    assert.equal(res.status, 'shared');
    assert.equal(res.platform, 'ios');
    assert.equal(res.fileName, 'IMG_4521.jpg');
    assert.equal(h.fetchedUrls.length, 1, 'Prefetch should prevent duplicate fetch on tap');
    assert.equal(h.getCanvasConversions(), 1, 'WebP should convert to JPEG on iOS');
    assert.equal(h.sharedPayloads.length, 1);
    assert.deepEqual(Object.keys(h.sharedPayloads[0]), ['files'], 'Share payload on iOS must only contain files');
    assert.equal(h.sharedPayloads[0].files[0].type, 'image/jpeg');
    assert.equal(h.sharedPayloads[0].files[0].name, 'IMG_4521.jpg');
    assert.equal(h.anchorDownloads.length, 0);
  }

  // 2. iOS video: no prefetch, NotAllowedError returns needs-retry and 2nd tap succeeds from cache
  {
    let attempt = 0;
    const h = createHarness({
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15',
      platform: 'iPhone',
      maxTouchPoints: 5,
      canShareFiles: true,
      fetchImpl: async () => ({
        ok: true,
        status: 200,
        async blob() {
          return new Blob([new Uint8Array([0, 0, 0, 24])], { type: 'video/mp4' });
        },
      }),
      shareImpl: async () => {
        attempt++;
        if (attempt === 1) {
          const err = new Error('User gesture expired');
          err.name = 'NotAllowedError';
          throw err;
        }
      },
    });

    const videoUrl = 'https://cdn.example.invalid/media/2026_baile.mp4';
    h.api.prefetchMedia({ url: videoUrl, fileName: 'baile.mp4', mediaType: 'video' });
    await new Promise((r) => setImmediate(r));
    assert.equal(h.fetchedUrls.length, 0, 'Videos must never be auto-prefetched');

    const first = await h.api.saveMediaToDevice({ url: videoUrl, fileName: 'baile', mediaType: 'video' });
    assert.equal(first.ok, false);
    assert.equal(first.status, 'needs-retry');
    assert.equal(first.isVideo, true);
    assert.equal(h.fetchedUrls.length, 1);

    const second = await h.api.saveMediaToDevice({ url: videoUrl, fileName: 'baile', mediaType: 'video' });
    assert.equal(second.ok, true);
    assert.equal(second.status, 'shared');
    assert.equal(second.fileName, 'baile.mp4');
    assert.equal(h.fetchedUrls.length, 1, 'Second tap must reuse cached video without re-fetching');
  }

  // 3. iOS AbortError (user cancelled Share Sheet): no anchor fallback, no window.open
  {
    const h = createHarness({
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X)',
      platform: 'iPhone',
      maxTouchPoints: 5,
      canShareFiles: true,
      shareImpl: async () => {
        const err = new Error('Cancelled');
        err.name = 'AbortError';
        throw err;
      },
    });

    const res = await h.api.saveMediaToDevice({
      url: 'https://cdn.example.invalid/media/cancel.webp',
      fileName: 'foto.webp',
      mediaType: 'image',
    });
    assert.equal(res.ok, true);
    assert.equal(res.status, 'cancelled');
    assert.equal(h.anchorDownloads.length, 0);
    assert.equal(h.openedUrls.length, 0);
  }

  // 4. iPadOS desktop-mode UA (MacIntel + maxTouchPoints > 1) detected as iOS
  {
    const h = createHarness({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15',
      platform: 'MacIntel',
      maxTouchPoints: 5,
      canShareFiles: true,
    });
    assert.equal(h.api.getPlatform(), 'ios');
  }

  // 5. Android: converts WebP -> JPEG and downloads directly via anchor (no Share Sheet)
  {
    const h = createHarness({
      userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/129.0 Mobile Safari/537.36',
      platform: 'Linux armv8l',
      maxTouchPoints: 5,
      canShareFiles: true,
    });

    const res = await h.api.saveMediaToDevice({
      url: 'https://cdn.example.invalid/media/android_photo.webp',
      fileName: 'recuerdo.webp',
      mediaType: 'image',
    });
    assert.equal(res.ok, true);
    assert.equal(res.status, 'downloaded');
    assert.equal(res.platform, 'android');
    assert.equal(res.fileName, 'recuerdo.jpg');
    assert.equal(h.getCanvasConversions(), 1, 'Android should convert WebP to JPEG for universal Gallery indexing');
    assert.equal(h.sharedPayloads.length, 0, 'Android should download directly instead of opening share sheet');
    assert.equal(h.anchorDownloads.length, 1);
    assert.equal(h.anchorDownloads[0].download, 'recuerdo.jpg');
  }

  // 6. Desktop: direct anchor download without unnecessary WebP->JPEG conversion
  {
    const h = createHarness({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0',
      platform: 'Win32',
      maxTouchPoints: 0,
      canShareFiles: true,
    });

    const res = await h.api.saveMediaToDevice({
      url: 'https://cdn.example.invalid/media/desktop_photo.webp',
      fileName: 'foto_boda.webp',
      mediaType: 'image',
    });
    assert.equal(res.ok, true);
    assert.equal(res.status, 'downloaded');
    assert.equal(res.platform, 'desktop');
    assert.equal(res.fileName, 'foto_boda.webp');
    assert.equal(h.getCanvasConversions(), 0);
    assert.equal(h.sharedPayloads.length, 0);
    assert.equal(h.anchorDownloads.length, 1);
  }

  // 7. Local standby sourceBlob works without network fetch
  {
    const h = createHarness({
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X)',
      platform: 'iPhone',
      maxTouchPoints: 5,
      canShareFiles: true,
    });

    const localBlob = new Blob([new Uint8Array([9, 8, 7])], { type: 'image/jpeg' });
    const res = await h.api.saveMediaToDevice({
      url: 'blob:https://boda.example.test/1234',
      fileName: 'captura.jpg',
      mediaType: 'image',
      sourceBlob: localBlob,
    });
    assert.equal(res.ok, true);
    assert.equal(res.status, 'shared');
    assert.equal(h.fetchedUrls.length, 0, 'Local sourceBlob should not trigger fetch');
  }

  // 8. Fetch / CORS error falls back to window.open
  {
    const h = createHarness({
      userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8)',
      platform: 'Linux armv8l',
      maxTouchPoints: 5,
      fetchImpl: async () => {
        throw new TypeError('Failed to fetch');
      },
    });

    const url = 'https://cdn.example.invalid/media/fail.mp4';
    const res = await h.api.saveMediaToDevice({ url, fileName: 'clip.mp4', mediaType: 'video' });
    assert.equal(res.ok, false);
    assert.equal(res.status, 'opened');
    assert.equal(h.openedUrls.length, 1);
    assert.equal(h.openedUrls[0].url, url);
  }

  console.log('media_download_test: all 8 scenarios passed');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
