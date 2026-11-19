<?php
/**
 * API Routes (JSON Endpoints).
 */

declare(strict_types=1);

use App\Controllers\AuthController;
use App\Controllers\MediaController;
use App\Controllers\LikeController;
use App\Controllers\GuestbookController;
use App\Controllers\StatsController;
use App\Controllers\ZipDownloadController;

// Auth endpoints
$router->post('/api/auth/guest-login', [AuthController::class, 'guestLogin']);
$router->get('/api/auth/guest-me', [AuthController::class, 'guestMe']);
$router->post('/api/auth/admin-login', [AuthController::class, 'adminLogin']);
$router->post('/api/auth/admin-logout', [AuthController::class, 'adminLogout']);
$router->get('/api/auth/admin-check', [AuthController::class, 'adminCheck']);
$router->any('/api/auth', [AuthController::class, 'handleLegacy']);

// Media endpoints (Photos & Videos - Cloudflare R2 Direct Upload)
$router->get('/api/media', [MediaController::class, 'index']);
$router->post('/api/media/presign', [MediaController::class, 'presign']);
$router->post('/api/media/confirm', [MediaController::class, 'confirm']);
$router->post('/api/media', [MediaController::class, 'store']);
$router->delete('/api/media/{id}', [MediaController::class, 'destroy']);
$router->post('/api/media/delete', [MediaController::class, 'destroy']);

// Likes
$router->post('/api/like', [LikeController::class, 'toggle']);

// Guestbook endpoints
$router->get('/api/guestbook', [GuestbookController::class, 'index']);
$router->post('/api/guestbook', [GuestbookController::class, 'store']);
$router->delete('/api/guestbook/{id}', [GuestbookController::class, 'destroy']);
$router->post('/api/guestbook/delete', [GuestbookController::class, 'destroy']);

// Dashboard stats
$router->get('/api/stats', [StatsController::class, 'index']);

// ZIP Download
$router->get('/api/zip-download', [ZipDownloadController::class, 'download']);
$router->post('/api/zip-download', [ZipDownloadController::class, 'download']);
