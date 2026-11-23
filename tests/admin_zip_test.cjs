// Browser-flow test with synthetic DOM and network; no backend or real media.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const code = fs.readFileSync('public/assets/js/admin-zip.js', 'utf8');
class Element {
  constructor() { this.handlers = {}; this.attrs = {}; this.value = 0; this.hidden = true; }
  addEventListener(event, fn) { this.handlers[event] = fn; }
  setAttribute(key, value) { this.attrs[key] = value; }
  removeAttribute(key) { delete this.attrs[key]; }
  hasAttribute(key) { return key === 'value' ? true : key in this.attrs; }
  remove() {}
  click() { this.handlers.click?.(); }
}

function harness({ failStep = false, failDownload = false, holdStart = false } = {}) {
  const elements = new Map();
  const get = (id) => {
    if (!elements.has(id)) elements.set(id, new Element());
    return elements.get(id);
  };
  const requests = [];
  let downloads = 0;
  let saves = 0;
  let released = false;
  let didFail = false;
  let completed = 0;
  const state = () => ({ success: true, job: 'a'.repeat(32), completed, total: 2,
    total_bytes: 20, bytes: completed * 10, ready: completed === 2, zip_bytes: 100, filename: 'album.zip' });
  class XHR {
    open(method, url) { assert.equal(method, 'GET'); assert.match(url, /action=file&job=/); }
    getResponseHeader() { return 'application/zip'; }
    send() {
      downloads++;
      queueMicrotask(() => {
        if (failDownload && downloads === 1) { this.onerror(); this.onloadend(); return; }
        this.onprogress({ lengthComputable: true, total: 100, loaded: 50 });
        assert.equal(get('albumZipProgress').value, 80);
        this.status = 200;
        this.response = { size: 100 };
        this.onload();
        this.onloadend();
      });
    }
    abort() { this.onabort?.(); this.onloadend?.(); }
  }
  vm.runInNewContext(code, {
    document: { getElementById: get, body: { appendChild() {} }, createElement() {
      const link = new Element();
      link.click = () => { saves++; };
      return link;
    } },
    fetch: async (url, options) => {
      assert.equal(url, '/api/zip-download');
      assert.equal(options.headers['X-Requested-With'], 'XMLHttpRequest');
      const request = JSON.parse(options.body);
      requests.push(request);
      if (holdStart && request.action === 'start') {
        await new Promise((resolve, reject) => options.signal.addEventListener('abort', () => reject(new DOMException('', 'AbortError'))));
      }
      if (request.action === 'step') {
        if (failStep && !didFail) { didFail = true; return { ok: false, json: async () => ({ error: 'Fallo de prueba' }) }; }
        assert.equal(request.completed, completed);
        completed++;
      }
      if (request.action === 'release') released = true;
      return { ok: true, json: async () => state() };
    },
    XMLHttpRequest: XHR, AbortController, DOMException,
    URL: { createObjectURL: () => 'blob:test', revokeObjectURL() {} },
    window: { addEventListener() {} }, setTimeout() {},
  });
  return { get, requests, stats: () => ({ downloads, saves, released }) };
}
const tick = async () => { for (let i = 0; i < 12; i++) await new Promise(resolve => setImmediate(resolve)); };

(async () => {
  const normal = harness();
  normal.get('btnOpenR2Guide').click();
  normal.get('btnOpenR2Guide').click();
  await tick();
  assert.deepEqual(normal.requests.map(r => r.action), ['start', 'step', 'step', 'release']);
  assert.equal(normal.get('albumZipProgress').value, 100);
  assert.deepEqual(normal.stats(), { downloads: 1, saves: 1, released: true });
  assert.equal(normal.get('albumZipProgressWrap').attrs['aria-busy'], 'false');
  assert.equal(normal.get('albumZipSave').disabled, false);
  assert.equal(normal.get('albumZipSave').hidden, false);
  normal.get('albumZipSave').click();
  assert.equal(normal.stats().saves, 2);
  assert.equal(normal.stats().downloads, 1, 'Manual save must reuse the received ZIP.');

  const failure = harness({ failStep: true });
  failure.get('btnOpenR2Guide').click(); await tick();
  assert.equal(failure.get('albumZipRetry').hidden, false);
  assert.equal(failure.stats().downloads, 0);
  assert.equal(failure.get('albumZipSave').disabled, true);
  assert.equal(failure.get('albumZipSave').hidden, true);
  assert.equal(failure.get('albumZipStatus').textContent, 'Fallo de prueba');
  failure.get('albumZipRetry').click(); await tick();
  assert.equal(failure.stats().saves, 1);

  const interrupted = harness({ failDownload: true });
  interrupted.get('btnOpenR2Guide').click(); await tick();
  assert.equal(interrupted.stats().released, false);
  assert.equal(interrupted.get('albumZipSave').hidden, true);
  interrupted.get('albumZipRetry').click(); await tick();
  assert.equal(interrupted.requests.filter(r => r.action === 'step').length, 2);
  assert.equal(interrupted.stats().saves, 1);

  const stopped = harness({ holdStart: true });
  stopped.get('btnOpenR2Guide').click();
  stopped.get('albumZipStop').click(); await tick();
  assert.equal(stopped.get('albumZipStage').textContent, 'Descarga detenida');
  assert.equal(stopped.get('albumZipRetry').hidden, false);
  assert.equal(stopped.stats().saves, 0);
  assert.equal(stopped.get('albumZipSave').hidden, true);
  console.log('PASS: one-click export, double-click guard, measured download progress, errors, resumable retries, stop and cleanup.');
})().catch(error => { console.error(error); process.exitCode = 1; });
