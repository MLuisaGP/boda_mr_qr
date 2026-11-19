<?php
/**
 * MediaController: Subida directa a Cloudflare R2 (Presigned PUT URLs), listado y eliminación.
 * Reglas:
 *  - Hasta 24 recuerdos por invitado en total, con un máximo de 4 videos.
 *  - Imágenes optimizadas en frontend: principal WebP (o JPEG en iOS Safari) <= 1920px q=0.8 + thumb <= 400px q=0.7.
 *  - Videos validados en frontend y backend: <= 30 MB, <= 20 segundos + portada WebP (o JPEG en iOS Safari) extraída del 1er fotograma.
 */

declare(strict_types=1);

namespace App\Controllers;

use App\Config\Database;
use App\Helpers\AuthHelper;
use App\Helpers\Response;
use App\Models\Guest;
use App\Models\Media;
use App\Services\R2StorageService;
use finfo;
use Throwable;

class MediaController extends Controller {
    private const ALLOWED_IMAGE_MIMES = [
        'image/webp' => 'webp',
        'image/jpeg' => 'jpg',
    ];

    private const ALLOWED_THUMB_MIMES = [
        'image/webp' => 'webp',
        'image/jpeg' => 'jpg',
    ];

    private const ALLOWED_VIDEO_MIMES = [
        'video/mp4' => 'mp4',
        'video/webm' => 'webm',
        'video/quicktime' => 'mov',
    ];

    private const LEGACY_ALLOWED_MIMES = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'image/gif' => 'gif',
        'video/mp4' => 'mp4',
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
        $limit = min(150, max(6, (int) ($_GET['limit'] ?? 24)));
        $offset = ($page - 1) * $limit;

        $result = Media::listItems($filter, $limit, $offset, $guestId, $guestToken);

        $formatted = array_map(static function ($row) {
            $thumbUrl = !empty($row['thumb_path'])
                ? $row['thumb_path']
                : ($row['media_type'] === 'image' ? $row['file_path'] : null);

            return [
                'id' => (int) $row['id'],
                'guest_id' => (int) $row['guest_id'],
                'guest_name' => $row['guest_name'],
                'url' => $row['file_path'],
                'thumb_url' => $thumbUrl,
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
            'guest_video_count' => $guestId ? Guest::getVideoCount($guestId) : 0,
            'guest_max_videos' => Guest::MAX_VIDEOS,
        ]);
    }

