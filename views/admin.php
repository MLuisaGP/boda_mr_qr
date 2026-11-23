<!DOCTYPE html>
<html lang="es-MX">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Panel de Administración · Boda Michelle & René</title>
  
  <link rel="stylesheet" href="/assets/css/admin.css?v=13">
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
        Ver sitio ↗
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
      <p class="admin-results" id="adminMediaResults" role="status" aria-live="polite"></p>
      <div class="media-manager-grid" id="adminMediaGrid" aria-busy="true">
        <!-- Renderizado dinámico vía admin.js -->
      </div>
      <div class="admin-load-more no-print"><button type="button" class="admin-btn admin-btn-outline" id="btnAdminLoadMore" hidden>Cargar m&#225;s recuerdos</button></div>
    </div>

    <!-- SECCIÓN 2: LIBRO DE FIRMAS (Lectura y Moderación) -->
    <div id="sectionGuestbook" role="tabpanel" aria-labelledby="tab-guestbook" style="display:none;">
      <div class="admin-section-heading"><div><h2 class="admin-section-title">Palabras para guardar</h2><p class="admin-section-note">Lee cada mensaje completo antes de moderarlo.</p></div><label class="admin-search"><span>Buscar dedicatorias</span><input type="search" id="adminGuestbookSearch" placeholder="Invitado o mensaje"></label></div>
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
        Dedicatoria para los Novios
      </div>
      <h3 id="msgModalAuthor" style="font-family:var(--font-serif); font-size:2rem; color:var(--gold-light); margin-bottom:4px;"></h3>
      <div id="msgModalDate" style="font-size:0.8rem; color:var(--text-muted); margin-bottom:20px;"></div>
      
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

  <!-- Modal de Descarga Masiva Directa desde Cloudflare R2 (Cyberduck / rclone) -->
  <?php
    $r2Host = htmlspecialchars((string) ($r2Info['host'] ?? '<ACCOUNT_ID>.r2.cloudflarestorage.com'), ENT_QUOTES, 'UTF-8');
    $r2Bucket = htmlspecialchars((string) ($r2Info['bucket'] ?? '<TU_BUCKET>'), ENT_QUOTES, 'UTF-8');
    $r2Endpoint = htmlspecialchars((string) ($r2Info['endpoint'] ?? 'https://<ACCOUNT_ID>.r2.cloudflarestorage.com'), ENT_QUOTES, 'UTF-8');
    $rcloneCmd = 'rclone copy r2:' . ($r2Info['bucket'] ?: '<TU_BUCKET>') . '/media ./Boda_Michelle_y_Rene --progress --transfers 8';
  ?>
  <div class="admin-modal-backdrop" id="adminR2GuideModal" role="dialog" aria-modal="true" aria-labelledby="r2GuideTitle">
    <div class="admin-modal-content" style="max-width:640px;">
      <button class="admin-modal-close" id="r2GuideModalClose" type="button" aria-label="Cerrar"><svg class="ui-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 6 12 12M18 6 6 18"/></svg></button>
      <div style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.18em; color:var(--gold-primary); margin-bottom:8px;">
        Descarga Directa sin Límites · Egress $0
      </div>
      <h3 id="r2GuideTitle" style="font-family:var(--font-serif); font-size:1.85rem; color:var(--gold-light); margin-bottom:10px;">
        Descargar Todo el Álbum desde Cloudflare R2
      </h3>
      <p style="font-size:0.9rem; color:var(--text-dim); line-height:1.6; margin-bottom:18px;">
        Para descargar todas las fotos (1920px) y videos en alta calidad a máxima velocidad sin sobrecargar el hosting compartido, conéctate directamente a la carpeta <code style="color:var(--gold-light);">media/</code> de tu bucket con <strong>Cyberduck</strong> o <strong>rclone</strong>. Las miniaturas viven aparte en <code style="color:var(--gold-light);">thumbs/</code> para no duplicar archivos.
      </p>

      <div style="background:var(--admin-surface-light); border:1px solid rgba(201,160,80,0.22); border-radius:12px; padding:16px; margin-bottom:14px;">
        <div style="font-size:0.8rem; font-weight:700; color:var(--gold-light); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:10px;">
          Opción 1 · Cyberduck (Interfaz gráfica Windows / Mac)
        </div>
        <ul style="margin:0; padding-left:18px; font-size:0.85rem; color:var(--text-dim); line-height:1.7;">
          <li>Protocolo: <strong>Amazon S3 (Cloudflare R2)</strong></li>
          <li>Servidor: <code id="r2HostCode" style="color:var(--text-white);"><?= $r2Host ?></code></li>
          <li>Ruta / Carpeta: <code style="color:var(--text-white);">/<?= $r2Bucket ?>/media</code></li>
          <li>Claves: usa tu <code>R2_ACCESS_KEY_ID</code> y <code>R2_SECRET_ACCESS_KEY</code> del archivo <code>.env</code>.</li>
        </ul>
      </div>

      <div style="background:var(--admin-surface-light); border:1px solid rgba(201,160,80,0.22); border-radius:12px; padding:16px; margin-bottom:18px;">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; margin-bottom:8px;">
          <div style="font-size:0.8rem; font-weight:700; color:var(--gold-light); text-transform:uppercase; letter-spacing:0.1em;">
            Opción 2 · rclone (Línea de comandos ultrarrápida)
          </div>
          <button type="button" id="btnCopyRcloneCmd" class="admin-btn admin-btn-outline" style="padding:5px 10px; font-size:0.75rem;">
            Copiar comando
          </button>
        </div>
        <pre id="r2RcloneCmd" style="margin:0; padding:12px; background:var(--admin-surface-light); border-radius:8px; color:var(--text-white); font-size:0.8rem; overflow-x:auto; white-space:pre-wrap; word-break:break-all;"><?= htmlspecialchars($rcloneCmd, ENT_QUOTES, 'UTF-8') ?></pre>
        <div style="font-size:0.78rem; color:var(--text-muted); margin-top:8px;">
          Endpoint R2 para <code>rclone config</code>: <code><?= $r2Endpoint ?></code> (provider: <code>Cloudflare</code>, region: <code>auto</code>).
        </div>
      </div>

      <div style="text-align:right;">
        <button type="button" id="r2GuideModalOk" class="admin-btn admin-btn-gold">Entendido</button>
      </div>
    </div>
  </div>

  <!-- Contenedor de Notificaciones Toast del Panel -->
  <div class="admin-toast-container" id="adminToastContainer" aria-live="polite" aria-atomic="false"></div>

  <script src="/assets/js/admin.js?v=10"></script>
</body>
</html>
