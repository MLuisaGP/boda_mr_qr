<?php
/**
 * PWA Meta Tags, Fonts & Stylesheet Head Partial
 * Expects optional $pageTitle, $pageDesc, $themeColor
 */
$pageTitle = $pageTitle ?? 'Boda Michelle & René · 19 de Diciembre 2026';
$pageDesc = $pageDesc ?? 'Celebra con nosotros la boda de Michelle y René. Comparte tus fotos, videos y firma nuestro libro de recuerdos.';
$themeColor = $themeColor ?? '#4A5842';
?>
  <meta charset="UTF-8">
<?php if (($activePage ?? '') === 'home'): ?>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
<?php else: ?>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<?php endif; ?>
  <title><?= htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8') ?></title>
  <meta name="description" content="<?= htmlspecialchars($pageDesc, ENT_QUOTES, 'UTF-8') ?>">
  <meta name="theme-color" content="<?= htmlspecialchars($themeColor, ENT_QUOTES, 'UTF-8') ?>">

  <!-- PWA Standalone / App-like Meta Tags -->
  <link rel="manifest" href="/manifest.json">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="M&amp;R Boda">
  <link rel="apple-touch-icon" href="/assets/img/pwa-icon-192.png">
  <link rel="icon" type="image/svg+xml" href="/assets/img/m&amp;r.svg?v=3">

  <!-- Open Graph -->
  <meta property="og:title" content="<?= htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8') ?>">
  <meta property="og:description" content="<?= htmlspecialchars($pageDesc, ENT_QUOTES, 'UTF-8') ?>">
  <meta property="og:image" content="/assets/img/hero-widescreen.jpg">

  <!-- Fonts & Styles -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<?php
$coreFontsUrl = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Corinthia:wght@400&family=Montserrat:wght@400;500&family=Tangerine:wght@400;700&display=swap';
$guestbookFontsUrl = 'https://fonts.googleapis.com/css2?family=Ballet&family=Lavishly+Yours&family=Annie+Use+Your+Telescope&family=Indie+Flower&family=Oooh+Baby&family=Italianno&display=swap';
?>
  <link rel="preload" as="style" href="<?= $coreFontsUrl ?>" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="<?= $coreFontsUrl ?>"></noscript>
<?php if (($activePage ?? '') === 'guestbook'): ?>
  <link rel="preload" as="image" href="/assets/img/l-m&amp;r.svg?v=2">
  <link rel="preload" as="style" href="<?= $guestbookFontsUrl ?>" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="<?= $guestbookFontsUrl ?>"></noscript>
<?php endif; ?>
  <link rel="stylesheet" href="/assets/css/app.css?v=70">