    /**
     * Paso 1: Valida cupo, formato, tamaño y duración y entrega Presigned PUT URLs para R2.
     */
    public function presign(): void {
        AuthHelper::startSession();
        $guest = AuthHelper::getGuest();
        $admin = AuthHelper::getAdminUser();

        if (!$guest && !$admin) {
            Response::error('Por favor escribe tu nombre para poder subir tus recuerdos a la boda.', 401);
        }

        if (!R2StorageService::isConfigured()) {
            Response::error('El almacenamiento remoto en Cloudflare R2 aún no está configurado en el servidor.', 503);
        }

        $input = $this->getJsonInput();
        $mediaType = trim((string) ($input['media_type'] ?? ''));
        $mimeType = strtolower(trim((string) ($input['mime_type'] ?? '')));
        $mimeType = explode(';', $mimeType, 2)[0];
        $fileSize = (int) ($input['file_size'] ?? 0);
        $originalName = trim((string) ($input['original_name'] ?? 'recuerdo'));
        $thumbMimeType = strtolower(trim((string) ($input['thumb_mime_type'] ?? '')));
        $thumbMimeType = explode(';', $thumbMimeType, 2)[0];
        $thumbSize = (int) ($input['thumb_size'] ?? 0);
        $duration = isset($input['duration']) && is_numeric($input['duration']) ? (float) $input['duration'] : null;

        if (!in_array($mediaType, ['image', 'video'], true)) {
            Response::error('Tipo de archivo no válido.', 422);
        }

        if ($fileSize <= 0 || $thumbSize <= 0) {
            Response::error('El archivo o su miniatura están vacíos.', 422);
        }

        if (!isset(self::ALLOWED_THUMB_MIMES[$thumbMimeType])) {
            Response::error('La miniatura debe generarse en formato WebP o JPEG.', 422);
        }

        if ($thumbSize > Media::MAX_THUMB_BYTES) {
            Response::error('La miniatura supera el límite máximo permitido de 1 MB.', 422);
        }

        if ($mediaType === 'image') {
            if (!isset(self::ALLOWED_IMAGE_MIMES[$mimeType])) {
                Response::error('Las fotografías optimizadas deben enviarse en formato WebP o JPEG.', 422);
            }
            if ($fileSize > Media::MAX_IMAGE_BYTES) {
                Response::error('La foto optimizada supera el tamaño máximo de 5 MB.', 422);
            }
            $mainExt = self::ALLOWED_IMAGE_MIMES[$mimeType];
        } else {
            if (!isset(self::ALLOWED_VIDEO_MIMES[$mimeType])) {
                Response::error('Formato de video no permitido. Solo se aceptan MP4, MOV o WEBM.', 422);
            }
            if ($fileSize > Media::MAX_VIDEO_BYTES) {
                Response::error('El video supera el tamaño máximo permitido de 30 MB.', 422, [
                    'max_allowed_bytes' => Media::MAX_VIDEO_BYTES,
                    'received_bytes' => $fileSize,
                ]);
            }
            if ($duration === null || $duration <= 0 || $duration > Media::MAX_VIDEO_DURATION) {
                Response::error('El video no puede durar más de 20 segundos.', 422, [
                    'max_duration_sec' => 20,
                    'received_duration' => $duration,
                ]);
            }
            $mainExt = self::ALLOWED_VIDEO_MIMES[$mimeType];
        }

        // Validación de cupo por invitado: máximo 24 totales y máximo 4 videos
        $uploaderId = $guest ? (int) $guest['id'] : 0;
        if ($guest && !$admin) {
            $currentCount = Guest::getItemCount($uploaderId);
            if ($currentCount >= Guest::MAX_ITEMS) {
                Response::error('Has alcanzado el límite de ' . Guest::MAX_ITEMS . ' recuerdos multimedia.', 403, [
                    'current_count' => $currentCount,
                    'max_items' => Guest::MAX_ITEMS,
                ]);
            }

            if ($mediaType === 'video') {
                $currentVideos = Guest::getVideoCount($uploaderId);
                if ($currentVideos >= Guest::MAX_VIDEOS) {
                    Response::error(
                        'Has alcanzado el máximo de ' . Guest::MAX_VIDEOS . ' videos por invitado. ¡Aún puedes seguir subiendo fotos hasta completar tus ' . Guest::MAX_ITEMS . ' recuerdos!',
                        403,
                        [
                            'current_videos' => $currentVideos,
                            'max_videos' => Guest::MAX_VIDEOS,
                        ]
                    );
                }
            }
        }

        $thumbExt = self::ALLOWED_THUMB_MIMES[$thumbMimeType];
        $uploaderName = $guest ? (string) $guest['name'] : (string) ($admin['full_name'] ?? 'Novios');
        $keys = R2StorageService::buildObjectKeys($uploaderName, $mainExt, $thumbExt);
        $cacheControl = 'public, max-age=31536000, immutable';

        try {
            $mainPresignedUrl = R2StorageService::createPresignedPutUrl($keys['main_key'], $mimeType, $fileSize, 600);
            $thumbPresignedUrl = R2StorageService::createPresignedPutUrl($keys['thumb_key'], $thumbMimeType, $thumbSize, 600);

            $uploadToken = R2StorageService::signUploadToken([
                'guest_id' => $uploaderId,
                'is_admin' => (bool) ($admin && !$guest),
                'guest_name' => $uploaderName,
                'media_type' => $mediaType,
                'mime_type' => $mimeType,
                'file_size' => $fileSize,
                'thumb_mime_type' => $thumbMimeType,
                'thumb_size' => $thumbSize,
                'original_name' => mb_substr($originalName, 0, 250),
                'main_key' => $keys['main_key'],
                'thumb_key' => $keys['thumb_key'],
            ]);
        } catch (Throwable $e) {
            error_log('R2 Presign Error: ' . $e->getMessage());
            Response::error('No fue posible preparar la subida a la nube. Intenta de nuevo.', 500);
        }

        Response::json([
            'success' => true,
            'upload_token' => $uploadToken,
            'main_upload' => [
                'url' => $mainPresignedUrl,
                'headers' => [
                    'Content-Type' => $mimeType,
                    'Cache-Control' => $cacheControl,
                ],
            ],
            'thumb_upload' => [
                'url' => $thumbPresignedUrl,
                'headers' => [
                    'Content-Type' => $thumbMimeType,
                    'Cache-Control' => $cacheControl,
                ],
            ],
        ]);
    }

