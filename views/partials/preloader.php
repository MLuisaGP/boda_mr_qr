<?php
/**
 * Preloader elegante con el monograma M&R inline y anillo dorado progresivo.
 * Se muestra al cargar y al cambiar entre vistas del sitio de invitados sin peticiones extra.
 */
?>
  <!-- PRELOADER ELEGANTE CON MONOGRAMA M&R INLINE -->
  <div id="interactive-preloader" role="status" aria-live="polite" aria-label="Cargando experiencia de boda" style="display:none;">
    <div class="preloader-inner">
      <svg id="preloader-svg" xmlns="http://www.w3.org/2000/svg" width="190" height="190" viewBox="0 0 500 500" aria-hidden="true">
        <defs>
          <linearGradient id="preloaderGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#F4E2B7"/>
            <stop offset="45%" stop-color="#C9A050"/>
            <stop offset="100%" stop-color="#8F6B28"/>
          </linearGradient>
          <radialGradient id="preloaderGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="rgba(201, 160, 80, 0.16)"/>
            <stop offset="100%" stop-color="transparent"/>
          </radialGradient>
        </defs>
        <circle cx="250" cy="250" r="235" fill="url(#preloaderGlow)" />
        <circle cx="250" cy="250" r="210" fill="none" stroke="rgba(201, 160, 80, 0.18)" stroke-width="2" />
        <circle cx="250" cy="250" r="195" fill="none" stroke="rgba(201, 160, 80, 0.12)" stroke-width="1" stroke-dasharray="3, 5" />
        <circle id="preloader-ring-circle" cx="250" cy="250" r="210" fill="none"
                stroke="url(#preloaderGold)" stroke-width="3.5" stroke-linecap="round"
                stroke-dasharray="1320" stroke-dashoffset="1320"
                transform="rotate(-90 250 250)" />
        <svg id="preloader-center-logo" x="110" y="118" width="280" height="250" viewBox="0 0 676 606" fill="#4A5842">
          <path d="M492 137C518.393 122.604 535.263 128.595 543 137C547.722 142.13 548 148.158 548 151C548 158.5 543.5 165.5 534.5 165.5C524 165.5 517.889 155 521.5 147.5C522.71 144.987 524.115 141.367 523 139C521.836 136.53 518.052 135.231 515 135.5C447 141.5 375.5 279 354 319C354.053 319.077 373.5 347.555 373.5 388C373.5 492 260.5 559.5 177 559.5C147 559.5 82 548.5 82 482C82 442.5 119 413.5 152 421.5V427C113 420 89 457.5 89 482C89 521.5 119 553.98 184.5 552.5C273 550.5 346 462 346 392C346 372.8 340.5 351.5 337.5 344C307.5 387.5 276 398 257.5 398C239 398 199.5 392.5 199.5 348C199.5 303.5 249.5 271.5 290.5 257.5C287.667 250.334 281.5 238.6 281.5 213C281.5 176 313 152.5 339.5 152.5C362 152.5 379.5 165.5 379.5 184.5C379.5 220.5 336.833 244.834 316 253C314.8 256.6 339.5 295.167 351 313C422 183.5 457 156.091 492 137ZM294 264C272.833 274.5 229.5 306.3 229.5 345.5C229.5 384.7 260 388 269 388C278 388 305 382.5 334.5 337C322.167 315.789 294 269 294 264ZM341 159.5C317 159.5 304.5 187.5 304.5 208C304.5 224.4 310.167 241.167 313 247.5C364.5 223 372 200 372 189C372 178 367.5 159.5 341 159.5Z"/>
          <path d="M454.5 256.134C519.5 256.289 555 296.5 555 334C555 361.5 544 410.5 473.5 420C487.5 426 506.5 438 550.5 512.5C571.523 548.096 620.5 611 674 593.5L676 598.5C669.5 600.833 654.7 605.494 639.5 605.5C598.837 605.516 553 582.5 509.5 510.5C477.513 457.556 457.5 423 438 423H407V528C407 554 408.5 566 438 566V571H346.5V566C364.5 566 375 563.6 375 528V414C376.167 409.667 377.5 398.3 377.5 387.5C377.5 376.7 376.167 366.333 375 362.5V289.5L396 256C396 256 398.5 256 454.5 256.134ZM407 262.5V416.5H454.5C495.5 416.5 522 384.5 522 337C522 290.5 491.5 262.5 448.5 262.5H407Z"/>
          <path d="M380 256H344.5V261.5C363.7 261.5 368 265.5 371.051 271.5L380 256Z"/>
          <path d="M98 357.5H8V352.5C45.5 352.5 46 318.5 46 278.5V36.5C46 23 31.5 5 0 5V0H68.5C77 0 77 0 83 14C89 28 198.5 261.5 198.5 261.5C198.5 261.5 307.028 25.5 311.5 14C315.972 2.5 317 0 322.5 0H385V5C340.6 5 350.5 26 350.5 150.5C339.3 147.3 323.833 151.333 317.5 154L315 26.5L185 313H181.5L55.5 43C55.5 43 54.5 221.5 54.5 278.5C54.5 335.5 65.5 352.5 98 352.5V357.5Z"/>
        </svg>
      </svg>
      <div id="preloader-percentage">0%</div>
      <button id="pl-skip-btn" type="button" title="Entrar">Entrar</button>
    </div>
  </div>
  <script>
    (function () {
      var p = document.getElementById('interactive-preloader');
      if (!p) return;
      p.style.display = 'flex';
      p.setAttribute('aria-hidden', 'false');
      document.body.classList.add('loading');
    })();
  </script>
