<!DOCTYPE html>
<html lang="es-MX">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Acceso Novios · Boda Michelle & René</title>
  
  <link rel="stylesheet" href="assets/css/admin.css?v=2">
  <link rel="icon" type="image/jpeg" href="assets/img/couple-portrait.jpg">
</head>
<body>
  <div style="min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px;">
    <div style="width:min(94%, 440px); background:#25131C; border:1px solid rgba(201,160,80,0.3); border-radius:24px; padding:44px 34px; box-shadow:0 20px 50px rgba(0,0,0,0.6); text-align:center;">
      <div style="width:64px; height:64px; border-radius:50%; background:var(--gold-gradient); margin:0 auto 18px; display:grid; place-items:center; font-family:var(--font-serif); font-size:1.7rem; font-weight:700; color:#2A1406; box-shadow:0 0 25px rgba(201,160,80,0.4);">
        M&R
      </div>
      <h1 style="font-family:var(--font-serif); font-size:2.2rem; color:var(--gold-light); margin-bottom:6px;">
        Panel de Novios
      </h1>
      <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:30px; letter-spacing:0.04em;">
        Boda Michelle & René · 19 de Diciembre 2026
      </p>

      <div id="loginError" class="admin-alert admin-alert-error" role="alert" aria-live="assertive">
        <span class="admin-alert-icon" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </span>
        <span class="admin-alert-body" id="loginErrorText"></span>
      </div>

      <form id="adminLoginForm">
        <div style="text-align:left; margin-bottom:18px;">
          <label style="display:block; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.12em; color:var(--gold-light); margin-bottom:6px;">Usuario</label>
          <input type="text" id="adminUsername" required style="width:100%; padding:13px 16px; border-radius:12px; border:1px solid rgba(201,160,80,0.3); background:#180B12; color:#FFF; font-family:inherit; outline:none;" placeholder="ReneG, MichelleB o LuisaGa" autofocus />
        </div>
        <div style="text-align:left; margin-bottom:26px;">
          <label style="display:block; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.12em; color:var(--gold-light); margin-bottom:6px;">Contraseña</label>
          <input type="password" id="adminPassword" required style="width:100%; padding:13px 16px; border-radius:12px; border:1px solid rgba(201,160,80,0.3); background:#180B12; color:#FFF; font-family:inherit; outline:none;" placeholder="••••••••••••" />
        </div>
        <button type="submit" class="admin-btn admin-btn-gold" style="width:100%; padding:14px; font-size:0.95rem; justify-content:center;">
          Ingresar al Panel →
        </button>
      </form>

      <div style="margin-top:24px;">
        <a href="/" style="color:var(--text-muted); text-decoration:none; font-size:0.8rem;">
          ← Volver a la página principal
        </a>
      </div>
    </div>
  </div>

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
    }

    document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
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
        if (data.success) {
          window.location.reload();
        } else {
          showLoginError(data.error || 'Credenciales inválidas. Verifica tu usuario y contraseña.');
        }
      } catch (err) {
        showLoginError('Error de conexión con el servidor. Intenta nuevamente.');
      }
    });
  </script>
</body>
</html>
