// Browser-flow test for client-side ZIP64 download directly from R2 (no server ZIP load).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const code = fs.readFileSync('public/assets/js/admin-zip.js', 'utf8');

class Element {
  constructor() { this.handlers = {}; this.attrs = {}; this.value = 0; this.hidden = true; this.textContent = ''; }
  addEventListener(event, fn) { this.handlers[event] = fn; }
  setAttribute(key, value) { this.attrs[key] = value; }
  removeAttribute(key) { delete this.attrs[key]; }
  hasAttribute(key) { return key === 'value' ? true : key in this.attrs; }
  remove() {}
  click() { this.handlers.click?.(); }
}

function makeStreamBody(bytes) {
  let sent = false;
  return {
    getReader() {
      return {
        async read() {
          if (sent) return { done: true, value: undefined };
          sent = true;
          return { done: false, value: bytes };
        },
        async cancel() {}
      };
    }
  };
}

function harness({ failCors = false, holdManifest = false, usePicker = false } = {}) {
  const elements = new Map();
  const get = (id) => {
    if (!elements.has(id)) elements.set(id, new Element());
    return elements.get(id);
  };
  const fetchedUrls = [];
  let saves = 0;
  let lastBlob = null;
  let writtenChunks = [];
  let writerClosed = false;
  let writerAborted = false;
  let failedOnce = false;

  const sample1 = new TextEncoder().encode('photo-bytes-1');
  const sample2 = new TextEncoder().encode('video-bytes-222');

  const manifest = {
    success: true,
    filename: 'Album_Michelle_y_Rene.zip',
    total: 2,
    total_bytes: sample1.length + sample2.length,
    items: [
      { id: 1, name: 'Fotos/1_boda.webp', url: 'https://cdn.example.invalid/media/1.webp', size: sample1.length },
      { id: 2, name: 'Videos/2_baile.mp4', url: 'https://cdn.example.invalid/media/2.mp4', size: sample2.length },
    ]
  };

  const windowObj = { addEventListener() {} };
  if (usePicker) {
    windowObj.showSaveFilePicker = async () => ({
      async createWritable() {
        return {
          async write(chunk) { writtenChunks.push(Buffer.from(chunk)); },
          async close() { writerClosed = true; },
          async abort() { writerAborted = true; }
        };
      }
    });
  }

  vm.runInNewContext(code, {
    document: {
      getElementById: get,
      body: { appendChild() {} },
      createElement() {
        const link = new Element();
        link.click = () => { saves++; };
        return link;
      }
    },
    fetch: async (url, options = {}) => {
      fetchedUrls.push({ url, options });
      if (url === '/api/zip-download') {
        assert.equal(options.headers['X-Requested-With'], 'XMLHttpRequest');
        const body = JSON.parse(options.body);
        assert.equal(body.action, 'manifest');
        if (holdManifest) {
          await new Promise((resolve, reject) => options.signal.addEventListener('abort', () => reject(new DOMException('', 'AbortError'))));
        }
        if (Array.isArray(body.ids)) {
          const items = manifest.items.filter((item) => body.ids.includes(item.id));
          return {
            ok: true,
            json: async () => ({
              success: true,
              filename: 'Seleccion_Michelle_y_Rene.zip',
              total: items.length,
              total_bytes: items.reduce((sum, item) => sum + item.size, 0),
              items
            })
          };
        }
        return { ok: true, json: async () => manifest };
      }
      if (failCors && !failedOnce) {
        failedOnce = true;
        throw new TypeError('Failed to fetch');
      }
      const data = url.endsWith('1.webp') ? sample1 : sample2;
      return { ok: true, status: 200, body: makeStreamBody(data) };
    },
    Blob,
    TextEncoder,
    Uint8Array,
    Uint32Array,
    DataView,
    AbortController,
    DOMException,
    URL: {
      createObjectURL: (blob) => { lastBlob = blob; return 'blob:test'; },
      revokeObjectURL() {}
    },
    window: windowObj
  });

  return {
    get,
    windowObj,
    fetchedUrls,
    stats: () => ({ saves, lastBlob, written: Buffer.concat(writtenChunks), writerClosed, writerAborted })
  };
}

const tick = async () => { for (let i = 0; i < 20; i++) await new Promise((resolve) => setImmediate(resolve)); };

