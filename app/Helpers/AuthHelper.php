<?php
/**
 * Authentication and Session helper.
 */

declare(strict_types=1);

namespace App\Helpers;

use App\Config\Database;
use PDO;

class AuthHelper {
    public static function startSession(): void {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    public static function getGuestToken(): ?string {
        self::startSession();

        // 1. Check $_SERVER for X-Guest-Token
        if (!empty($_SERVER['HTTP_X_GUEST_TOKEN'])) {
            return trim($_SERVER['HTTP_X_GUEST_TOKEN']);
        }

        // 2. Check getallheaders if available
        if (function_exists('getallheaders')) {
            $headers = getallheaders();
            foreach ($headers as $key => $val) {
                if (strcasecmp($key, 'X-Guest-Token') === 0 && !empty($val)) {
                    return trim($val);
                }
            }
        }

        // 2. Check Cookie
        if (!empty($_COOKIE['guest_token'])) {
            return trim($_COOKIE['guest_token']);
        }

        // 3. Check Session
        if (!empty($_SESSION['guest_token'])) {
            return trim($_SESSION['guest_token']);
        }

        return null;
    }

    public static function getGuest(?PDO $pdo = null): ?array {
        $token = self::getGuestToken();
        if (!$token) {
            return null;
        }

        $pdo = $pdo ?? Database::getConnection();
        $stmt = $pdo->prepare('SELECT * FROM `guests` WHERE `token` = :token LIMIT 1');
        $stmt->execute([':token' => $token]);
        $guest = $stmt->fetch();

        if ($guest) {
            $upd = $pdo->prepare('UPDATE `guests` SET `last_active_at` = NOW() WHERE `id` = :id');
            $upd->execute([':id' => $guest['id']]);
        }

        return $guest ?: null;
    }

    public static function getAdminUser(): ?array {
        self::startSession();
        return $_SESSION['admin_user'] ?? null;
    }

    public static function requireAdmin(): array {
        $admin = self::getAdminUser();
        if (!$admin) {
            Response::error('Acceso no autorizado. Inicia sesión como administrador o novios.', 401);
        }
        return $admin;
    }
}
