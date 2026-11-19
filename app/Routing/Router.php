<?php
/**
 * Clean MVC Router for HostGator Shared Hosting.
 * Resuelve rutas semánticas (/, /admin, /api/...) sin exponer extensiones .php.
 */

declare(strict_types=1);

namespace App\Routing;

use App\Helpers\Response;

class Router {
    private array $routes = [];

    public function get(string $path, callable|array $handler): self {
        return $this->addRoute('GET', $path, $handler);
    }

    public function post(string $path, callable|array $handler): self {
        return $this->addRoute('POST', $path, $handler);
    }

    public function delete(string $path, callable|array $handler): self {
        return $this->addRoute('DELETE', $path, $handler);
    }

    public function any(string $path, callable|array $handler): self {
        return $this->addRoute('*', $path, $handler);
    }

    private function addRoute(string $method, string $path, callable|array $handler): self {
        $path = '/' . trim($path, '/');
        if ($path === '//') {
            $path = '/';
        }
        $this->routes[] = [
            'method' => strtoupper($method),
            'path' => $path,
            'handler' => $handler,
        ];
        return $this;
    }

    public function dispatch(): void {
        $requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        // Soporte para spoofing de método HTTP (DELETE vía _method o POST action)
        if ($requestMethod === 'POST' && isset($_POST['_method'])) {
            $requestMethod = strtoupper($_POST['_method']);
        }

        $requestUri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
        
        // Normalizar URI eliminando el script base si corre en subdirectorio (ej. /src/public/)
        $scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
        $baseDir = dirname($scriptName);
        if ($baseDir !== '/' && str_starts_with($requestUri, $baseDir)) {
            $requestUri = substr($requestUri, strlen($baseDir));
        }

        $requestUri = '/' . trim($requestUri, '/');
        if ($requestUri === '//') {
            $requestUri = '/';
        }

        foreach ($this->routes as $route) {
            if ($route['method'] !== '*' && $route['method'] !== $requestMethod) {
                continue;
            }

            $pattern = preg_replace('/\{([a-zA-Z0-9_]+)\}/', '(?P<$1>[^/]+)', $route['path']);
            $pattern = '#^' . $pattern . '$#i';

            if (preg_match($pattern, $requestUri, $matches)) {
                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
                $this->executeHandler($route['handler'], $params);
                return;
            }
        }

        // Si es una ruta de API, retornar error JSON
        if (str_starts_with($requestUri, '/api')) {
            Response::error('Ruta de API no encontrada: ' . $requestUri, 404);
        }

        // Si es una vista web, 404 HTTP
        http_response_code(404);
        echo '<!DOCTYPE html><html><head><meta charset="utf-8"><title>404 - Página no encontrada</title><style>body{background:#FAF7F2;color:#4A1525;font-family:sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;}div{text-align:center;padding:30px;}h1{font-size:3rem;margin:0 0 10px;}a{color:#C9A050;text-decoration:none;font-weight:bold;}</style></head><body><div><h1>404</h1><p>La página que buscas no existe.</p><p><a href="/">← Volver a la Boda de Michelle & René</a></p></div></body></html>';
        exit;
    }

    private function executeHandler(callable|array $handler, array $params = []): void {
        if (is_array($handler)) {
            [$class, $method] = $handler;
            $controller = new $class();
            call_user_func_array([$controller, $method], array_values($params));
            return;
        }

        call_user_func_array($handler, array_values($params));
    }
}
