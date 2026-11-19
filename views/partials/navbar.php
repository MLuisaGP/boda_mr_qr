<?php
/**
 * Unified App Navigation Bar (Desktop + Mobile Hamburger with Highlighted Camera)
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
  <!-- BARRA DE NAVEGACIÓN APP (ESCRITORIO + MÓVIL CON HAMBURGUESA Y CÁMARA DESTACADA) -->
  <header class="site-nav<?= $navTransparent ? ' nav-over-hero' : '' ?>" id="siteNav">
    <a href="/" class="nav-brand app-nav-link" aria-label="Ir al inicio — Michelle y René">
      <span class="brand-emblem" aria-hidden="true">
        <svg viewBox="8 2 32 41" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="mrLogoGoldNav" x1="10" y1="8" x2="38" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#E5C585"/>
              <stop offset="50%" stop-color="#C9A050"/>
              <stop offset="100%" stop-color="#9A732D"/>
            </linearGradient>
          </defs>
          <path class="logo-star" d="M24 3.2 L24.7 5.1 L26.6 5.8 L24.7 6.5 L24 8.4 L23.3 6.5 L21.4 5.8 L23.3 5.1 Z" fill="url(#mrLogoGoldNav)"/>
          <path class="logo-heart-olive" d="M25.8 14.9 C23.8 9.6 16.2 9.2 14.4 14.8 C12.6 20.4 17.4 26.8 25.8 33.2 C34.2 26.8 39.0 20.4 37.2 14.8 C35.4 9.2 27.8 9.6 25.8 14.9 Z" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
          <path class="logo-heart-gold" d="M22.2 16.5 C20.2 11.2 12.6 10.8 10.8 16.4 C9.0 22.0 13.8 28.4 22.2 34.8 C30.6 28.4 35.4 22.0 33.6 16.4 C31.8 10.8 24.2 11.2 22.2 16.5 Z" stroke="url(#mrLogoGoldNav)" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"/>
          <path class="logo-sprig-stem" d="M24 38.2 Q18.2 39.6 12.6 36.6 M24 38.2 Q29.8 39.6 35.4 36.6" stroke="currentColor" stroke-width="1.05" stroke-linecap="round"/>
          <path class="logo-sprig-leaf" d="M20.4 38.8 C19.0 40.9 16.8 41.4 15.5 40.4 C16.8 39.0 18.7 38.5 20.4 38.8 Z M27.6 38.8 C29.0 40.9 31.2 41.4 32.5 40.4 C31.2 39.0 29.3 38.5 27.6 38.8 Z" fill="currentColor"/>
          <path class="logo-sprig-leaf-soft" d="M16.4 38.0 C15.2 36.0 13.4 35.4 12.0 36.2 C13.4 37.6 15.0 38.2 16.4 38.0 Z M31.6 38.0 C32.8 36.0 34.6 35.4 36.0 36.2 C34.6 37.6 33.0 38.2 31.6 38.0 Z" fill="currentColor"/>
          <circle cx="24" cy="38.2" r="1.25" fill="url(#mrLogoGoldNav)"/>
        </svg>
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
<?php endif; ?>

  <!-- MENÚ DESPLEGABLE TIPO APP (DRAWER HAMBURGUESA) -->
  <div class="mobile-drawer-backdrop" id="mobileDrawerBackdrop" aria-hidden="true"></div>
  <aside class="mobile-drawer" id="mobileDrawer" aria-label="Menú principal" aria-hidden="true">
    <div class="mobile-drawer-head">
      <a href="/" class="drawer-brand app-nav-link" aria-label="Ir al inicio — Michelle y René">
        <span class="brand-emblem drawer-brand-emblem" aria-hidden="true">
          <svg viewBox="8 2 32 41" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="mrLogoGoldDrawer" x1="10" y1="8" x2="38" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#E5C585"/>
                <stop offset="50%" stop-color="#C9A050"/>
                <stop offset="100%" stop-color="#9A732D"/>
              </linearGradient>
            </defs>
            <path class="logo-star" d="M24 3.2 L24.7 5.1 L26.6 5.8 L24.7 6.5 L24 8.4 L23.3 6.5 L21.4 5.8 L23.3 5.1 Z" fill="url(#mrLogoGoldDrawer)"/>
            <path class="logo-heart-olive" d="M25.8 14.9 C23.8 9.6 16.2 9.2 14.4 14.8 C12.6 20.4 17.4 26.8 25.8 33.2 C34.2 26.8 39.0 20.4 37.2 14.8 C35.4 9.2 27.8 9.6 25.8 14.9 Z" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
            <path class="logo-heart-gold" d="M22.2 16.5 C20.2 11.2 12.6 10.8 10.8 16.4 C9.0 22.0 13.8 28.4 22.2 34.8 C30.6 28.4 35.4 22.0 33.6 16.4 C31.8 10.8 24.2 11.2 22.2 16.5 Z" stroke="url(#mrLogoGoldDrawer)" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"/>
            <path class="logo-sprig-stem" d="M24 38.2 Q18.2 39.6 12.6 36.6 M24 38.2 Q29.8 39.6 35.4 36.6" stroke="currentColor" stroke-width="1.05" stroke-linecap="round"/>
            <path class="logo-sprig-leaf" d="M20.4 38.8 C19.0 40.9 16.8 41.4 15.5 40.4 C16.8 39.0 18.7 38.5 20.4 38.8 Z M27.6 38.8 C29.0 40.9 31.2 41.4 32.5 40.4 C31.2 39.0 29.3 38.5 27.6 38.8 Z" fill="currentColor"/>
            <path class="logo-sprig-leaf-soft" d="M16.4 38.0 C15.2 36.0 13.4 35.4 12.0 36.2 C13.4 37.6 15.0 38.2 16.4 38.0 Z M31.6 38.0 C32.8 36.0 34.6 35.4 36.0 36.2 C34.6 37.6 33.0 38.2 31.6 38.0 Z" fill="currentColor"/>
            <circle cx="24" cy="38.2" r="1.25" fill="url(#mrLogoGoldDrawer)"/>
          </svg>
        </span>
        <span class="brand-divider drawer-brand-divider" aria-hidden="true"></span>
        <div class="drawer-brand-text">
          <div class="drawer-title">Michelle <span class="brand-amp">&amp;</span> René</div>
          <div class="drawer-sub">19 · XII · 2026</div>
        </div>
      </a>
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
