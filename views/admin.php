<!DOCTYPE html>
<html lang="es-MX">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Panel de Administración · Boda Michelle & René</title>
  
  <link rel="stylesheet" href="assets/css/admin.css?v=2">
  <link rel="icon" type="image/jpeg" href="assets/img/couple-portrait.jpg">
</head>
<body>

  <!-- HEADER DE ADMINISTRACIÓN -->
  <header class="admin-header">
    <div class="admin-brand">
      <div class="admin-logo-circle">M&R</div>
      <div>
        <div class="admin-brand-title">Michelle & René</div>
        <div class="admin-brand-sub">Panel de Recuerdos · 19.12.2026</div>
      </div>
    </div>

    <div class="admin-user-menu">
      <span class="user-name-tag">
        ✦ <?= htmlspecialchars($adminUser['full_name'] ?? 'Novios') ?> (<?= htmlspecialchars($adminUser['role'] ?? 'admin') ?>)
      </span>
      <a href="/" class="admin-btn admin-btn-outline" target="_blank">
        Ver Web en Vivo ↗
      </a>
      <button id="btnLogout" class="admin-btn admin-btn-outline" style="border-color:rgba(255,255,255,0.2);">
        Cerrar Sesión
      </button>
    </div>
  </header>

  <div class="admin-container">

    <!-- Tarjetas de Métricas -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Recuerdos Multimedia</div>
        <div class="stat-value" id="statMedia">0</div>
        <div class="stat-desc">Fotos y videos subidos</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Libro de Firmas</div>
        <div class="stat-value" id="statGuestbook">0</div>
        <div class="stat-desc">Dedicatorias recibidas</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Invitados Activos</div>
        <div class="stat-value" id="statGuests">0</div>
        <div class="stat-desc">Dispositivos registrados</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Almacenamiento Usado</div>
        <div class="stat-value" id="statStorage">0 MB</div>
        <div class="stat-desc">En servidor HostGator</div>
      </div>
    </div>

    <!-- Pestañas Principales -->
    <div class="admin-tabs">
      <button class="admin-tab active" data-target="media">
        📷 Gestión de Fotos y Videos
      </button>
      <button class="admin-tab" data-target="guestbook">
        ✍️ Libro de Firmas
      </button>
      <button class="admin-tab" data-target="qr">
        🏷️ Código QR para Mesas
      </button>
    </div>

    <!-- SECCIÓN 1: FOTOS Y VIDEOS (Descargas ZIP y Moderación) -->
    <div id="sectionMedia">
      <div class="admin-actions-bar">
        <div class="actions-left">
          <button id="btnSelectAll" class="admin-btn admin-btn-outline">
            Seleccionar Todas
          </button>
          <span id="selectedCountText" style="font-size:0.85rem; color:var(--gold-light); font-weight:600;">
            0 seleccionadas
          </span>
          <button id="btnDownloadSelected" class="admin-btn admin-btn-gold" style="opacity:0.5;" disabled>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Descargar Seleccionadas (.ZIP)
          </button>
        </div>

        <div class="actions-right">
          <button id="btnDownloadAll" class="admin-btn admin-btn-gold">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Descargar TODO el Álbum (.ZIP)
          </button>
        </div>
      </div>

      <div class="media-manager-grid" id="adminMediaGrid">
        <!-- Renderizado dinámico vía admin.js -->
      </div>
    </div>

    <!-- SECCIÓN 2: LIBRO DE FIRMAS (Lectura y Moderación) -->
    <div id="sectionGuestbook" style="display:none;">
      <div style="background:var(--admin-surface); border:1px solid var(--admin-card-border); border-radius:var(--radius-md); padding:24px; box-shadow:var(--shadow-card);">
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
    <div id="sectionQR" style="display:none;">
      <div class="admin-actions-bar no-print">
        <div class="actions-left">
          <label style="font-size:0.85rem; color:var(--gold-light);">URL de la boda:</label>
          <input type="text" id="qrUrlInput" style="padding:10px 14px; border-radius:8px; border:1px solid rgba(201,160,80,0.3); background:#1A0D15; color:#FFF; width:340px; font-size:0.85rem;" />
        </div>
        <div class="actions-right">
          <button id="btnPrintCard" class="admin-btn admin-btn-gold">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Imprimir Tarjeta de Mesa
          </button>
        </div>
      </div>

      <!-- Tarjeta Imprimible de Mesa -->
      <div class="qr-printable-card">
        <div class="qr-card-monogram">M & R</div>
        <h2 class="qr-card-names">Michelle & René</h2>
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

  </div>

  <!-- MODALES EMERGENTES ELEGANTES -->

  <!-- Modal para ver mensaje completo del libro de firmas -->
  <div class="admin-modal-backdrop" id="adminMsgModal">
    <div class="admin-modal-content">
      <button class="admin-modal-close" id="msgModalClose">&times;</button>
      <div style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.18em; color:var(--gold-primary); margin-bottom:8px;">
        Dedicatoria para los Novios
      </div>
      <h3 id="msgModalAuthor" style="font-family:var(--font-serif); font-size:2rem; color:var(--gold-light); margin-bottom:4px;"></h3>
      <div id="msgModalDate" style="font-size:0.8rem; color:var(--text-muted); margin-bottom:20px;"></div>
      
      <div id="msgModalBody" style="font-size:1.05rem; line-height:1.7; color:var(--text-dim); background:#1C0D15; padding:22px; border-radius:14px; border:1px solid rgba(201,160,80,0.2); max-height:400px; overflow-y:auto;"></div>
    </div>
  </div>

  <!-- Modal de Confirmación Elegante -->
  <div class="admin-modal-backdrop" id="adminConfirmModal" role="alertdialog" aria-modal="true" aria-labelledby="confirmModalTitle" aria-describedby="confirmModalText">
    <div class="admin-modal-content admin-confirm-dialog">
      <div class="admin-confirm-ornament" aria-hidden="true">
        <span></span>
        <i>✦</i>
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

  <!-- Contenedor de Notificaciones Toast del Panel -->
  <div class="admin-toast-container" id="adminToastContainer" aria-live="polite" aria-atomic="false"></div>

  <script src="assets/js/admin.js?v=2"></script>
</body>
</html>
