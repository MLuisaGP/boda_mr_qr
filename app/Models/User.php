<?php
/**
 * User Model (Administrators & Couple).
 */

declare(strict_types=1);

namespace App\Models;

use App\Config\Database;
use PDO;

class User {
    public static function findByUsername(string $username): ?array {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('SELECT * FROM `users` WHERE `username` = :username LIMIT 1');
        $stmt->execute([':username' => $username]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function verifyCredentials(string $username, string $password): ?array {
        $user = self::findByUsername($username);
        if (!$user) {
            return null;
        }
        if (!password_verify($password, $user['password_hash'])) {
            return null;
        }
        return [
            'id' => (int) $user['id'],
            'username' => $user['username'],
            'full_name' => $user['full_name'],
            'role' => $user['role'],
        ];
    }
}
