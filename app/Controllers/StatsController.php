<?php
/**
 * StatsController: Métricas en tiempo real para el panel de administración.
 */

declare(strict_types=1);

namespace App\Controllers;

use App\Helpers\Response;
use App\Helpers\AuthHelper;
use App\Config\Database;

class StatsController extends Controller {
    public function index(): void {
        AuthHelper::requireAdmin();
        $pdo = Database::getConnection();

        $totalMedia = (int) $pdo->query('SELECT COUNT(*) FROM `media`')->fetchColumn();
        $totalPhotos = (int) $pdo->query("SELECT COUNT(*) FROM `media` WHERE `media_type` = 'image'")->fetchColumn();
        $totalVideos = (int) $pdo->query("SELECT COUNT(*) FROM `media` WHERE `media_type` = 'video'")->fetchColumn();
        $totalGuestbook = (int) $pdo->query('SELECT COUNT(*) FROM `guestbook`')->fetchColumn();
        $totalGuests = (int) $pdo->query('SELECT COUNT(*) FROM `guests`')->fetchColumn();
        $totalLikes = (int) $pdo->query('SELECT COUNT(*) FROM `media_likes`')->fetchColumn();
        $totalBytes = (int) $pdo->query('SELECT COALESCE(SUM(`file_size`), 0) FROM `media`')->fetchColumn();

        $storageMB = round($totalBytes / (1024 * 1024), 2);

        Response::json([
            'success' => true,
            'stats' => [
                'total_media' => $totalMedia,
                'total_photos' => $totalPhotos,
                'total_videos' => $totalVideos,
                'total_guestbook' => $totalGuestbook,
                'total_guests' => $totalGuests,
                'total_likes' => $totalLikes,
                'storage_mb' => $storageMB,
            ]
        ]);
    }
}