(async () => {
  // 1. Blob fallback mode: verifies manifest-only backend call, direct R2 fetches, valid ZIP binary, double-click guard and manual re-save.
  const normal = harness();
  normal.get('btnOpenR2Guide').click();
  normal.get('btnOpenR2Guide').click();
  await tick();
  assert.equal(normal.fetchedUrls.filter(r => r.url === '/api/zip-download').length, 1);
  assert.equal(normal.fetchedUrls.filter(r => r.url.startsWith('https://cdn.example.invalid/')).length, 2);
  assert.equal(normal.get('albumZipProgress').value, 100);
  assert.equal(normal.stats().saves, 1);
  assert.equal(normal.get('albumZipSave').disabled, false);
  assert.equal(normal.get('albumZipSave').hidden, false);
  const zipBuf = Buffer.from(await normal.stats().lastBlob.arrayBuffer());
  assert.equal(zipBuf.readUInt32LE(0), 0x04034b50, 'ZIP must start with local file header signature.');
  assert.ok(zipBuf.includes(Buffer.from('Fotos/1_boda.webp')), 'First entry name missing.');
  assert.ok(zipBuf.includes(Buffer.from('Videos/2_baile.mp4')), 'Second entry name missing.');
  assert.ok(zipBuf.includes(Buffer.from('photo-bytes-1')), 'First entry payload missing.');
  assert.ok(zipBuf.includes(Buffer.from('video-bytes-222')), 'Second entry payload missing.');
  assert.equal(zipBuf.readUInt32LE(zipBuf.length - 22), 0x06054b50, 'ZIP must end with EOCD signature.');
  normal.get('albumZipSave').click();
  assert.equal(normal.stats().saves, 2);
  assert.equal(normal.fetchedUrls.length, 3, 'Manual save must reuse the generated Blob.');

  // 2. Streaming File System Access API mode (showSaveFilePicker): writes directly to disk without Blob.
  const streaming = harness({ usePicker: true });
  streaming.get('btnOpenR2Guide').click();
  await tick();
  assert.equal(streaming.stats().writerClosed, true);
  assert.equal(streaming.stats().lastBlob, null);
  assert.equal(streaming.stats().written.readUInt32LE(0), 0x04034b50);
  assert.equal(streaming.stats().written.readUInt32LE(streaming.stats().written.length - 22), 0x06054b50);
  assert.equal(streaming.get('albumZipStage').textContent, 'ZIP guardado');

  // 3. CORS failure shows actionable R2 CORS message and allows retry.
  const corsFail = harness({ failCors: true });
  corsFail.get('btnOpenR2Guide').click();
  await tick();
  assert.equal(corsFail.get('albumZipRetry').hidden, false);
  assert.match(corsFail.get('albumZipStatus').textContent, /CORS/);
  corsFail.get('albumZipRetry').click();
  await tick();
  assert.equal(corsFail.stats().saves, 1);

  // 4. Stop aborts in-flight export cleanly.
  const stopped = harness({ holdManifest: true });
  stopped.get('btnOpenR2Guide').click();
  stopped.get('albumZipStop').click();
  await tick();
  assert.equal(stopped.get('albumZipStage').textContent, 'Descarga detenida');
  assert.equal(stopped.get('albumZipRetry').hidden, false);
  assert.equal(stopped.stats().saves, 0);

  // 5. Selected-only ZIP sends ids in manifest request and packages only matching items.
  const selected = harness();
  selected.windowObj.startAdminZipDownload([2]);
  await tick();
  const selReq = selected.fetchedUrls.find(r => r.url === '/api/zip-download');
  assert.deepEqual(JSON.parse(selReq.options.body), { action: 'manifest', ids: [2] });
  assert.equal(selected.fetchedUrls.filter(r => r.url.startsWith('https://cdn.example.invalid/')).length, 1);
  const selZipBuf = Buffer.from(await selected.stats().lastBlob.arrayBuffer());
  assert.ok(!selZipBuf.includes(Buffer.from('Fotos/1_boda.webp')), 'Unselected item must not be in ZIP.');
  assert.ok(selZipBuf.includes(Buffer.from('Videos/2_baile.mp4')), 'Selected item missing from ZIP.');

  console.log('PASS: client-side ZIP64 (Blob + streaming picker + selected ids), direct R2 fetches, valid ZIP binary, CORS guidance, retry and abort.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