    /**
     * Paso 2: Verifica con HeadObject que los archivos ya están en R2 y guarda las URLs en MySQL.
     */
    public function confirm(): void {
        AuthHelper::startSession();
        $guest = AuthHelper::getGuest();
        $admin = AuthHelper::getAdminUser();

        if (!$guest && !$admin) {
            Response::error('Tu sesión expiró. Vuelve a escribir tu nombre para guardar tus recuerdos.', 401);
        }

        $input = $this->getJsonInput();
        $uploadToken = (string) ($input['upload_token'] ?? '');
        $payload = R2StorageService::verifyUploadToken($uploadToken);

        if ($payload === null) {
            Response::error('El token de subida es inválido o expiró. Intenta subir nuevamente.', 400);
        }

        $uploaderId = $guest ? (int) $guest['id'] : 0;
        if (!$admin && (int) ($payload['guest_id'] ?? -1) !== $uploaderId) {
            Response::error('No autorizado para confirmar esta subida.', 403);
        }

        $mainKey = (string) ($payload['main_key'] ?? '');
        $thumbKey = (string) ($payload['thumb_key'] ?? '');
        $mediaType = (string) ($payload['media_type'] ?? 'image');

        $cleanupR2 = static function () use ($mainKey, $thumbKey): void {
            R2StorageService::deleteObject($mainKey);
            R2StorageService::deleteObject($thumbKey);
        };

        // Revalidar cupo antes de persistir (protección contra subidas concurrentes)
        if ($guest && !$admin) {
            $currentCount = Guest::getItemCount($uploaderId);
            if ($currentCount >= Guest::MAX_ITEMS) {
                $cleanupR2();
                Response::error('Has alcanzado el límite de ' . Guest::MAX_ITEMS . ' recuerdos multimedia.', 403);
            }
            if ($mediaType === 'video' && Guest::getVideoCount($uploaderId) >= Guest::MAX_VIDEOS) {
                $cleanupR2();
                Response::error('Has alcanzado el máximo de ' . Guest::MAX_VIDEOS . ' videos por invitado.', 403);
            }
        }

        // Confirmar existencia y tamaño real en Cloudflare R2
        $mainHead = R2StorageService::headObject($mainKey);
        $thumbHead = R2StorageService::headObject($thumbKey);

        if ($mainHead === null || $thumbHead === null) {
            $cleanupR2();
            Response::error('No se confirmó el archivo en Cloudflare R2. Verifica tu conexión e intenta de nuevo.', 422);
        }

        $maxMainBytes = $mediaType === 'video' ? Media::MAX_VIDEO_BYTES : Media::MAX_IMAGE_BYTES;
        if ($mainHead['size'] <= 0 || $mainHead['size'] > $maxMainBytes || $thumbHead['size'] <= 0 || $thumbHead['size'] > Media::MAX_THUMB_BYTES) {
            $cleanupR2();
            Response::error('El tamaño del archivo subido excede el límite permitido.', 422);
        }

        $mainUrl = R2StorageService::buildPublicUrl($mainKey);
        $thumbUrl = R2StorageService::buildPublicUrl($thumbKey);
        $uploaderName = (string) ($payload['guest_name'] ?? ($guest ? $guest['name'] : ($admin['full_name'] ?? 'Novios')));
        $originalName = (string) ($payload['original_name'] ?? 'recuerdo');
        $mimeType = (string) ($payload['mime_type'] ?? $mainHead['content_type'] ?: 'application/octet-stream');

        try {
            $mediaId = Media::create([
                'guest_id' => $uploaderId,
                'guest_name' => $uploaderName,
                'file_path' => $mainUrl,
                'thumb_path' => $thumbUrl,
                'original_name' => mb_substr($originalName, 0, 250),
                'mime_type' => $mimeType,
                'file_size' => $mainHead['size'],
                'media_type' => $mediaType,
            ]);
        } catch (Throwable $e) {
            $cleanupR2();
            error_log('Media DB Insert Error: ' . $e->getMessage());
            Response::error('No se pudo registrar tu recuerdo en la base de datos. Intenta de nuevo.', 500);
        }

        $newCount = $uploaderId > 0 ? Guest::getItemCount($uploaderId) : 0;
        $newVideoCount = $uploaderId > 0 ? Guest::getVideoCount($uploaderId) : 0;

        Response::success('¡Tu recuerdo se ha subido con éxito!', [
            'item' => [
                'id' => $mediaId,
                'guest_id' => $uploaderId,
                'url' => $mainUrl,
                'thumb_url' => $thumbUrl,
                'media_type' => $mediaType,
                'original_name' => $originalName,
                'file_size' => $mainHead['size'],
                'guest_name' => $uploaderName,
                'likes_count' => 0,
                'is_owner' => true,
                'has_liked' => false,
                'created_at' => date('Y-m-d H:i:s'),
            ],
            'guest_item_count' => $newCount,
            'guest_max_items' => Guest::MAX_ITEMS,
            'guest_video_count' => $newVideoCount,
            'guest_max_videos' => Guest::MAX_VIDEOS,
        ], 201);
    }

