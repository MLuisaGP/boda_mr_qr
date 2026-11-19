<?php
/**
 * ZipDownloadController: Descarga de todas las fotos o elementos seleccionados en formato ZIP.
 */

declare(strict_types=1);

namespace App\Controllers;

use App\Helpers\Response;
use App\Helpers\AuthHelper;
use App\Config\Database;
use ZipArchive;

class ZipDownloadController extends Controller {
    public function download(): void {
        AuthHelper::startSession();
        $admin = AuthHelper::getAdminUser();

        if (!$admin) {
            Response::error('Acceso exclusivo para los novios y organizadores.', 401);
        }

        if (!class_exists('ZipArchive')) {
            Response::error('La extensión ZipArchive no está habilitada en el servidor PHP.', 500);
        }

        $input = array_merge($_GET, $_POST, $this->getJsonInput());
        $rawIds = $input['ids'] ?? null;
        $selectedIds = [];

        if (is_string($rawIds) && trim($rawIds) !== '') {
            $selectedIds = array_filter(array_map('intval', explode(',', $rawIds)));
        } elseif (is_array($rawIds)) {
            $selectedIds = array_filter(array_map('intval', $rawIds));
        }

        $pdo = Database::getConnection();

        if (!empty($selectedIds)) {
            $inClause = implode(',', array_fill(0, count($selectedIds), '?'));
            $stmt = $pdo->prepare("SELECT * FROM `media` WHERE `id` IN ({$inClause}) AND `is_approved` = 1 ORDER BY `id` ASC");
            $stmt->execute(array_values($selectedIds));
        } else {
            $stmt = $pdo->prepare("SELECT * FROM `media` WHERE `is_approved` = 1 ORDER BY `id` ASC");
            $stmt->execute();
        }

        $items = $stmt->fetchAll();

        if (empty($items)) {
            Response::error('No se encontraron fotos o videos para empaquetar.', 404);
        }

        $tmpZipPath = tempnam(sys_get_temp_dir(), 'boda_zip_');
        $zip = new ZipArchive();

        if ($zip->open($tmpZipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            Response::error('No se pudo crear el archivo comprimido temporal.', 500);
        }

        $publicDir = dirname(__DIR__, 2) . '/public';
        $addedCount = 0;

        foreach ($items as $index => $item) {
            $realPath = $publicDir . '/' . $item['file_path'];
            if (file_exists($realPath) && is_file($realPath)) {
                $ext = pathinfo($realPath, PATHINFO_EXTENSION);
                $cleanGuest = preg_replace('/[^a-zA-Z0-9_-]/', '_', $item['guest_name']);
                $entryName = sprintf(
                    '%03d_%s_%s.%s',
                    $index + 1,
                    $cleanGuest ?: 'Invitado',
                    date('Ymd_His', strtotime($item['created_at'])),
                    $ext
                );
                $zip->addFile($realPath, $entryName);
                $addedCount++;
            }
        }

        $zip->close();

        if ($addedCount === 0) {
            @unlink($tmpZipPath);
            Response::error('Ninguno de los archivos físicos existe en el servidor.', 404);
        }

        $zipFileName = 'Boda_Michelle_y_Rene_Recuerdos_' . date('Y-m-d') . '.zip';

        header('Content-Type: application/zip');
        header('Content-Disposition: attachment; filename="' . $zipFileName . '"');
        header('Content-Length: ' . filesize($tmpZipPath));
        header('Pragma: no-cache');
        header('Expires: 0');

        readfile($tmpZipPath);
        @unlink($tmpZipPath);
        exit;
    }
}
