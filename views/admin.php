<!DOCTYPE html>
<html lang="es-MX">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Panel de Administración · Boda Michelle & René</title>
  
  <link rel="stylesheet" href="/assets/css/admin.css?v=22">
  <link rel="icon" type="image/svg+xml" href="/assets/img/m&amp;r.svg">
</head>
<body class="admin-dashboard">
  <a class="admin-skip-link" href="#adminMain">Ir al contenido</a>

  <!-- HEADER DE ADMINISTRACIÓN -->
  <header class="admin-header">
    <div class="admin-brand">
      <img class="admin-brand-monogram" src="/assets/img/v-m&amp;r.svg" alt="" width="64" height="64">
      <div>
        <div class="admin-brand-title">Michelle <span class="admin-brand-amp">&amp;</span> Ren&#233;</div>
        <div class="admin-brand-sub">Panel de Recuerdos · 19.12.2026</div>
      </div>
    </div>

    <button type="button" class="admin-menu-toggle" id="adminMenuToggle" aria-label="Abrir men&#250; de administraci&#243;n" aria-controls="adminUserMenu" aria-expanded="false"><svg class="ui-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button>
    <div class="admin-user-menu" id="adminUserMenu">
      <span class="user-name-tag">
        <svg class="ui-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/></svg> <?= htmlspecialchars($adminUser['full_name'] ?? 'Novios') ?> (<?= htmlspecialchars($adminUser['role'] ?? 'admin') ?>)
      </span>
      <a href="/" class="admin-btn admin-btn-outline" target="_blank" rel="noopener">
        Ver sitio <svg class="ui-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M7 7h10v10"/></svg>
      </a>
      <button id="btnLogout" class="admin-btn admin-btn-outline">
        Cerrar Sesión
      </button>
    </div>
  </header>

  <main class="admin-container" id="adminMain">
    <section class="admin-intro no-print" aria-labelledby="adminTitle">
      <div><span class="admin-eyebrow">El recuerdo de nuestra boda</span><h1 id="adminTitle">Cuidemos cada recuerdo</h1><p>Revisa el &#225;lbum, lee las dedicatorias y prepara el QR para tus invitados.</p></div>
      <button type="button" class="admin-btn admin-btn-outline" id="btnRefreshAdmin">Actualizar panel</button>
    </section>

    <!-- Tarjetas de Métricas -->
    <div class="stats-grid">
      <a class="stat-card stat-link" href="#media" data-admin-section="media">
        <div class="stat-label">Recuerdos Multimedia</div>
        <div class="stat-value" id="statMedia">&mdash;</div>
        <div class="stat-desc">Fotos y videos subidos</div></a>
      <a class="stat-card stat-link" href="#guestbook" data-admin-section="guestbook">
        <div class="stat-label">Libro de Firmas</div>
        <div class="stat-value" id="statGuestbook">&mdash;</div>
        <div class="stat-desc">Dedicatorias recibidas</div></a>
      <a class="stat-card stat-link" href="#qr" data-admin-section="qr">
        <div class="stat-label">Invitados Activos</div>
        <div class="stat-value" id="statGuests">&mdash;</div>
        <div class="stat-desc">Dispositivos registrados</div></a>
      <div class="stat-card storage">
        <div class="stat-label">Almacenamiento Usado</div>
        <div class="stat-value" id="statStorage">&mdash;</div>
        <div class="stat-desc">En Cloudflare R2</div>
      </div>
    </div>

    <!-- Pestañas Principales -->
    <div class="admin-tabs no-print" role="tablist" aria-label="Secciones de administraci&#243;n">
      <button type="button" class="admin-tab active" data-target="media" id="tab-media" role="tab" aria-controls="sectionMedia" aria-selected="true" tabindex="0">Fotos y videos</button>
      <button type="button" class="admin-tab" data-target="guestbook" id="tab-guestbook" role="tab" aria-controls="sectionGuestbook" aria-selected="false" tabindex="-1">Libro de firmas</button>
      <button type="button" class="admin-tab" data-target="qr" id="tab-qr" role="tab" aria-controls="sectionQR" aria-selected="false" tabindex="-1">QR para mesas</button>
    </div>

    <!-- SECCIÓN 1: FOTOS Y VIDEOS (Descarga Directa R2 y Moderación) -->
    <div id="sectionMedia" role="tabpanel" aria-labelledby="tab-media">
      <div class="admin-actions-bar">
        <div class="actions-left">
          <div><h2 class="admin-section-title">El &#225;lbum de todos</h2><p class="admin-section-note">Revisa, descarga o elimina recuerdos compartidos.</p></div>
        </div>

        <div class="actions-right">
          <button id="btnOpenR2Guide" type="button" class="admin-btn admin-btn-gold">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Descargar todo el &#225;lbum
          </button>
        </div>
      </div>

      <div class="admin-filter-bar no-print">
        <label class="admin-search"><span>Buscar en recuerdos cargados</span><input type="search" id="adminMediaSearch" placeholder="Nombre del invitado o archivo" autocomplete="off"></label>
        <label><span>Tipo</span><select id="adminMediaType"><option value="all">Fotos y videos</option><option value="image">Solo fotos</option><option value="video">Solo videos</option></select></label>
        <label><span>Ordenar por</span><select id="adminMediaSort"><option value="recent">M&#225;s recientes</option><option value="popular">M&#225;s queridos</option><option value="oldest">M&#225;s antiguos</option></select></label>
      </div>
      <div class="admin-selection-bar no-print" id="adminSelectionBar" aria-label="Selecci&#243;n m&#250;ltiple de recuerdos">
        <div class="admin-selection-left">
          <label class="admin-select-all-label">
            <input type="checkbox" id="adminSelectVisible" class="admin-checkbox">
            <span>Seleccionar visibles</span>
          </label>
          <span class="admin-selection-count" id="adminSelectionCount" role="status" aria-live="polite">0 seleccionados</span>
          <button type="button" class="admin-btn admin-btn-outline admin-btn-compact" id="btnClearSelection" hidden>Limpiar</button>
        </div>
        <div class="admin-selection-actions" id="adminSelectionActions" hidden>
          <button type="button" class="admin-btn admin-btn-gold admin-btn-compact" id="btnZipSelected">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            ZIP seleccionados
          </button>
          <button type="button" class="admin-btn admin-btn-danger admin-btn-compact" id="btnDeleteSelected">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 6h18M9 6V4h6v2M5 6l1 14h12l1-14M10 10v6m4-6v6"/></svg>
            Eliminar seleccionados
          </button>
        </div>
      </div>
      <p class="admin-results" id="adminMediaResults" role="status" aria-live="polite"></p>
      <div class="media-manager-grid" id="adminMediaGrid" aria-busy="true">
        <!-- Renderizado dinámico vía admin.js -->
      </div>
      <div class="admin-load-more no-print"><button type="button" class="admin-btn admin-btn-outline" id="btnAdminLoadMore" hidden>Cargar m&#225;s recuerdos</button></div>
    </div>

    <!-- SECCIÓN 2: LIBRO DE FIRMAS (Lectura y Moderación) -->
    <div id="sectionGuestbook" role="tabpanel" aria-labelledby="tab-guestbook" style="display:none;">
      <div class="admin-section-heading">
        <div>
          <h2 class="admin-section-title">Palabras para guardar</h2>
          <p class="admin-section-note">Lee cada mensaje completo antes de moderarlo o genera el libro en PDF para conservarlo.</p>
        </div>
        <div class="admin-guestbook-toolbar">
          <label class="admin-search"><span>Buscar dedicatorias</span><input type="search" id="adminGuestbookSearch" placeholder="Invitado o mensaje"></label>
          <a href="/novios/firmas-pdf" target="_blank" rel="noopener" id="btnExportGuestbookPdf" class="admin-btn admin-btn-gold">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><polyline points="9 15 12 18 15 15"></polyline></svg>
            Generar PDF
          </a>
        </div>
      </div>
      <p class="admin-results" id="adminGuestbookResults" role="status" aria-live="polite"></p>
      <div class="admin-table-shell">
        <table class="guestbook-table">
          <thead>
            <tr>
              <th>Invitado</th>
              <th>Mensaje (Haz clic para ver completo)</th>
              <th>Fecha</th>
              <th style="text-align:right;">Acciones</th>
            </tr>
          </thead>
          <tbody id="adminGuestbookBody">
            <!-- Renderizado dinámico vía admin.js -->
          </tbody>
        </table>
      </div>
    </div>

    <!-- SECCIÓN 3: CÓDIGO QR PARA MESAS (Diseño Súper Elegante para Imprimir) -->
    <div id="sectionQR" role="tabpanel" aria-labelledby="tab-qr" style="display:none;">
      <div class="admin-actions-bar no-print">
        <div class="actions-left">
          <label for="qrUrlInput">Enlace que abrir&#225; el QR</label>
          <input type="url" id="qrUrlInput" class="admin-url-input" inputmode="url" aria-describedby="qrUrlHelp" required><span id="qrUrlHelp" class="admin-section-note" role="status">Revisa el enlace antes de imprimir.</span>
        </div>
        <div class="actions-right">
          <button id="btnPrintCard" type="button" class="admin-btn admin-btn-gold" disabled>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Imprimir Tarjeta de Mesa
          </button>
        </div>
      </div>

      <!-- Tarjeta Imprimible de Mesa -->
      <div class="qr-printable-card">
        <img class="qr-card-monogram" src="/assets/img/v-m&amp;r.svg" width="80" height="80" alt="Michelle y Ren&#233;">
        <h2 class="qr-card-names">Michelle <span class="admin-brand-amp">&amp;</span> Ren&#233;</h2>
        <div class="qr-card-date">19 de Diciembre de 2026</div>

        <div class="qr-frame">
          <img id="qrImg" class="qr-image" src="" alt="Código QR para mesas" />
        </div>

        <div class="qr-card-instructions">
          ¡Ayúdanos a capturar cada instante!
        </div>
        <p class="qr-card-sub">
          Escanea este código con la cámara de tu celular para subir tus fotos y videos al álbum en vivo de nuestra boda.
        </p>
      </div>
    </div>

  </main>

  <div id="qrPrintSheets" aria-hidden="true"></div>
  <div class="admin-modal-backdrop" id="adminPrintModal" role="dialog" aria-modal="true" aria-labelledby="printModalTitle">
    <div class="admin-modal-content">
      <h3 class="admin-section-title" id="printModalTitle">Preparar tarjetas QR</h3>
      <p class="admin-section-note">Dos tarjetas con el dise&#241;o original por hoja Carta horizontal. Cada tarjeta ocupa media hoja.</p>
      <form id="adminPrintForm">
        <label class="admin-print-label" for="qrPrintCopies">&#191;Cu&#225;ntas tarjetas necesitas?</label>
        <input id="qrPrintCopies" type="number" min="1" max="200" step="1" value="2" required inputmode="numeric" aria-describedby="qrPrintSummary">
        <p class="admin-results" id="qrPrintSummary" role="status" aria-live="polite"></p>
        <p class="admin-section-note">Para PDF, elige &#171;Guardar como PDF&#187;. Deja <strong>1 p&#225;gina por hoja</strong>: las dos tarjetas ya vienen acomodadas. Si el navegador muestra encabezados o pies, desact&#237;valos en M&#225;s ajustes.</p>
        <div class="admin-confirm-actions"><button type="button" class="admin-btn admin-btn-outline" id="btnCancelPrint">Cancelar</button><button type="submit" class="admin-btn admin-btn-gold">Continuar a imprimir / PDF</button></div>
      </form>
    </div>
  </div>
  <!-- MODALES EMERGENTES ELEGANTES -->

  <!-- Modal para ver mensaje completo del libro de firmas -->
  <div class="admin-modal-backdrop" id="adminMsgModal" role="dialog" aria-modal="true" aria-labelledby="msgModalAuthor">
    <div class="admin-modal-content">
      <button class="admin-modal-close" id="msgModalClose" type="button" aria-label="Cerrar dedicatoria"><svg class="ui-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 6 12 12M18 6 6 18"/></svg></button>
      <div style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.18em; color:var(--gold-primary); margin-bottom:8px;">
        Dedicatoria para los novios
      </div>
      <h3 id="msgModalAuthor" style="font-family:var(--font-serif); font-size:2rem; color:var(--gold-light); margin-bottom:4px; padding-left: 12px;"></h3>
      
      <div id="msgModalBody" style="font-size:1.05rem; line-height:1.7; color:var(--text-dim); background:var(--admin-surface-light); padding:22px; border-radius:14px; border:1px solid rgba(201,160,80,0.2); max-height:400px; overflow-y:auto;"></div>
    </div>
  </div>

  <!-- Modal de Confirmación Elegante -->
  <div class="admin-modal-backdrop" id="adminConfirmModal" role="alertdialog" aria-modal="true" aria-labelledby="confirmModalTitle" aria-describedby="confirmModalText">
    <div class="admin-modal-content admin-confirm-dialog">
      <div class="admin-confirm-ornament" aria-hidden="true">
        <span></span>
        <i><svg class="ui-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/></svg></i>
        <span></span>
      </div>
      <div class="admin-confirm-icon" aria-hidden="true">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
      </div>
      <h3 id="confirmModalTitle" class="admin-confirm-title">¿Confirmar Acción?</h3>
      <p id="confirmModalText" class="admin-confirm-text"></p>
      
      <div class="admin-confirm-actions">
        <button id="btnConfirmCancel" type="button" class="admin-btn admin-btn-outline">
          Cancelar
        </button>
        <button id="btnConfirmOk" type="button" class="admin-btn admin-btn-danger">
          Sí, eliminar
        </button>
      </div>
    </div>
  </div>

  <?php require __DIR__ . '/partials/admin_zip_modal.php'; ?>

  <!-- Modal de Progreso de Eliminación -->
  <div class="admin-modal-backdrop" id="adminDeleteProgressModal" role="dialog" aria-modal="true" aria-labelledby="deleteProgressTitle" aria-describedby="deleteProgressDescription">
    <div class="admin-modal-content admin-zip-dialog">
      <span class="admin-eyebrow">Eliminando recuerdos</span>
      <h3 id="deleteProgressTitle" class="admin-section-title">Eliminando elementos</h3>
      <p id="deleteProgressDescription" class="admin-section-note">Estamos eliminando los archivos seleccionados del &#225;lbum y del almacenamiento. Mant&#233;n esta p&#225;gina abierta.</p>
      <div id="deleteProgressWrap" class="admin-zip-progress-wrap" aria-busy="true">
        <div class="admin-zip-progress-heading">
          <span id="deleteProgressStage">Iniciando eliminaci&#243;n…</span>
          <strong id="deleteProgressPercent">0%</strong>
        </div>
        <div id="deleteProgressBar" class="admin-progress-track" role="progressbar" aria-label="Progreso de eliminaci&#243;n de recuerdos" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
          <div id="deleteProgressFill" class="admin-progress-fill"></div>
        </div>
        <p id="deleteProgressStatus" class="admin-section-note" role="status" aria-live="polite">Procesando solicitud…</p>
      </div>
    </div>
  </div>

  <!-- Contenedor de Notificaciones Toast del Panel -->
  <div class="admin-toast-container" id="adminToastContainer" aria-live="polite" aria-atomic="false"></div>

  <?php require __DIR__ . '/partials/admin_lightbox.php'; ?>
  <script src="/assets/js/admin.js?v=18"></script>
  <script src="/assets/js/admin-zip.js?v=6"></script>
</body>
</html>
