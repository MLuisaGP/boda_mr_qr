<?php
/**
 * Guestbook Model.
 */

declare(strict_types=1);

namespace App\Models;

use App\Config\Database;
use PDO;

class Guestbook {
    public static function listVisible(int $limit = 100): array {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('
            SELECT `id`, `guest_id`, `guest_name`, `message`, `created_at`
            FROM `guestbook`
            WHERE `is_visible` = 1
            ORDER BY `id` DESC
            LIMIT :lim
        ');
        $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public static function create(?int $guestId, string $guestName, string $message): int {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('
            INSERT INTO `guestbook` (`guest_id`, `guest_name`, `message`, `is_visible`, `created_at`)
            VALUES (:guest_id, :guest_name, :message, 1, NOW())
        ');
        $stmt->execute([
            ':guest_id' => $guestId,
            ':guest_name' => $guestName,
            ':message' => $message,
        ]);
        return (int) $pdo->lastInsertId();
    }

    public static function delete(int $id): bool {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('DELETE FROM `guestbook` WHERE `id` = :id');
        return $stmt->execute([':id' => $id]);
    }
}
