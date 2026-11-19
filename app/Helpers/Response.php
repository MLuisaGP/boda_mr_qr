<?php
/**
 * Response Helper for JSON responses and Clean Code Early Returns.
 */

declare(strict_types=1);

namespace App\Helpers;

class Response {
    public static function json(array $data, int $statusCode = 200): void {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function success(string $message, array $data = [], int $statusCode = 200): void {
        self::json(array_merge([
            'success' => true,
            'message' => $message,
        ], $data), $statusCode);
    }

    public static function error(string $message, int $statusCode = 400, array $extra = []): void {
        self::json(array_merge([
            'success' => false,
            'error' => $message,
        ], $extra), $statusCode);
    }
}
