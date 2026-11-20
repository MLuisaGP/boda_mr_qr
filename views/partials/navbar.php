<?php
/**
 * Unified App Navigation Bar (Desktop + Mobile Hamburger)
 * Expects $activePage ('home' | 'camera' | 'gallery' | 'guestbook'),
 * optional $navTransparent (bool) and optional $homeFloatingMenu (bool: solo botón hamburguesa flotante sin barra superior)
 */
$activePage = $activePage ?? 'home';
$navTransparent = !empty($navTransparent);
$homeFloatingMenu = !empty($homeFloatingMenu);
?>
<?php if ($homeFloatingMenu): ?>
  <!-- BOTÓN HAMBURGUESA FLOTANTE EN HOME (SIN BARRA SUPERIOR) -->
  <button type="button" class="nav-hamburger-btn home-floating-hamburger" id="navHamburgerBtn" aria-label="Abrir menú de navegación" aria-expanded="false" aria-controls="mobileDrawer">
    <span class="hamburger-line"></span>
    <span class="hamburger-line"></span>
    <span class="hamburger-line"></span>
  </button>
<?php else: ?>
  <!-- BARRA DE NAVEGACIÓN APP (ESCRITORIO + MÓVIL CON HAMBURGUESA) -->
  <header class="site-nav<?= $navTransparent ? ' nav-over-hero' : '' ?>" id="siteNav">
    <a href="/" class="nav-brand app-nav-link" aria-label="Ir al inicio — Michelle y René">
      <span class="brand-emblem" aria-hidden="true"><img class="brand-monogram" src="/assets/img/v-m&amp;r.svg" alt="">
      </span>
      <span class="brand-divider" aria-hidden="true"></span>
      <span class="brand-wordmark">
        <span class="brand-text">Michelle <span class="brand-amp">&amp;</span> René</span>
        <span class="brand-date">19 · XII · 2026</span>
      </span>
    </a>

    <!-- Enlaces de Escritorio -->
    <ul class="nav-links">
      <li><a href="/" class="nav-link app-nav-link<?= $activePage === 'home' ? ' active' : '' ?>">Inicio</a></li>
      <li><a href="/galeria" class="nav-link app-nav-link<?= $activePage === 'gallery' ? ' active' : '' ?>">Galería</a></li>
      <?php if ($activePage !== 'guestbook'): ?>
      <li><a href="/firmas" class="nav-link app-nav-link<?= $activePage === 'guestbook' ? ' active' : '' ?>">Libro de Firmas</a></li>
      <?php endif; ?>
      <li>
        <div id="guestDisplayBadge" class="user-badge" style="display:none;" onclick="if(window.promptGuestName) window.promptGuestName(true);" title="Mi perfil de invitado">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span id="guestDisplayName">Invitado</span>
        </div>
      </li>
    </ul>

    <!-- Controles Móviles: Botón Hamburguesa -->
    <div class="nav-mobile-actions">
      <button type="button" class="nav-hamburger-btn" id="navHamburgerBtn" aria-label="Abrir menú de navegación" aria-expanded="false" aria-controls="mobileDrawer">
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>
    </div>
  </header>
<?php endif; ?>

  <!-- MENÚ DESPLEGABLE TIPO APP (DRAWER HAMBURGUESA) -->
  <div class="mobile-drawer-backdrop" id="mobileDrawerBackdrop" aria-hidden="true"></div>
  <aside class="mobile-drawer" id="mobileDrawer" aria-label="Menú principal" aria-hidden="true">
    <div class="mobile-drawer-head">
      <a href="/" class="drawer-brand app-nav-link" aria-label="Ir al inicio — Michelle y René">
        <span class="brand-wordmark">
          <span class="brand-text">Michelle <span class="brand-amp">&amp;</span> Ren&#233;</span>
          <span class="brand-date">19 &#183; XII &#183; 2026</span>
        </span>
      </a>
      <button type="button" class="drawer-close-btn" id="mobileDrawerClose" aria-label="Cerrar menú"><svg class="ui-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 6 12 12M18 6 6 18"/></svg></button>
    </div>

    <!-- Tarjeta Destacada de Cámara en el Menú -->
    <?php $navUploadsClosed = !empty($uploadsClosed); ?>
    <a href="/camara" class="drawer-camera-spotlight app-nav-link<?= $activePage === 'camera' ? ' active' : '' ?>">
      <div class="drawer-cam-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
      </div>
      <div class="drawer-cam-text"><strong>Comparte tus momentos</strong></div>
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
    <img class="brand-monogram drawer-monogram-watermark" src="/assets/img/v-m&amp;r.svg" alt="" aria-hidden="true" width="1371" height="1313">
  </aside>
