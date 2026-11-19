<?php
/**
 * ZipDownloadController: Retirado en favor de descarga directa desde Cloudflare R2
 * mediante Cyberduck o rclone (egress gratuito y sin carga sobre el hosting compartido).
 */

declare(strict_types=1);

namespace App\Controllers;

use App\Helpers\AuthHelper;
use App\Helpers\Response;
use App\Services\R2StorageService;

class ZipDownloadController extends Controller {
    public function download(): void {
        AuthHelper::startSession();
        $admin = AuthHelper::getAdminUser();

        if (!$admin) {
            Response::error('Acceso exclusivo para los novios y organizadores.', 401);
        }

        $r2Info = R2StorageService::getPublicConnectionInfo();

        Response::error(
            'La descarga masiva en ZIP desde PHP fue reemplazada por descarga directa desde Cloudflare R2 usando Cyberduck o rclone (carpeta media/). Consulta la guía en el panel de administración.',
            410,
            ['r2' => $r2Info]
        );
    }
}
