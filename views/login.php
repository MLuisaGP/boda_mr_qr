<!DOCTYPE html>
<html lang="es-MX">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#FAF7F2">
  <title>Acceso al panel ? Michelle &amp; Ren&#233;</title>
  <link rel="stylesheet" href="/assets/css/admin.css?v=7">
  <link rel="icon" type="image/svg+xml" href="/assets/img/m&amp;r.svg">
</head>
<body class="admin-dashboard admin-login-page">
  <main class="admin-login-main">
    <section class="admin-login-card" aria-labelledby="loginTitle">
      <img class="login-monogram" src="/assets/img/v-m&amp;r.svg" alt="" width="96" height="96">
      <div class="admin-brand-title">Michelle <span class="admin-brand-amp">&amp;</span> Ren&#233;</div>
      <p class="login-date">19 · XII · 2026</p>
      <div class="login-divider" aria-hidden="true"></div>
      <span class="admin-eyebrow">Nuestro espacio de recuerdos</span>
      <h1 id="loginTitle">Bienvenidos al panel</h1>
      <p class="login-intro">Ingresa para cuidar el &#225;lbum, leer las dedicatorias y preparar el QR de la celebraci&#243;n.</p>
      <div id="loginError" class="admin-alert admin-alert-error" role="alert" aria-live="assertive" tabindex="-1">
        <span class="admin-alert-icon" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v6m0 3v1"/></svg></span>
        <span class="admin-alert-body" id="loginErrorText"></span>
      </div>
      <form id="adminLoginForm">
        <div class="login-field">
          <label for="adminUsername">Usuario</label>
          <input type="text" id="adminUsername" name="username" autocomplete="username" required placeholder="Tu usuario" autocapitalize="none" spellcheck="false">
        </div>
        <div class="login-field">
          <label for="adminPassword">Contrase&#241;a</label>
          <div class="login-password-wrap">
            <input type="password" id="adminPassword" name="password" autocomplete="current-password" required placeholder="Tu contrase&#241;a">
            <button type="button" class="login-password-toggle" id="toggleLoginPassword" aria-label="Mostrar contrase&#241;a" aria-pressed="false"><svg class="ui-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg></button>
          </div>
        </div>
        <button type="submit" class="admin-btn admin-btn-gold login-submit"><span id="loginSubmitLabel">Ingresar al panel</span><svg class="ui-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16m-6-6 6 6-6 6"/></svg></button>
      </form>
      <a class="login-back" href="/"><span aria-hidden="true">&#8592;</span> Volver al sitio de invitados</a>
    </section>
  </main>
  <script>
    function showLoginError(msg) {
      const errBox = document.getElementById('loginError');
      const errText = document.getElementById('loginErrorText');
      if (!errBox || !errText) return;
      errText.textContent = msg;
      errBox.classList.remove('is-shake');
      errBox.classList.add('is-visible');
      void errBox.offsetWidth;
      errBox.classList.add('is-shake');
      errBox.focus();
    }

    document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const button = e.currentTarget.querySelector('[type="submit"]');
      if (button.disabled) return;
      button.disabled = true;
      button.setAttribute('aria-busy', 'true');
      document.getElementById('loginSubmitLabel').textContent = 'Ingresando...';
      const u = document.getElementById('adminUsername').value.trim();
      const p = document.getElementById('adminPassword').value;
      const errBox = document.getElementById('loginError');
      if (errBox) errBox.classList.remove('is-visible', 'is-shake');

      try {
        const res = await fetch('/api/auth/admin-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: u, password: p })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          window.location.reload();
        } else {
          showLoginError(data.error || 'Credenciales inválidas. Verifica tu usuario y contraseña.');
        }
      } catch (err) {
        showLoginError('Error de conexión con el servidor. Intenta nuevamente.');
      } finally {
        button.disabled = false;
        button.removeAttribute('aria-busy');
        document.getElementById('loginSubmitLabel').textContent = 'Ingresar al panel';
      }
    });

    document.getElementById('toggleLoginPassword').addEventListener('click', (event) => {
      const input = document.getElementById('adminPassword');
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      event.currentTarget.setAttribute('aria-pressed', String(show));
      event.currentTarget.setAttribute('aria-label', show ? 'Ocultar contrase\u00f1a' : 'Mostrar contrase\u00f1a');
    });
  </script>
</body>
</html>