    /**
     * Endpoint legacy mantenido solo como respaldo si R2 no estuviera activo.
     */
    public function store(): void {
        if (R2StorageService::isConfigured()) {
            Response::error('Usa el flujo optimizado de subida directa a Cloudflare R2 (/api/media/presign). Recarga la página.', 426);
        }

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
        if ($file['size'] > Media::MAX_BYTES || $file['size'] <= 0) {
            Response::error('El archivo excede el tamaño máximo permitido de 2 MB.', 422);
        }

        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $detectedMime = $finfo->file($file['tmp_name']);
        if (!isset(self::LEGACY_ALLOWED_MIMES[$detectedMime])) {
            Response::error('Formato no permitido.', 422);
        }

        $ext = self::LEGACY_ALLOWED_MIMES[$detectedMime];
        $mediaType = str_starts_with($detectedMime, 'video/') ? 'video' : 'image';

        $uploaderId = $guest ? (int) $guest['id'] : 0;
        if ($guest && !$admin) {
            if (Guest::getItemCount($uploaderId) >= Guest::MAX_ITEMS) {
                Response::error('Has alcanzado el límite de ' . Guest::MAX_ITEMS . ' recuerdos multimedia.', 403);
            }
            if ($mediaType === 'video' && Guest::getVideoCount($uploaderId) >= Guest::MAX_VIDEOS) {
                Response::error('Has alcanzado el máximo de ' . Guest::MAX_VIDEOS . ' videos por invitado.', 403);
            }
        }

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
            'thumb_path' => null,
            'original_name' => mb_substr($file['name'], 0, 250),
            'mime_type' => $detectedMime,
            'file_size' => $file['size'],
            'media_type' => $mediaType,
        ]);

        Response::success('¡Tu recuerdo se ha subido con éxito!', [
            'item' => [
                'id' => $mediaId,
                'url' => $relativePath,
                'thumb_url' => $mediaType === 'image' ? $relativePath : null,
                'media_type' => $mediaType,
                'original_name' => $file['name'],
                'guest_name' => $uploaderName,
                'likes_count' => 0,
                'is_owner' => true,
                'has_liked' => false,
                'created_at' => date('Y-m-d H:i:s'),
            ],
            'guest_item_count' => $uploaderId > 0 ? Guest::getItemCount($uploaderId) : 0,
            'guest_max_items' => Guest::MAX_ITEMS,
            'guest_video_count' => $uploaderId > 0 ? Guest::getVideoCount($uploaderId) : 0,
            'guest_max_videos' => Guest::MAX_VIDEOS,
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

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('SELECT * FROM `media` WHERE `id` = :id LIMIT 1');
        $stmt->execute([':id' => $mediaId]);
        $item = $stmt->fetch();

        if (!$item) {
            Response::error('El archivo no existe o ya fue eliminado.', 404);
        }

        // El invitado SOLO puede eliminar sus propias fotos/videos
        if (!$admin && ((int) $item['guest_id'] !== (int) $guest['id'])) {
            Response::error('Solo puedes eliminar los recuerdos que tú mismo subiste.', 403);
        }

        Media::delete($mediaId);

        // Eliminar objeto(s) en Cloudflare R2 o en disco local si es legacy
        $storedPath = (string) ($item['file_path'] ?? '');
        $thumbPath = (string) ($item['thumb_path'] ?? '');

        if (R2StorageService::isRemoteUrl($storedPath)) {
            R2StorageService::deleteByUrl($storedPath);
        } elseif ($storedPath !== '') {
            $localFile = dirname(__DIR__, 2) . '/public/' . ltrim($storedPath, '/');
            if (file_exists($localFile) && is_file($localFile)) {
                @unlink($localFile);
            }
        }

        if ($thumbPath !== '') {
            if (R2StorageService::isRemoteUrl($thumbPath)) {
                R2StorageService::deleteByUrl($thumbPath);
            } else {
                $localThumb = dirname(__DIR__, 2) . '/public/' . ltrim($thumbPath, '/');
                if (file_exists($localThumb) && is_file($localThumb)) {
                    @unlink($localThumb);
                }
            }
        }

        $guestId = $guest ? (int) $guest['id'] : 0;

        Response::success('Recuerdo eliminado correctamente.', [
            'guest_item_count' => $guestId > 0 ? Guest::getItemCount($guestId) : 0,
            'guest_max_items' => Guest::MAX_ITEMS,
            'guest_video_count' => $guestId > 0 ? Guest::getVideoCount($guestId) : 0,
            'guest_max_videos' => Guest::MAX_VIDEOS,
        ]);
    }
}
