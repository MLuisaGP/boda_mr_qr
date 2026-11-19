<?php
/**
 * Unified App Navigation Bar (Desktop + Mobile Hamburger with Highlighted Camera)
 * Expects $activePage ('home' | 'camera' | 'gallery' | 'guestbook') and optional $navTransparent (bool)
 */
$activePage = $activePage ?? 'home';
$navTransparent = !empty($navTransparent);
?>
  <!-- BARRA DE NAVEGACIÓN APP (ESCRITORIO + MÓVIL CON HAMBURGUESA Y CÁMARA DESTACADA) -->
  <header class="site-nav<?= $navTransparent ? ' nav-over-hero' : '' ?>" id="siteNav">
    <a href="/" class="nav-brand app-nav-link" aria-label="Ir al inicio">
      <div class="brand-monogram">M&amp;R</div>
      <div class="brand-text">Michelle &amp; René</div>
    </a>

    <!-- Enlaces de Escritorio -->
    <ul class="nav-links">
      <li><a href="/" class="nav-link app-nav-link<?= $activePage === 'home' ? ' active' : '' ?>">Inicio</a></li>
      <li><a href="/galeria" class="nav-link app-nav-link<?= $activePage === 'gallery' ? ' active' : '' ?>">Galería</a></li>
      <li><a href="/firmas" class="nav-link app-nav-link<?= $activePage === 'guestbook' ? ' active' : '' ?>">Libro de Firmas</a></li>
      <li>
        <a href="/camara" class="nav-camera-cta app-nav-link<?= $activePage === 'camera' ? ' active' : '' ?>" title="Comparte tus momentos con la cámara">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
          <span>Cámara</span>
        </a>
      </li>
      <li>
        <div id="guestDisplayBadge" class="user-badge" style="display:none;" onclick="if(window.promptGuestName) window.promptGuestName(true);" title="Mi perfil de invitado">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span id="guestDisplayName">Invitado</span>
        </div>
      </li>
    </ul>

    <!-- Controles Móviles: Cámara Destacada + Botón Hamburguesa -->
    <div class="nav-mobile-actions">
      <a href="/camara" class="nav-camera-mobile-btn app-nav-link<?= $activePage === 'camera' ? ' active' : '' ?>" aria-label="Abrir Cámara y compartir momentos">
        <span class="nav-cam-pulse" aria-hidden="true"></span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
        <span>Cámara</span>
      </a>

      <button type="button" class="nav-hamburger-btn" id="navHamburgerBtn" aria-label="Abrir menú de navegación" aria-expanded="false" aria-controls="mobileDrawer">
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>
    </div>
  </header>

  <!-- MENÚ DESPLEGABLE TIPO APP (DRAWER HAMBURGUESA) -->
  <div class="mobile-drawer-backdrop" id="mobileDrawerBackdrop" aria-hidden="true"></div>
  <aside class="mobile-drawer" id="mobileDrawer" aria-label="Menú principal" aria-hidden="true">
    <div class="mobile-drawer-head">
      <div class="drawer-brand">
        <div class="brand-monogram">M&amp;R</div>
        <div>
          <div class="drawer-title">Michelle &amp; René</div>
          <div class="drawer-sub">19 de Diciembre 2026</div>
        </div>
      </div>
      <button type="button" class="drawer-close-btn" id="mobileDrawerClose" aria-label="Cerrar menú">&times;</button>
    </div>

    <!-- Tarjeta Destacada de Cámara en el Menú -->
    <a href="/camara" class="drawer-camera-spotlight app-nav-link<?= $activePage === 'camera' ? ' active' : '' ?>">
      <div class="drawer-cam-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
      </div>
      <div class="drawer-cam-text">
        <strong>Cámara · Comparte tus Momentos</strong>
        <span>Tomar fotos, grabar video o subir galería</span>
      </div>
      <svg class="drawer-cam-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="9 18 15 12 9 6"></polyline></svg>
    </a>

    <nav class="drawer-nav-list">
      <a href="/" class="drawer-nav-item app-nav-link<?= $activePage === 'home' ? ' active' : '' ?>">
        <span class="drawer-item-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
        </span>
        <span>Inicio</span>
      </a>

      <a href="/galeria" class="drawer-nav-item app-nav-link<?= $activePage === 'gallery' ? ' active' : '' ?>">
        <span class="drawer-item-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
        </span>
        <span>Galería de Fotos</span>
      </a>

      <a href="/firmas" class="drawer-nav-item app-nav-link<?= $activePage === 'guestbook' ? ' active' : '' ?>">
        <span class="drawer-item-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
        </span>
        <span>Libro de Firmas</span>
      </a>

      <button type="button" class="drawer-nav-item drawer-profile-btn" id="drawerProfileBtn">
        <span class="drawer-item-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        </span>
        <span id="drawerGuestLabel">Mi Perfil de Invitado</span>
      </button>

      <button type="button" class="drawer-nav-item drawer-install-btn" id="pwaInstallBtn" style="display:none;">
        <span class="drawer-item-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        </span>
        <span>Instalar App en tu Teléfono</span>
      </button>
    </nav>

    <div class="drawer-footer">
      <a href="/admin" class="drawer-admin-link">Acceso Exclusivo Novios →</a>
    </div>
  </aside>
