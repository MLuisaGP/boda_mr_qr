<?php
/**
 * Guest Model.
 */

declare(strict_types=1);

namespace App\Models;

use App\Config\Database;
use PDO;

class Guest {
    public const MAX_ITEMS = 25;

    public static function findByToken(string $token): ?array {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('SELECT * FROM `guests` WHERE `token` = :token LIMIT 1');
        $stmt->execute([':token' => $token]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function createOrUpdate(string $name, ?string $token = null): array {
        $pdo = Database::getConnection();
        $guest = $token ? self::findByToken($token) : null;

        if ($guest) {
            $upd = $pdo->prepare('UPDATE `guests` SET `name` = :name, `last_active_at` = NOW() WHERE `id` = :id');
            $upd->execute([':name' => $name, ':id' => $guest['id']]);
            $guest['name'] = $name;
            return $guest;
        }

        $newToken = bin2hex(random_bytes(32));
        $stmt = $pdo->prepare('INSERT INTO `guests` (`name`, `token`, `item_count`, `created_at`, `last_active_at`) VALUES (:name, :token, 0, NOW(), NOW())');
        $stmt->execute([':name' => $name, ':token' => $newToken]);
        $id = (int) $pdo->lastInsertId();

        return [
            'id' => $id,
            'name' => $name,
            'token' => $newToken,
            'item_count' => 0,
        ];
    }

    public static function getItemCount(int $guestId): int {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('SELECT COUNT(*) FROM `media` WHERE `guest_id` = :gid');
        $stmt->execute([':gid' => $guestId]);
        return (int) $stmt->fetchColumn();
    }
}
