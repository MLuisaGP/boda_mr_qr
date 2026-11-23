<?php
/**
 * Vista imprimible / PDF del Libro de Firmas para los novios.
 * Recibe: $entries (array), $order ('asc'|'desc'), $generatedAt (string)
 */

declare(strict_types=1);

$entries = is_array($entries ?? null) ? $entries : [];
$order = ($order ?? 'asc') === 'desc' ? 'desc' : 'asc';
$totalEntries = count($entries);
$initialPages = $totalEntries > 0 ? array_chunk($entries, 5) : [[]];
$initialPageCount = count($initialPages);
$totalSheets = 2 + $initialPageCount;

$payloadEntries = array_map(static function (array $row): array {
    return [
        'id' => (int) ($row['id'] ?? 0),
        'guest_name' => (string) ($row['guest_name'] ?? 'Invitado'),
        'message' => (string) ($row['message'] ?? ''),
        'font_family' => (string) ($row['font_family'] ?? 'ballet'),
        'created_at' => (string) ($row['created_at'] ?? ''),
    ];
}, $entries);

$fontsCoreUrl = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Plus+Jakarta+Sans:wght@400;500;600&family=Tangerine:wght@400;700&family=Italianno&display=swap';

$allowedFonts = ['ballet', 'lavishly_yours', 'tangerine', 'annie_use_your_telescope', 'indie_flower', 'oooh_baby', 'italianno'];
$signatureFontMap = [
    'ballet' => 'family=Ballet',
    'lavishly_yours' => 'family=Lavishly+Yours',
    'annie_use_your_telescope' => 'family=Annie+Use+Your+Telescope',
    'indie_flower' => 'family=Indie+Flower',
    'oooh_baby' => 'family=Oooh+Baby',
];
$neededSigFamilies = [];
foreach ($payloadEntries as $item) {
    $rawFont = trim($item['font_family']);
    if (!in_array($rawFont, $allowedFonts, true)) {
        $rawFont = $allowedFonts[abs($item['id']) % count($allowedFonts)];
    }
    if (isset($signatureFontMap[$rawFont])) {
        $neededSigFamilies[$rawFont] = $signatureFontMap[$rawFont];
    }
}
$fontsSignaturesUrl = !empty($neededSigFamilies)
    ? 'https://fonts.googleapis.com/css2?' . implode('&', array_values($neededSigFamilies)) . '&display=swap'
    : '';
?>
<!DOCTYPE html>
<html lang="es-MX">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Libro de Firmas · Michelle &amp; René (PDF)</title>
  <link rel="icon" type="image/svg+xml" href="/assets/img/m&amp;r.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="<?= htmlspecialchars($fontsCoreUrl, ENT_QUOTES, 'UTF-8') ?>">
  <?php if ($fontsSignaturesUrl !== ''): ?>
  <link rel="stylesheet" href="<?= htmlspecialchars($fontsSignaturesUrl, ENT_QUOTES, 'UTF-8') ?>">
  <?php endif; ?>
  <link rel="stylesheet" href="/assets/css/guestbook-pdf.css?v=7">
