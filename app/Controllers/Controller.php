<?php
/**
 * Base Controller for MVC architecture.
 */

declare(strict_types=1);

namespace App\Controllers;

abstract class Controller {
    protected function renderView(string $view, array $data = []): void {
        extract($data);
        $viewFile = dirname(__DIR__, 2) . '/views/' . $view . '.php';

        if (!file_exists($viewFile)) {
            http_response_code(500);
            echo "Vista no encontrada: {$view}";
            exit;
        }

        require $viewFile;
        exit;
    }

    protected function getJsonInput(): array {
        $raw = file_get_contents('php://input');
        $json = json_decode($raw, true);
        return is_array($json) ? $json : [];
    }
}
