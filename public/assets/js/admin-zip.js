/* Album export: client-side ZIP64 (STORE) directly from R2 to avoid hosting load. */
(function () {
  'use strict';
  const button = document.getElementById('btnOpenR2Guide');
  const progress = document.getElementById('albumZipProgress');
  if (!button || !progress) return;
  const byId = (id) => document.getElementById(id);
  const stop = byId('albumZipStop');
  const retry = byId('albumZipRetry');
  const save = byId('albumZipSave');
  const encoder = new TextEncoder();

  // Precomputed IEEE 802.3 CRC32 table for ZIP integrity headers.
  const CRC_TABLE = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    CRC_TABLE[i] = c >>> 0;
  }

  function crc32Update(crc, bytes) {
    let c = crc >>> 0;
    for (let i = 0; i < bytes.length; i++) {
      c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
    }
    return c >>> 0;
  }

  function setUint64(view, offset, value) {
    view.setUint32(offset, value >>> 0, true);
    view.setUint32(offset + 4, Math.floor(value / 0x100000000) >>> 0, true);
  }

  function localHeader(nameBytes) {
    const buf = new Uint8Array(30 + nameBytes.length);
    const view = new DataView(buf.buffer);
    view.setUint32(0, 0x04034b50, true);
    view.setUint16(4, 20, true);     // Version needed: 2.0 (matches Central Directory for <4 GiB entries)
    view.setUint16(6, 0x0808, true); // UTF-8 + Data Descriptor
    view.setUint16(8, 0, true);      // Method 0: STORE (media is already compressed)
    view.setUint16(10, 0, true);     // Mod time
    view.setUint16(12, 33, true);    // Mod date (1980-01-01)
    view.setUint16(26, nameBytes.length, true);
    buf.set(nameBytes, 30);
    return buf;
  }

  function dataDescriptor(crc, size, isZip64) {
    const buf = new Uint8Array(isZip64 ? 24 : 16);
    const view = new DataView(buf.buffer);
    view.setUint32(0, 0x08074b50, true);
    view.setUint32(4, crc >>> 0, true);
    if (isZip64) {
      setUint64(view, 8, size);
      setUint64(view, 16, size);
    } else {
      view.setUint32(8, size >>> 0, true);
      view.setUint32(12, size >>> 0, true);
    }
    return buf;
  }

  function centralDirectoryAndEnd(entries, cdStart) {
    const parts = [];
    let cdSize = 0;
    for (const entry of entries) {
      const largeSize = entry.size >= 0xffffffff;
      const largeOffset = entry.offset >= 0xffffffff;
      const extraLen = (largeSize ? 16 : 0) + (largeOffset ? 8 : 0);
      const extraTotal = extraLen ? extraLen + 4 : 0;
      const buf = new Uint8Array(46 + entry.nameBytes.length + extraTotal);
      const view = new DataView(buf.buffer);
      view.setUint32(0, 0x02014b50, true);
      view.setUint16(4, 45, true);
      view.setUint16(6, (largeSize || largeOffset) ? 45 : 20, true);
      view.setUint16(8, 0x0808, true);
      view.setUint16(10, 0, true);
      view.setUint16(12, 0, true);
      view.setUint16(14, 33, true);
      view.setUint32(16, entry.crc >>> 0, true);
      view.setUint32(20, largeSize ? 0xffffffff : entry.size >>> 0, true);
      view.setUint32(24, largeSize ? 0xffffffff : entry.size >>> 0, true);
      view.setUint16(28, entry.nameBytes.length, true);
      view.setUint16(30, extraTotal, true);
      view.setUint32(42, largeOffset ? 0xffffffff : entry.offset >>> 0, true);
      buf.set(entry.nameBytes, 46);
      if (extraTotal) {
        let pos = 46 + entry.nameBytes.length;
        view.setUint16(pos, 1, true);
        view.setUint16(pos + 2, extraLen, true);
        pos += 4;
        if (largeSize) {
          setUint64(view, pos, entry.size);
          setUint64(view, pos + 8, entry.size);
          pos += 16;
        }
        if (largeOffset) setUint64(view, pos, entry.offset);
      }
      parts.push(buf);
      cdSize += buf.length;
    }

    const cdEnd = cdStart + cdSize;
    const count = entries.length;

    // ZIP64 End of Central Directory (56 bytes) + Locator (20 bytes) + EOCD (22 bytes)
    const tail = new Uint8Array(56 + 20 + 22);
    const view = new DataView(tail.buffer);
    view.setUint32(0, 0x06064b50, true);
    setUint64(view, 4, 44);
    view.setUint16(12, 45, true);
    view.setUint16(14, 45, true);
    setUint64(view, 24, count);
    setUint64(view, 32, count);
    setUint64(view, 40, cdSize);
    setUint64(view, 48, cdStart);

    view.setUint32(56, 0x07064b50, true);
    view.setUint32(60, 0, true);
    setUint64(view, 64, cdEnd);
    view.setUint32(72, 1, true);

    view.setUint32(76, 0x06054b50, true);
    view.setUint16(84, Math.min(count, 65535), true);
    view.setUint16(86, Math.min(count, 65535), true);
    view.setUint32(88, Math.min(cdSize, 0xffffffff) >>> 0, true);
    view.setUint32(92, Math.min(cdStart, 0xffffffff) >>> 0, true);
    parts.push(tail);
    return parts;
  }

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
  let activeIds = null;

  function normalizeIds(ids) {
    if (!Array.isArray(ids)) return null;
    const clean = Array.from(new Set(ids.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0)));
    return clean.length ? clean : null;
  }

  function updateModalCopy(ids) {
    const titleEl = byId('r2GuideTitle');
    const descEl = byId('albumZipDescription');
    if (ids && ids.length) {
      if (titleEl) titleEl.textContent = 'Descargar selección';
      if (descEl) descEl.textContent = ids.length === 1
        ? 'Incluye 1 recuerdo seleccionado en un archivo comprimido.'
        : 'Incluye los ' + ids.length + ' recuerdos seleccionados en un archivo comprimido.';
    } else {
      if (titleEl) titleEl.textContent = 'Descargar álbum';
      if (descEl) descEl.textContent = 'Incluye todas las fotos y videos publicados en un archivo comprimido.';
    }
  }

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

  function formatBytes(value) {
    return value >= 1073741824 ? (value / 1073741824).toFixed(2) + ' GB' : (value / 1048576).toFixed(1) + ' MB';
  }

  async function fetchManifest(signal, ids) {
    const payload = ids && ids.length ? { action: 'manifest', ids } : { action: 'manifest' };
    const response = await fetch('/api/zip-download', {
      method: 'POST', credentials: 'same-origin', cache: 'no-store', signal,
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify(payload)
    });
    let result;
    try { result = await response.json(); }
    catch (error) { throw new Error('El servidor no pudo responder la lista del álbum. Reintenta.'); }
    if (!response.ok || !result.success) {
      const detail = result.reference ? ' Referencia: ' + result.reference + '.' : '';
      throw new Error((result.error || 'No se pudo obtener la lista del álbum.') + detail);
    }
    return result;
  }

  async function fetchMediaItem(item, signal) {
    const isRemote = /^https?:\/\//i.test(item.url);
    try {
      const response = await fetch(item.url, {
        method: 'GET',
        mode: isRemote ? 'cors' : 'same-origin',
        credentials: isRemote ? 'omit' : 'same-origin',
        cache: 'no-store',
        signal
      });
      if (!response.ok) {
        throw new Error('No se pudo descargar un recuerdo (HTTP ' + response.status + '). Reintenta.');
      }
      return response;
    } catch (error) {
      if (error.name === 'AbortError') throw error;
      if (isRemote && error && error.name === 'TypeError') {
        throw new Error('No se pudo descargar directo desde R2. Verifica que el bucket tenga CORS habilitado para GET desde este dominio.');
      }
      throw error;
    }
  }

  async function begin(requestedIds = null) {
    if (running) return;

    const selectedIds = normalizeIds(requestedIds);
    activeIds = selectedIds;
    savedZipName = selectedIds ? 'Seleccion_Michelle_y_Rene.zip' : 'Album_Michelle_y_Rene.zip';
    updateModalCopy(selectedIds);

    // Request file handle synchronously inside the user click gesture when supported (streams straight to disk).
    let fileHandle = null;
    if (typeof window.showSaveFilePicker === 'function') {
      try {
        fileHandle = await window.showSaveFilePicker({
          suggestedName: savedZipName,
          types: [{ description: 'Archivo ZIP', accept: { 'application/zip': ['.zip'] } }]
        });
      } catch (error) {
        if (error && error.name === 'AbortError') {
          update(0, 'Descarga cancelada', 'Elige una ubicación cuando estés listo para guardar el archivo.');
          return;
        }
        // Fallback to in-memory Blob download if picker fails for another reason.
        fileHandle = null;
      }
    }

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
    update(null, 'Obteniendo lista', selectedIds ? 'Consultando los recuerdos seleccionados…' : 'Consultando todas las fotos y videos publicados…');

    let writable = null;
    const blobParts = fileHandle ? null : [];
    const entries = [];
    let offset = 0;

    const writeChunk = async (chunk) => {
      if (writable) {
        await writable.write(chunk);
      } else {
        blobParts.push(chunk);
      }
      offset += chunk.byteLength;
    };

    try {
      const manifest = await fetchManifest(signal, selectedIds);
      const items = Array.isArray(manifest.items) ? manifest.items : [];
      if (!items.length) throw new Error('Todavía no hay recuerdos para descargar.');

      savedZipName = manifest.filename || savedZipName;
      const totalItems = items.length;
      const totalBytes = Number(manifest.total_bytes) || 0;
      let downloadedBytes = 0;

      if (fileHandle) {
        writable = await fileHandle.createWritable();
      }

      for (let i = 0; i < totalItems; i++) {
        if (signal.aborted) throw new DOMException('Descarga detenida', 'AbortError');
        const item = items[i];
        const nameBytes = encoder.encode(item.name);
        const entryOffset = offset;
        await writeChunk(localHeader(nameBytes));

        const response = await fetchMediaItem(item, signal);
        let crc = 0xffffffff;
        let size = 0;

        if (response.body && typeof response.body.getReader === 'function') {
          const reader = response.body.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (signal.aborted) {
              await reader.cancel().catch(() => {});
              throw new DOMException('Descarga detenida', 'AbortError');
            }
            crc = crc32Update(crc, value);
            size += value.byteLength;
            downloadedBytes += value.byteLength;
            await writeChunk(value);
            const pct = totalBytes > 0
              ? Math.min(99, (downloadedBytes / totalBytes) * 100)
              : Math.min(99, ((i + 0.5) / totalItems) * 100);
            update(
              pct,
              'Descargando álbum',
              (i + 1) + ' de ' + totalItems + ' recuerdos (' + formatBytes(downloadedBytes) + (totalBytes > 0 ? ' de ' + formatBytes(totalBytes) : '') + '). Mantén esta página abierta.'
            );
          }
        } else {
          const data = new Uint8Array(await response.arrayBuffer());
          crc = crc32Update(crc, data);
          size = data.byteLength;
          downloadedBytes += size;
          await writeChunk(data);
        }

        crc = (crc ^ 0xffffffff) >>> 0;
        const isZip64 = size >= 0xffffffff;
        await writeChunk(dataDescriptor(crc, size, isZip64));
        entries.push({ nameBytes, crc, size, offset: entryOffset });

        const pct = totalBytes > 0
          ? Math.min(99, (downloadedBytes / totalBytes) * 100)
          : Math.min(99, ((i + 1) / totalItems) * 100);
        update(
          pct,
          'Descargando álbum',
          (i + 1) + ' de ' + totalItems + ' recuerdos (' + formatBytes(downloadedBytes) + (totalBytes > 0 ? ' de ' + formatBytes(totalBytes) : '') + ').'
        );
      }

      const closingParts = centralDirectoryAndEnd(entries, offset);
      for (const part of closingParts) await writeChunk(part);

      if (writable) {
        await writable.close();
        writable = null;
        update(100, 'ZIP guardado', totalItems + ' recuerdos guardados (' + formatBytes(offset) + ').');
      } else {
        const blob = new Blob(blobParts, { type: 'application/zip' });
        savedZipUrl = URL.createObjectURL(blob);
        save.disabled = false;
        save.hidden = false;
        saveZip();
        update(100, 'ZIP descargado', totalItems + ' recuerdos recibidos (' + formatBytes(blob.size) + ').');
      }
      stop.hidden = true;
    } catch (error) {
      if (writable) {
        await writable.abort().catch(() => {});
        writable = null;
      }
      if (error && error.name === 'AbortError') {
        update(progress.hasAttribute('value') ? progress.value : 0, 'Descarga detenida', 'Puedes iniciar de nuevo con Reintentar descarga.');
      } else {
        update(progress.hasAttribute('value') ? progress.value : 0, 'No se pudo completar', (error && error.message) || 'Ocurrió un error. Intenta de nuevo.');
      }
      retry.hidden = false;
    } finally {
      running = false;
      stop.hidden = true;
      byId('albumZipProgressWrap').setAttribute('aria-busy', 'false');
    }
  }

  button.addEventListener('click', () => begin(null));
  retry.addEventListener('click', () => begin(activeIds));
  window.startAdminZipDownload = (ids) => begin(ids);
  stop.addEventListener('click', () => {
    stop.disabled = true;
    abortController?.abort();
  });
  window.addEventListener('beforeunload', (event) => {
    if (running) { event.preventDefault(); event.returnValue = ''; }
  });
})();