</head>
<body>
  <!-- Barra de controles solo visible en pantalla -->
  <header class="pdf-toolbar no-print">
    <div class="pdf-toolbar-inner">
      <div class="pdf-toolbar-left">
        <a href="/novios" class="pdf-btn pdf-btn-outline">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5m6 6-6-6 6-6"/></svg>
          Volver al panel
        </a>
        <div class="pdf-toolbar-meta">
          <span class="pdf-toolbar-title">Libro de Firmas · PDF</span>
          <span class="pdf-toolbar-summary" id="pdfBookSummary" role="status" aria-live="polite">
            <?= $totalEntries ?> <?= $totalEntries === 1 ? 'firma' : 'firmas' ?> · <?= $totalSheets ?> <?= $totalSheets === 1 ? 'hoja' : 'hojas' ?> (incluye portada y contraportada)
          </span>
        </div>
      </div>

      <div class="pdf-toolbar-right">
        <label class="pdf-order-label" for="pdfOrderSelect">
          <span>Orden:</span>
          <select id="pdfOrderSelect" class="pdf-order-select">
            <option value="asc"<?= $order === 'asc' ? ' selected' : '' ?>>Más antiguas primero</option>
            <option value="desc"<?= $order === 'desc' ? ' selected' : '' ?>>Más recientes primero</option>
          </select>
        </label>

        <button type="button" id="btnPrintGuestbookPdf" class="pdf-btn pdf-btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Guardar como PDF
        </button>
      </div>
    </div>
    <p class="pdf-toolbar-tip">
      En el diálogo de impresión elige <strong>Guardar como PDF</strong>, orientación <strong>Vertical (Carta)</strong> y activa <strong>Gráficos de fondo</strong> para conservar el papel pergamino y la portada.
    </p>
  </header>

  <main class="pdf-book-preview" id="pdfBookPreview">
    <!-- HOJA 1: PORTADA DEL LIBRO DE HONOR -->
    <section class="pdf-sheet pdf-sheet-cover" aria-label="Portada del Libro de Honor">
      <div class="pdf-cover-spine" aria-hidden="true"></div>
      <div class="pdf-cover-ribbon" aria-hidden="true"></div>
      <div class="pdf-cover-frame">
        <div class="pdf-cover-top">
          <span class="pdf-cover-kicker">Recuerdo de Nuestra Boda</span>
        </div>

        <div class="pdf-cover-center">
          <img class="pdf-cover-monogram" src="/assets/img/monogram-mr-pdf.svg" alt="Monograma Michelle y René" width="1371" height="1313">
          <div class="pdf-cover-ornament" aria-hidden="true">
            <span></span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            <span></span>
          </div>
          <p class="pdf-cover-eyebrow">Libro de Honor</p>
          <h1 class="pdf-cover-names">Michelle <span class="pdf-cover-amp">&amp;</span> Ren&#233;</h1>
          <p class="pdf-cover-date">19 &#183; XII &#183; 2026</p>
          <span class="pdf-cover-divider" aria-hidden="true"></span>
          <p class="pdf-cover-subtitle">
            Palabras, bendiciones y buenos deseos escritos con cariño por quienes nos acompañaron en este día inolvidable.
          </p>
        </div>

        <div class="pdf-cover-footer">
          <span class="pdf-cover-count">
            <?= $totalEntries ?> <?= $totalEntries === 1 ? 'Dedicatoria' : 'Dedicatorias' ?>
          </span>
        </div>
      </div>
    </section>

    <!-- HOJAS INTERIORES (RENDER INICIAL PHP + REPÁGINACIÓN PRECISA POR FUENTE EN JS) -->
    <div id="pdfInteriorPages" style="display: contents;">
      <?php foreach ($initialPages as $pageIndex => $pageEntries): ?>
        <?php $pageNum = $pageIndex + 1; ?>
        <section class="pdf-sheet pdf-sheet-page" aria-label="Hoja <?= $pageNum ?> de <?= $initialPageCount ?>">
          <div class="pdf-paper-page">
            <div class="pdf-paper-running-head">
              <span>Libro de Honor &#183; M &amp; R</span>
              <span>Hoja <?= $pageNum ?> de <?= $initialPageCount ?></span>
            </div>

            <?php if (empty($pageEntries)): ?>
              <div class="pdf-paper-empty">
                <p class="pdf-paper-empty-title">El libro espera sus primeras palabras</p>
                <p class="pdf-paper-empty-sub">
                  Cuando los invitados firmen el libro digital, sus dedicatorias aparecerán aquí con su tipografía original.
                </p>
              </div>
            <?php else: ?>
              <div class="pdf-paper-entries">
                <?php foreach ($pageEntries as $entry): ?>
                  <?php
                    $fontKey = (string) ($entry['font_family'] ?? 'ballet');
                    $author = (string) ($entry['guest_name'] ?? 'Invitado');
                    $message = trim((string) ($entry['message'] ?? ''));
                    $isLong = mb_strlen($message) > 260;
                  ?>
                  <article class="pdf-signature-entry sig-font-<?= htmlspecialchars($fontKey, ENT_QUOTES, 'UTF-8') ?><?= $isLong ? ' is-long-entry' : '' ?>">
                    <p class="pdf-sig-message"><?= htmlspecialchars($message, ENT_QUOTES, 'UTF-8') ?></p>
                    <div class="pdf-sig-footer">
                      <span class="pdf-sig-author">&#8212; <?= htmlspecialchars($author, ENT_QUOTES, 'UTF-8') ?></span>
                    </div>
                  </article>
                <?php endforeach; ?>
              </div>
            <?php endif; ?>

            <div class="pdf-paper-footer">
              <span>Michelle &amp; Ren&#233; &#183; 19 &#183; XII &#183; 2026</span>
              <span><?= $pageNum ?> / <?= $initialPageCount ?></span>
            </div>
          </div>
        </section>
      <?php endforeach; ?>
    </div>

    <!-- CONTRAPORTADA DEL LIBRO DE HONOR -->
    <section class="pdf-sheet pdf-sheet-backcover" aria-label="Contraportada del Libro de Honor">
      <div class="pdf-backcover-spine" aria-hidden="true"></div>
      <div class="pdf-backcover-frame">
        <div class="pdf-cover-top">
          <span class="pdf-backcover-eyebrow">Gracias por ser parte de nuestra historia</span>
        </div>

        <div class="pdf-backcover-center">
          <div class="pdf-cover-ornament" aria-hidden="true">
            <span></span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            <span></span>
          </div>

          <p class="pdf-backcover-quote">
            &#171;Cada palabra escrita en estas p&#225;ginas es un tesoro que guardaremos por siempre en nuestro coraz&#243;n. Gracias por acompa&#241;arnos, celebrar nuestro amor y llenar este d&#237;a de alegr&#237;a y bendiciones.&#187;
          </p>

          <span class="pdf-cover-divider" aria-hidden="true"></span>

          <div class="pdf-backcover-closing">
            <span class="pdf-backcover-love">Con todo nuestro amor</span>
            <span class="pdf-backcover-sign">Michelle &amp; Ren&#233;</span>
          </div>
        </div>

        <div class="pdf-backcover-footer">
          <img class="pdf-backcover-monogram" src="/assets/img/monogram-mr-pdf.svg" alt="Monograma Michelle y René" width="1371" height="1313">
          <span class="pdf-backcover-date">19 &#183; XII &#183; 2026</span>
        </div>
      </div>
    </section>
  </main>

  <script type="application/json" id="pdfGuestbookData"><?= json_encode($payloadEntries, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?></script>

  <script>
  (function () {
    'use strict';

    const ALLOWED_FONTS = ['ballet', 'lavishly_yours', 'tangerine', 'annie_use_your_telescope', 'indie_flower', 'oooh_baby', 'italianno'];
    const MAX_PER_PAGE = 5;

    const dataNode = document.getElementById('pdfGuestbookData');
    const interiorHost = document.getElementById('pdfInteriorPages');
    const summaryEl = document.getElementById('pdfBookSummary');
    const orderSelect = document.getElementById('pdfOrderSelect');
    const printBtn = document.getElementById('btnPrintGuestbookPdf');

    let baseEntries = [];
    try {
      baseEntries = JSON.parse(dataNode ? dataNode.textContent : '[]');
      if (!Array.isArray(baseEntries)) baseEntries = [];
    } catch (_) {
      baseEntries = [];
    }

    const initialOrder = orderSelect ? orderSelect.value : 'asc';
    let currentOrder = initialOrder;

    function resolveFont(entry) {
      const raw = entry && typeof entry.font_family === 'string' ? entry.font_family.trim() : '';
      if (ALLOWED_FONTS.includes(raw)) return raw;
      const seed = Math.abs(Number(entry && entry.id ? entry.id : 0));
      return ALLOWED_FONTS[seed % ALLOWED_FONTS.length];
    }

    function escapeHtml(str) {
      return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function buildEntryElement(entry, options = {}) {
      const fontKey = resolveFont(entry);
      const message = String(options.message !== undefined ? options.message : (entry.message || '')).trim();
      const author = String(entry.guest_name || 'Invitado').trim() || 'Invitado';
      const showAuthor = options.showAuthor !== false;
      const isLong = Boolean(options.isLong !== undefined ? options.isLong : (String(entry.message || '').trim().length > 260));

      const article = document.createElement('article');
      article.className = 'pdf-signature-entry sig-font-' + fontKey +
        (isLong ? ' is-long-entry' : '') +
        (options.isContinued ? ' is-continued' : '') +
        (options.isContinuation ? ' is-continuation' : '');

      const p = document.createElement('p');
      p.className = 'pdf-sig-message';
      p.textContent = message;
      article.appendChild(p);

      if (showAuthor) {
        const footer = document.createElement('div');
        footer.className = 'pdf-sig-footer';

        const authorSpan = document.createElement('span');
        authorSpan.className = 'pdf-sig-author';
        authorSpan.textContent = '\u2014 ' + author;

        footer.appendChild(authorSpan);
        article.appendChild(footer);
      }
      return article;
    }

    function getOrderedEntries() {
      const list = baseEntries.slice();
      if (currentOrder !== initialOrder) {
        list.reverse();
      }
      return list;
    }

    function paginateEntries() {
      if (!interiorHost) return;
      const entries = getOrderedEntries();

      if (entries.length === 0) {
        updateSummary(0, 1);
        return;
      }

      // Medir en una hoja clonada fuera de pantalla con dimensiones exactas de impresión
      const stage = document.createElement('div');
      stage.className = 'pdf-measure-stage';

      const probeSheet = document.createElement('section');
      probeSheet.className = 'pdf-sheet pdf-sheet-page';
      probeSheet.innerHTML =
        '<div class="pdf-paper-page">' +
          '<div class="pdf-paper-running-head"><span>Libro de Honor \u00B7 M &amp; R</span><span>Hoja 1 de 1</span></div>' +
          '<div class="pdf-paper-entries"></div>' +
          '<div class="pdf-paper-footer"><span>Michelle &amp; Ren\u00E9 \u00B7 19 \u00B7 XII \u00B7 2026</span><span>1 / 1</span></div>' +
        '</div>';

      stage.appendChild(probeSheet);
      document.body.appendChild(stage);

      const probeEntriesBox = probeSheet.querySelector('.pdf-paper-entries');
      const maxBoxHeight = Math.max(200, probeEntriesBox.clientHeight - 6);
      const ENTRY_GAP = 36;

      function measureItem(item) {
        const el = buildEntryElement(item.entry, item.options);
        probeEntriesBox.replaceChildren(el);
        return Math.ceil(el.getBoundingClientRect().height);
      }

      // Divide el texto por tokens (palabras + espacios/saltos) para llenar el espacio disponible sin cortar palabras
      function findFittingPrefix(entry, text, availableHeight, isLong, isContinuation) {
        const tokens = text.match(/\S+\s*/g);
        if (!tokens || tokens.length < 2) return null;

        let lo = 1;
        let hi = tokens.length - 1;
        let best = 0;

        while (lo <= hi) {
          const mid = (lo + hi) >> 1;
          const candidate = tokens.slice(0, mid).join('').trimEnd();
          const h = measureItem({
            entry,
            options: { message: candidate, showAuthor: false, isLong, isContinued: true, isContinuation }
          });
          if (h <= availableHeight) {
            best = mid;
            lo = mid + 1;
          } else {
            hi = mid - 1;
          }
        }

        if (best <= 0) return null;
        return {
          head: tokens.slice(0, best).join('').trimEnd(),
          tail: tokens.slice(best).join('').trimStart()
        };
      }

      const pages = [];
      let currentPage = [];
      let currentHeight = 0;

      function flushPage() {
        if (currentPage.length > 0) {
          pages.push(currentPage);
          currentPage = [];
          currentHeight = 0;
        }
      }

      function addItemToCurrentPage(item, height) {
        const gap = currentPage.length > 0 ? ENTRY_GAP : 0;
        currentPage.push(item);
        currentHeight += gap + height;
      }

      entries.forEach((entry) => {
        const fullMessage = String(entry.message || '').trim();
        const isLong = fullMessage.length > 260;
        let remainingText = fullMessage;
        let isContinuation = false;

        while (remainingText.length > 0) {
          const gap = currentPage.length > 0 ? ENTRY_GAP : 0;
          const available = maxBoxHeight - currentHeight - gap;
          const wholeItem = {
            entry,
            options: { message: remainingText, showAuthor: true, isLong, isContinued: false, isContinuation }
          };
          const wholeH = measureItem(wholeItem);

          if (wholeH <= available) {
            addItemToCurrentPage(wholeItem, wholeH);
            break;
          }

          // Si la firma cabe entera en la siguiente hoja y NO es muy larga, pásala completa a la siguiente hoja
          if (currentPage.length > 0 && wholeH <= maxBoxHeight && available < 130) {
            flushPage();
            continue;
          }

          // Intentar continuar en la siguiente hoja dividiendo limpiamente por palabras
          const split = available >= 70
            ? findFittingPrefix(entry, remainingText, available, isLong, isContinuation)
            : null;

          if (split && split.head.length > 0 && split.tail.length > 0) {
            const headItem = {
              entry,
              options: { message: split.head, showAuthor: false, isLong, isContinued: true, isContinuation }
            };
            addItemToCurrentPage(headItem, measureItem(headItem));
            flushPage();
            remainingText = split.tail;
            isContinuation = true;
            continue;
          }

          if (currentPage.length > 0) {
            flushPage();
            continue;
          }

          // Caso límite: una sola palabra/bloque mayor a la hoja, se coloca para no perder texto
          addItemToCurrentPage(wholeItem, wholeH);
          flushPage();
          break;
        }
      });

      flushPage();
      stage.remove();

      const totalPages = pages.length;
      const fragment = document.createDocumentFragment();

      pages.forEach((pageItems, idx) => {
        const pageNum = idx + 1;
        const section = document.createElement('section');
        section.className = 'pdf-sheet pdf-sheet-page';
        section.setAttribute('aria-label', 'Hoja ' + pageNum + ' de ' + totalPages);

        const paper = document.createElement('div');
        paper.className = 'pdf-paper-page';

        const head = document.createElement('div');
        head.className = 'pdf-paper-running-head';
        head.innerHTML = '<span>Libro de Honor &#183; M &amp; R</span><span>Hoja ' + pageNum + ' de ' + totalPages + '</span>';

        const entriesWrap = document.createElement('div');
        entriesWrap.className = 'pdf-paper-entries';
        pageItems.forEach((item) => entriesWrap.appendChild(buildEntryElement(item.entry, item.options)));

        const foot = document.createElement('div');
        foot.className = 'pdf-paper-footer';
        foot.innerHTML = '<span>Michelle &amp; Ren&#233; &#183; 19 &#183; XII &#183; 2026</span><span>' + pageNum + ' / ' + totalPages + '</span>';

        paper.appendChild(head);
        paper.appendChild(entriesWrap);
        paper.appendChild(foot);
        section.appendChild(paper);
        fragment.appendChild(section);
      });

      interiorHost.replaceChildren(fragment);
      updateSummary(entries.length, totalPages);
    }

    function updateSummary(entryCount, interiorPages) {
      if (!summaryEl) return;
      const totalSheets = 2 + interiorPages;
      summaryEl.textContent =
        entryCount + (entryCount === 1 ? ' firma' : ' firmas') +
        ' \u00B7 ' +
        totalSheets + (totalSheets === 1 ? ' hoja' : ' hojas') +
        ' (incluye portada y contraportada)';
    }

    async function readyForLayout() {
      if (document.fonts && document.fonts.ready) {
        try { await document.fonts.ready; } catch (_) {}
      }
      paginateEntries();
    }

    if (orderSelect) {
      orderSelect.addEventListener('change', () => {
        currentOrder = orderSelect.value === 'desc' ? 'desc' : 'asc';
        try {
          const url = new URL(window.location.href);
          url.searchParams.set('order', currentOrder);
          window.history.replaceState({}, '', url.toString());
        } catch (_) {}
        paginateEntries();
      });
    }

    if (printBtn) {
      printBtn.addEventListener('click', async () => {
        printBtn.disabled = true;
        try {
          await readyForLayout();
          const imgs = Array.from(document.querySelectorAll('img'));
          await Promise.all(imgs.map((img) => img.decode ? img.decode().catch(() => {}) : Promise.resolve()));
          requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
        } finally {
          setTimeout(() => { printBtn.disabled = false; }, 400);
        }
      });
    }

    readyForLayout();
  })();
  </script>
</body>
</html>
