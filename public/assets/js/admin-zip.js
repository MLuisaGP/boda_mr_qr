/* Album export: incremental server preparation, then measured ZIP download. */
(function () {
  'use strict';
  const button = document.getElementById('btnOpenR2Guide');
  const progress = document.getElementById('albumZipProgress');
  if (!button || !progress) return;
  const byId = (id) => document.getElementById(id);
  const stop = byId('albumZipStop');
  const retry = byId('albumZipRetry');
  const save = byId('albumZipSave');
  let savedZipUrl = null;
  let savedZipName = 'Album_Michelle_y_Rene.zip';
  save.disabled = true;
  save.hidden = true;

  function saveZip() {
    if (!savedZipUrl) return;
    const link = document.createElement('a');
    link.href = savedZipUrl;
    link.download = savedZipName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
  save.addEventListener('click', saveZip);
  let running = false;
  let abortController = null;
  let transfer = null;

  function update(percent, stage, message) {
    if (percent === null) {
      progress.removeAttribute('value');
      byId('albumZipPercent').textContent = '…';
    } else {
      progress.value = percent;
      byId('albumZipPercent').textContent = Math.floor(percent) + '%';
    }
    byId('albumZipStage').textContent = stage;
    byId('albumZipStatus').textContent = message;
  }

  function bytes(value) {
    return value >= 1073741824 ? (value / 1073741824).toFixed(2) + ' GB' : (value / 1048576).toFixed(1) + ' MB';
  }

  async function request(action, data = {}, signal) {
    const response = await fetch('/api/zip-download', {
      method: 'POST', credentials: 'same-origin', cache: 'no-store', signal,
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({ action, ...data })
    });
    let result;
    try { result = await response.json(); }
    catch (error) { throw new Error('El servidor interrumpió la preparación. Puedes reintentar sin perder el avance.'); }
    if (!response.ok || !result.success) {
      const detail = result.reference ? ' Referencia: ' + result.reference + ' (' + (result.stage || action) + ').' : '';
      throw new Error((result.error || 'No se pudo preparar el álbum.') + detail);
    }
    return result;
  }

  function download(state, signal) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      transfer = xhr;
      xhr.open('GET', '/api/zip-download?action=file&job=' + encodeURIComponent(state.job));
      xhr.responseType = 'blob';
      xhr.onprogress = (event) => {
        const total = event.lengthComputable ? event.total : state.zip_bytes;
        const fraction = total > 0 ? Math.min(event.loaded / total, 1) : 0;
        update(Math.min(99, 60 + fraction * 40), 'Descargando ZIP', bytes(event.loaded) + ' de ' + bytes(total) + ' recibidos');
      };
      xhr.onerror = () => reject(new Error('Se interrumpió la descarga. Reintenta para descargar el ZIP ya preparado.'));
      xhr.onabort = () => reject(new DOMException('Descarga detenida', 'AbortError'));
      xhr.onload = async () => {
        try {
          if (xhr.status !== 200 || !xhr.getResponseHeader('Content-Type')?.includes('application/zip')) {
            let message = 'No se pudo descargar el ZIP. Reintenta.';
            try { message = JSON.parse(await xhr.response.text()).error || message; } catch (error) { /* Non-JSON hosting error. */ }
            throw new Error(message);
          }
          if (xhr.response.size !== state.zip_bytes) throw new Error('La descarga quedó incompleta. Reintenta para recibir el ZIP completo.');
          resolve(xhr.response);
        } catch (error) { reject(error); }
      };
      const abort = () => xhr.abort();
      signal.addEventListener('abort', abort, { once: true });
      xhr.onloadend = () => { signal.removeEventListener('abort', abort); transfer = null; };
      if (signal.aborted) { reject(new DOMException('Descarga detenida', 'AbortError')); return; }
      xhr.send();
    });
  }

  async function begin() {
    if (running) return;
    running = true;
    save.disabled = true;
    save.hidden = true;
    if (savedZipUrl) URL.revokeObjectURL(savedZipUrl);
    savedZipUrl = null;
    abortController = new AbortController();
    const signal = abortController.signal;
    stop.hidden = false;
    stop.disabled = false;
    retry.hidden = true;
    byId('albumZipProgressWrap').setAttribute('aria-busy', 'true');
    update(null, 'Preparando álbum', 'Reuniendo todas las fotos y videos publicados…');
    try {
      let state = await request('start', {}, signal);
      while (!state.ready) {
        const fraction = state.total_bytes > 0 ? state.bytes / state.total_bytes : state.completed / state.total;
        update(fraction * 60, 'Preparando ZIP', state.completed + ' de ' + state.total + ' recuerdos preparados. Mantén esta página abierta.');
        state = await request('step', { job: state.job, completed: state.completed }, signal);
      }
      update(60, 'Descargando ZIP', state.total + ' recuerdos listos. Recibiendo ' + bytes(state.zip_bytes) + '…');
      const blob = await download(state, signal);
      if (signal.aborted) throw new DOMException('Descarga detenida', 'AbortError');
      savedZipUrl = URL.createObjectURL(blob);
      savedZipName = state.filename;
      save.disabled = false;
      save.hidden = false;
      saveZip();
      update(100, 'ZIP descargado', state.total + ' recuerdos recibidos.');
      stop.hidden = true;
      // Cleanup is best-effort; abandoned temporary exports also expire automatically.
      await request('release', { job: state.job }).catch(() => {});
    } catch (error) {
      if (error.name === 'AbortError') {
        update(progress.hasAttribute('value') ? progress.value : 0, 'Descarga detenida', 'Puedes reanudar la preparación con Reintentar descarga.');
      } else {
        update(progress.hasAttribute('value') ? progress.value : 0, 'No se pudo completar', error.message || 'Ocurrió un error. Intenta de nuevo.');
      }
      retry.hidden = false;
    } finally {
      running = false;
      stop.hidden = true;
      byId('albumZipProgressWrap').setAttribute('aria-busy', 'false');
    }
  }

  button.addEventListener('click', begin);
  retry.addEventListener('click', begin);
  stop.addEventListener('click', () => {
    stop.disabled = true;
    abortController?.abort();
    transfer?.abort();
  });
  window.addEventListener('beforeunload', (event) => {
    if (running) { event.preventDefault(); event.returnValue = ''; }
  });
})();
