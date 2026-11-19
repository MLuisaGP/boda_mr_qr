<?php
/**
 * Web Routes (HTML Views).
 */

declare(strict_types=1);

use App\Routing\Router;
use App\Controllers\HomeController;
use App\Controllers\AdminController;

$router = new Router();

// Ruta pública principal
$router->get('/', [HomeController::class, 'index']);

// Ruta independiente de Galería (estilo Pinterest y wedding.jongjeonglee.com)
$router->get('/galeria', [HomeController::class, 'gallery']);
$router->get('/galerias', [HomeController::class, 'gallery']);
$router->get('/fotos', [HomeController::class, 'gallery']);

// Ruta independiente del Libro de Firmas
$router->get('/firmas', [HomeController::class, 'guestbook']);

// Ruta del panel administrativo de novios
$router->get('/admin', [AdminController::class, 'index']);

return $router;
