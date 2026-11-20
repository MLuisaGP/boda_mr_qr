<?php
/**
 * Media Model (Wedding Photos & Videos).
 */

declare(strict_types=1);

namespace App\Models;

use App\Config\Database;
use DateTimeImmutable;
use DateTimeZone;
use PDO;
use Throwable;

class Media {
    public const MAX_BYTES = 2097152; // Legacy fallback (2 MB)
    public const MAX_IMAGE_BYTES = 5242880; // 5 MB para WebP/JPEG optimizado (1920px q=0.8)
    public const MAX_THUMB_BYTES = 1048576; // 1 MB para thumbnail (400px q=0.7)
    public const MAX_VIDEO_BYTES = 31457280; // 30 MB máximo por video
    public const MAX_VIDEO_DURATION = 20.5; // 20 segundos (+0.5s tolerancia de contenedor móvil)
    public const UPLOAD_DEADLINE_LOCAL = '2026-12-21 23:59:59';
    public const DEFAULT_TIMEZONE = 'America/Mexico_City';
    public const UPLOAD_CLOSED_MESSAGE = 'El periodo para subir fotos y videos cerró el 21 de diciembre de 2026. ¡Gracias por compartir tus recuerdos!';

    public static function getUploadTimezone(): DateTimeZone {
        $env = Database::loadEnv();
        $tzName = trim((string) ($env['APP_TIMEZONE'] ?? self::DEFAULT_TIMEZONE));
        try {
            return new DateTimeZone($tzName !== '' ? $tzName : self::DEFAULT_TIMEZONE);
        } catch (Throwable $e) {
            return new DateTimeZone(self::DEFAULT_TIMEZONE);
        }
    }

    public static function getUploadDeadline(): DateTimeImmutable {
        $env = Database::loadEnv();
        $tz = self::getUploadTimezone();
        $rawDeadline = trim((string) ($env['UPLOAD_DEADLINE'] ?? self::UPLOAD_DEADLINE_LOCAL));
        try {
            return new DateTimeImmutable($rawDeadline !== '' ? $rawDeadline : self::UPLOAD_DEADLINE_LOCAL, $tz);
        } catch (Throwable $e) {
            return new DateTimeImmutable(self::UPLOAD_DEADLINE_LOCAL, $tz);
        }
    }

    public static function isUploadClosed(?DateTimeImmutable $now = null): bool {
        $tz = self::getUploadTimezone();
        $current = $now ?? new DateTimeImmutable('now', $tz);
        return $current > self::getUploadDeadline();
    }

    public static function getUploadDeadlineInfo(): array {
        $deadline = self::getUploadDeadline();
        return [
            'uploads_closed' => self::isUploadClosed(),
            'upload_deadline' => $deadline->format(DATE_ATOM),
            'upload_deadline_label' => '21 de diciembre de 2026',
        ];
    }

    public static function listItems(string $filter = 'all', int $limit = 24, int $offset = 0, int $currentGuestId = 0, string $currentGuestToken = ''): array {
        $pdo = Database::getConnection();

        $where = ['`is_approved` = 1'];
        $params = [];

        if ($filter === 'my') {
            if ($currentGuestId <= 0) {
                return ['items' => [], 'total' => 0];
            }
            $where[] = '`guest_id` = :my_guest_id';
            $params[':my_guest_id'] = $currentGuestId;
        }

        if ($filter === 'popular') {
            $where[] = '`likes_count` > 0';
        }

        $whereSql = implode(' AND ', $where);
        $orderBy = $filter === 'popular'
            ? 'm.`likes_count` DESC, m.`created_at` DESC, m.`id` DESC'
            : 'm.`created_at` DESC, m.`id` DESC';

        $cntStmt = $pdo->prepare("SELECT COUNT(*) FROM `media` WHERE {$whereSql}");
        $cntStmt->execute($params);
        $total = (int) $cntStmt->fetchColumn();

        $sql = "
            SELECT 
                m.`id`, m.`guest_id`, m.`guest_name`, m.`file_path`, m.`thumb_path`, m.`original_name`,
                m.`mime_type`, m.`file_size`, m.`media_type`, m.`likes_count`, m.`created_at`,
                (CASE WHEN m.`guest_id` = :current_guest_id THEN 1 ELSE 0 END) AS `is_owner`,
                (CASE WHEN ml.`id` IS NOT NULL THEN 1 ELSE 0 END) AS `has_liked`
            FROM `media` m
            LEFT JOIN `media_likes` ml ON (ml.`media_id` = m.`id` AND ml.`guest_token` = :current_guest_token)
            WHERE {$whereSql}
            ORDER BY {$orderBy}
            LIMIT :limit OFFSET :offset
        ";

        $stmt = $pdo->prepare($sql);
        foreach ($params as $k => $v) {
            $stmt->bindValue($k, $v);
        }
        $stmt->bindValue(':current_guest_id', $currentGuestId, PDO::PARAM_INT);
        $stmt->bindValue(':current_guest_token', $currentGuestToken, PDO::PARAM_STR);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return [
            'items' => $stmt->fetchAll(),
            'total' => $total,
        ];
    }

    public static function create(array $data): int {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('
            INSERT INTO `media` 
            (`guest_id`, `guest_name`, `file_path`, `thumb_path`, `original_name`, `mime_type`, `file_size`, `media_type`, `likes_count`, `is_approved`, `created_at`)
            VALUES 
            (:guest_id, :guest_name, :file_path, :thumb_path, :original_name, :mime_type, :file_size, :media_type, 0, 1, NOW())
        ');
        $stmt->execute([
            ':guest_id' => $data['guest_id'],
            ':guest_name' => $data['guest_name'],
            ':file_path' => $data['file_path'],
            ':thumb_path' => $data['thumb_path'] ?? null,
            ':original_name' => $data['original_name'],
            ':mime_type' => $data['mime_type'],
            ':file_size' => $data['file_size'],
            ':media_type' => $data['media_type'],
        ]);
        return (int) $pdo->lastInsertId();
    }

    public static function delete(int $id): bool {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('DELETE FROM `media` WHERE `id` = :id');
        return $stmt->execute([':id' => $id]);
    }
}
