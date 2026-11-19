<?php
/**
 * MediaController: Subida, listado y eliminación de fotos/videos.
 */

declare(strict_types=1);

namespace App\Controllers;

use App\Helpers\Response;
use App\Helpers\AuthHelper;
use App\Models\Media;
use App\Models\Guest;
use finfo;

class MediaController extends Controller {
    private const ALLOWED_MIMES = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp',
        'image/gif'  => 'gif',
        'video/mp4'  => 'mp4',
        'video/webm' => 'webm',
        'video/quicktime' => 'mov',
    ];

    public function index(): void {
        AuthHelper::startSession();
        $guest = AuthHelper::getGuest();
        $guestId = $guest ? (int) $guest['id'] : 0;
        $guestToken = $guest ? $guest['token'] : '';

        $filter = trim($_GET['filter'] ?? 'all');
        $page = max(1, (int) ($_GET['page'] ?? 1));
        $limit = min(60, max(6, (int) ($_GET['limit'] ?? 24)));
        $offset = ($page - 1) * $limit;

        $result = Media::listItems($filter, $limit, $offset, $guestId, $guestToken);

        $formatted = array_map(function ($row) {
            return [
                'id' => (int) $row['id'],
                'guest_id' => (int) $row['guest_id'],
                'guest_name' => $row['guest_name'],
                'url' => $row['file_path'],
                'original_name' => $row['original_name'],
                'mime_type' => $row['mime_type'],
                'file_size' => (int) $row['file_size'],
                'media_type' => $row['media_type'],
                'likes_count' => (int) $row['likes_count'],
                'created_at' => $row['created_at'],
                'is_owner' => (bool) $row['is_owner'],
                'has_liked' => (bool) $row['has_liked'],
            ];
        }, $result['items']);

        $pages = ceil($result['total'] / $limit) ?: 1;

        Response::json([
            'success' => true,
            'items' => $formatted,
            'total' => $result['total'],
            'page' => $page,
            'pages' => (int) $pages,
            'guest_item_count' => $guestId ? Guest::getItemCount($guestId) : 0,
            'guest_max_items' => Guest::MAX_ITEMS,
        ]);
    }

    public function store(): void {
        AuthHelper::startSession();
        $guest = AuthHelper::getGuest();
        $admin = AuthHelper::getAdminUser();

        if (!$guest && !$admin) {
            Response::error('Por favor escribe tu nombre para poder subir tus fotos a la boda.', 401);
        }

        if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            $code = $_FILES['file']['error'] ?? -1;
            $msg = 'No se recibió ningún archivo válido.';
            if ($code === UPLOAD_ERR_INI_SIZE || $code === UPLOAD_ERR_FORM_SIZE) {
                $msg = 'El archivo supera el límite de subida permitido.';
            }
            Response::error($msg, 400);
        }

        $file = $_FILES['file'];

        // Límite estricto de 2 MB
        if ($file['size'] > Media::MAX_BYTES) {
            Response::error('El archivo excede el tamaño máximo permitido de 2 MB.', 422, [
                'max_allowed_bytes' => Media::MAX_BYTES,
                'received_bytes' => $file['size']
            ]);
        }

        if ($file['size'] <= 0) {
            Response::error('El archivo enviado está vacío.', 422);
        }

        // Límite estricto (< 25 -> máx. 24 elementos por invitado)
        $uploaderId = $guest ? (int) $guest['id'] : 0;
        if ($guest && !$admin) {
            $currentCount = Guest::getItemCount($uploaderId);
            if ($currentCount >= Guest::MAX_ITEMS) {
                Response::error('Has alcanzado el límite de ' . Guest::MAX_ITEMS . ' recuerdos multimedia.', 403, [
                    'current_count' => $currentCount,
                    'max_items' => Guest::MAX_ITEMS
                ]);
            }
        }

        // Inspección segura de MIME type
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $detectedMime = $finfo->file($file['tmp_name']);

        if (!isset(self::ALLOWED_MIMES[$detectedMime])) {
            Response::error('Formato no permitido. Solo se aceptan fotos (JPG, PNG, WEBP, GIF) y videos cortos (MP4, MOV, WEBM).', 422, [
                'detected_mime' => $detectedMime
            ]);
        }

        $ext = self::ALLOWED_MIMES[$detectedMime];
        $mediaType = str_starts_with($detectedMime, 'video/') ? 'video' : 'image';

        $uploadDir = dirname(__DIR__, 2) . '/public/uploads';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $uniqueName = 'boda_mr_' . date('Ymd_His') . '_' . bin2hex(random_bytes(6)) . '.' . $ext;
        $destination = $uploadDir . '/' . $uniqueName;

        if (!move_uploaded_file($file['tmp_name'], $destination)) {
            Response::error('Error al guardar el archivo en el servidor. Intenta de nuevo.', 500);
        }

        $relativePath = 'uploads/' . $uniqueName;
        $uploaderName = $guest ? $guest['name'] : ($admin['full_name'] ?? 'Novios');

        $mediaId = Media::create([
            'guest_id' => $uploaderId,
            'guest_name' => $uploaderName,
            'file_path' => $relativePath,
            'original_name' => mb_substr($file['name'], 0, 250),
            'mime_type' => $detectedMime,
            'file_size' => $file['size'],
            'media_type' => $mediaType,
        ]);

        $newCount = $uploaderId > 0 ? Guest::getItemCount($uploaderId) : 0;

        Response::success('¡Tu recuerdo se ha subido con éxito!', [
            'item' => [
                'id' => $mediaId,
                'url' => $relativePath,
                'media_type' => $mediaType,
                'original_name' => $file['name'],
                'guest_name' => $uploaderName,
                'likes_count' => 0,
                'is_owner' => true,
                'has_liked' => false,
                'created_at' => date('Y-m-d H:i:s'),
            ],
            'guest_item_count' => $newCount,
            'guest_max_items' => Guest::MAX_ITEMS,
        ], 201);
    }

    public function destroy(?string $id = null): void {
        AuthHelper::startSession();
        $admin = AuthHelper::getAdminUser();
        $guest = AuthHelper::getGuest();

        if (!$admin && !$guest) {
            Response::error('No tienes permiso para eliminar este archivo.', 401);
        }

        $input = array_merge($_POST, $this->getJsonInput());
        $mediaId = (int) ($id ?? ($input['id'] ?? ($_GET['id'] ?? 0)));

        if ($mediaId <= 0) {
            Response::error('ID de archivo no válido.', 422);
        }

        $pdo = \App\Config\Database::getConnection();
        $stmt = $pdo->prepare('SELECT * FROM `media` WHERE `id` = :id LIMIT 1');
        $stmt->execute([':id' => $mediaId]);
        $item = $stmt->fetch();

        if (!$item) {
            Response::error('El archivo no existe o ya fue eliminado.', 404);
        }

        // El invitado SOLO puede eliminar sus propias fotos
        if (!$admin && ((int) $item['guest_id'] !== (int) $guest['id'])) {
            Response::error('Solo puedes eliminar los recuerdos que tú mismo subiste.', 403);
        }

        Media::delete($mediaId);

        $filePath = dirname(__DIR__, 2) . '/public/' . $item['file_path'];
        if (file_exists($filePath) && is_file($filePath)) {
            @unlink($filePath);
        }

        Response::success('Recuerdo eliminado correctamente.');
    }
}
