<?php
/**
 * Database connection handler for Boda Michelle & René.
 * Conexión centralizada vía PDO con soporte para charset utf8mb4 y componentes Illuminate.
 */

declare(strict_types=1);

namespace App\Config;

use PDO;
use PDOException;

class Database {
    private static ?PDO $instance = null;

    public static function getConnection(): PDO {
        if (self::$instance !== null) {
            return self::$instance;
        }

        $env = self::loadEnv();
        $host = $env['DB_HOST'] ?? 'sh00010.hostgator.mx';
        $port = $env['DB_PORT'] ?? '3306';
        $dbname = $env['DB_DATABASE'] ?? 'feffbmis_boda_michellerene';
        $user = $env['DB_USERNAME'] ?? 'feffbmis_boda_rene';
        $pass = $env['DB_PASSWORD'] ?? 'bfyDEMv#-69h02_Q';

        $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_TIMEOUT => 15,
        ];

        try {
            self::$instance = new PDO($dsn, $user, $pass, $options);
            return self::$instance;
        } catch (PDOException $e) {
            error_log('Database Connection Error: ' . $e->getMessage());
            http_response_code(500);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'success' => false,
                'error' => 'No fue posible conectar con la base de datos.',
                'details' => (isset($env['APP_ENV']) && $env['APP_ENV'] === 'development') ? $e->getMessage() : null
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    public static function loadEnv(): array {
        static $cachedEnv = null;
        if ($cachedEnv !== null) {
            return $cachedEnv;
        }

        $cachedEnv = [];
        $candidates = [
            dirname(__DIR__) . '/.env',
            dirname(__DIR__, 2) . '/.env',
            dirname(__DIR__, 3) . '/.env',
            __DIR__ . '/.env',
        ];

        $envPath = null;
        foreach ($candidates as $candidate) {
            if (file_exists($candidate)) {
                $envPath = $candidate;
                break;
            }
        }

        if ($envPath && file_exists($envPath)) {
            $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                $line = trim($line);
                if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
                    continue;
                }
                [$key, $value] = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);
                if ((str_starts_with($value, '"') && str_ends_with($value, '"')) ||
                    (str_starts_with($value, "'") && str_ends_with($value, "'"))) {
                    $value = substr($value, 1, -1);
                }
                $cachedEnv[$key] = $value;
            }
        }

        return $cachedEnv;
    }
}
