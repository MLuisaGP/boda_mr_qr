<?php
$pageTitle = 'Libro de Firmas · Boda Michelle & René';
$pageDesc = 'Firma el libro de honor digital de la boda de Michelle y René y lee los buenos deseos de los invitados.';
$themeColor = '#FAF7F2';
$activePage = 'guestbook';
$navTransparent = false;
?>
<!DOCTYPE html>
<html lang="es-MX">
<head>
<?php require __DIR__ . '/partials/pwa_head.php'; ?>
</head>
<body class="page-guestbook app-page-enter">

<?php require __DIR__ . '/partials/navbar.php'; ?>

  <main class="book-page-main">
    <section class="wedding-book-stage">
      <!-- LIBRO DE FIRMAS NUPCIAL (DISEÑO DE LIBRO DE HONOR CON MÍNIMO SCROLL) -->
      <div class="wedding-book-cover">
        <div class="wedding-book-spine" aria-hidden="true"></div>
        <div class="wedding-book-ribbon" aria-hidden="true"></div>

        <div class="wedding-book-sheet">
          <!-- Encabezado Compacto del Libro -->
          <header class="book-sheet-header">
            <div class="book-ornament" aria-hidden="true">
              <span></span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              <span></span>
            </div>
            <p class="book-eyebrow">Libro de Honor</p>
            <h1 class="book-main-title">Michelle <span>&amp;</span> René</h1>

            <!-- Selector de Vista: Escribir Firma / Ver Firmas de los Demás -->
            <div class="book-mode-bar">
              <button type="button" class="book-mode-btn is-active" id="btnBookWriteTab">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                <span>Escribir Firma</span>
              </button>
              <button type="button" class="book-mode-btn" id="btnBookReadTab">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                <span>Ver Firmas</span>
                <span class="book-count-pill" id="gbBookCountPill">0</span>
              </button>
            </div>
          </header>

          <!-- PÁGINA 1 DEL LIBRO: FORMULARIO PARA FIRMAR -->
          <div class="book-view book-view-write is-active" id="bookWriteView">
            <p class="book-prompt-note">
              Déjanos tus buenos deseos y bendiciones para recordar este día para siempre.
            </p>

            <!-- Chips de inspiración en una sola fila deslizable (sin empujar la página) -->
            <div class="book-chips-strip" aria-label="Frases de inspiración rápida">
              <button type="button" class="gb-chip-btn" data-msg="¡Muchas felicidades a los novios! Que este amor sea eterno y lleno de bendiciones.">
                🥂 ¡Felicidades esposos!
              </button>
              <button type="button" class="gb-chip-btn" data-msg="Que Dios bendiga su matrimonio con infinita paz, respeto y felicidad todos los días.">
                💍 Amor eterno
              </button>
              <button type="button" class="gb-chip-btn" data-msg="¡Gracias por hacernos parte de su historia tan hermosa! Los queremos muchísimo.">
                ✨ Gracias por invitarnos
              </button>
              <button type="button" class="gb-chip-btn" data-msg="¡A bailar y celebrar con todo el corazón este gran día! Que vivan los novios.">
                🎉 ¡Que vivan los novios!
              </button>
            </div>

            <form id="guestbookForm" class="book-form">
              <div class="book-field">
                <label for="gbAuthor" class="book-label">De parte de</label>
                <input type="text" id="gbAuthor" class="book-input" placeholder="Tu nombre o familia (ej. Familia Rodríguez)" required />
              </div>

              <div class="book-field">
                <label for="gbMessage" class="book-label">Tu dedicatoria</label>
                <textarea id="gbMessage" class="book-textarea" placeholder="Escribe aquí tus deseos para Michelle &amp; René..." required rows="4"></textarea>
              </div>

              <div class="book-form-actions">
                <button type="submit" class="book-submit-btn">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                  <span>Firmar el Libro</span>
                </button>

                <button type="button" class="book-secondary-btn" id="btnGoToReadSignatures">
                  <span>Ver firmas de los demás invitados</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              </div>
            </form>
          </div>

          <!-- PÁGINA 2 DEL LIBRO: VER FIRMAS DE LOS INVITADOS (PAGINADO COMO PÁGINAS DE LIBRO) -->
          <div class="book-view book-view-read" id="bookReadView">
            <div class="book-read-topbar">
              <span class="book-read-counter" id="gbCounterBadge">Cargando firmas...</span>
              <button type="button" class="book-back-write-btn" id="btnBackToWrite">
                ✍️ Escribir mi firma
              </button>
            </div>

            <!-- Lista de Firmas de la Página Actual del Libro -->
            <div class="book-signatures-list" id="guestbookList">
              <!-- Renderizado dinámico por app.js -->
            </div>

            <!-- Navegación de Páginas del Libro (evita scroll largo) -->
            <div class="book-pagination" id="bookPagination" style="display:none;">
              <button type="button" class="book-page-btn" id="btnBookPrevPage">← Anterior</button>
              <span class="book-page-indicator" id="bookPageIndicator">Página 1 de 1</span>
              <button type="button" class="book-page-btn" id="btnBookNextPage">Siguiente →</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>

<?php require __DIR__ . '/partials/shared_modals.php'; ?>

  <script src="/assets/js/app.js?v=4"></script>
</body>
</html>
