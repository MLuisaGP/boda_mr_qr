<?php
/**
 * Bootstrap file for Boda Michelle & René (HostGator shared hosting).
 * Carga autoload de Composer si existe, o autoload PSR-4 nativo de respaldo.
 */

declare(strict_types=1);

$vendorAutoload = __DIR__ . '/vendor/autoload.php';
if (file_exists($vendorAutoload)) {
    require_once $vendorAutoload;
} else {
    // PSR-4 Autoloader fallback when vendor is not yet installed
    spl_autoload_register(function ($class) {
        $prefix = 'App\\';
        $baseDir = __DIR__ . '/app/';

        $len = strlen($prefix);
        if (strncmp($prefix, $class, $len) !== 0) {
            return;
        }

        $relativeClass = substr($class, $len);
        $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';

        if (file_exists($file)) {
            require_once $file;
        }
    });

    require_once __DIR__ . '/app/Config/Database.php';
    require_once __DIR__ . '/app/Helpers/Response.php';
    require_once __DIR__ . '/app/Helpers/AuthHelper.php';
}

// Global class aliases for backwards compatibility
if (!class_exists('Database')) {
    class_alias(App\Config\Database::class, 'Database');
}
if (!class_exists('Response')) {
    class_alias(App\Helpers\Response::class, 'Response');
}
if (!class_exists('AuthHelper')) {
    class_alias(App\Helpers\AuthHelper::class, 'AuthHelper');
}
