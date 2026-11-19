<?php
/**
 * Front Controller (Boda Michelle & René).
 * Punto único de entrada para todas las peticiones en HostGator.
 */

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

$router = require_once __DIR__ . '/../routes/web.php';
require_once __DIR__ . '/../routes/api.php';

$router->dispatch();
