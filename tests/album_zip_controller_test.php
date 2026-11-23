<?php
declare(strict_types=1);

namespace App\Config {
    // Isolated in-memory test DB. The application's real DB config is never loaded.
    class Database {
        public static function getConnection(): \PDO {
            $pdo = new \PDO('sqlite::memory:');
            $pdo->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
            $pdo->exec('CREATE TABLE media (id INTEGER, file_path TEXT, original_name TEXT, file_size INTEGER, media_type TEXT, is_approved INTEGER)');
            $insert = $pdo->prepare('INSERT INTO media VALUES (?, ?, ?, ?, ?, ?)');
            foreach ([1, 2] as $id) $insert->execute([$id, 'https://cdn.test.invalid/media/test' . $id . '.webp', 'foto.jpg', 4000, 'image', 1]);
            $insert->execute([3, 'https://cdn.test.invalid/media/private.webp', 'hidden.jpg', 4000, 'image', 0]);
            return $pdo;
        }
    }
}

namespace {
    use App\Controllers\ZipDownloadController;
    use App\Services\AlbumZipService;
    use App\Services\R2StorageService;
    use Symfony\Component\HttpClient\MockHttpClient;
    use Symfony\Component\HttpClient\Response\MockResponse;

    require __DIR__ . '/../vendor/autoload.php';

    if (($argv[1] ?? '') === '--request') {
        $root = $argv[2];
        session_save_path($root . '/sessions');
        session_id('ziptest' . substr(hash('sha256', $root), 0, 16));
        session_start();
        $_SESSION['admin_user'] = ($argv[5] ?? '') === 'admin' ? ['id' => 1] : null;
        $_SERVER['REQUEST_METHOD'] = $argv[4];
        $_SERVER['HTTP_X_REQUESTED_WITH'] = ($argv[6] ?? '') === 'csrf' ? '' : 'XMLHttpRequest';
        register_shutdown_function(static function () { fwrite(STDERR, '\nSTATUS:' . (http_response_code() ?: 200)); });
        $mock = new MockHttpClient(static function () use ($argv) {
            if (($argv[6] ?? '') === 'denied') return new MockResponse('<Error><Code>AccessDenied</Code></Error>', ['http_code' => 403]);
            return new MockResponse(str_repeat('test', 1000), ['http_code' => 200, 'response_headers' => ['content-type: image/webp', 'content-length: 4000']]);
        });
        (new \ReflectionProperty(R2StorageService::class, 'originalHttpClient'))->setValue(null, $mock);
        (new \ReflectionProperty(R2StorageService::class, 'config'))->setValue(null, ['bucket' => 'test-bucket', 'public_url' => 'https://cdn.test.invalid']);
        $input = json_decode($argv[3], true);
        if ($_SERVER['REQUEST_METHOD'] === 'GET') $_GET = $input;
        $controller = new class(new AlbumZipService($root . '/exports'), $input) extends ZipDownloadController {
            public function __construct(AlbumZipService $service, private array $input) { parent::__construct($service); }
            protected function getJsonInput(): array { return $this->input; }
        };
        $controller->download();
        exit;
    }

    function check(bool $value, string $message): void { if (!$value) throw new \RuntimeException($message); }
    $root = sys_get_temp_dir() . '/boda-controller-test-' . bin2hex(random_bytes(8));
    mkdir($root, 0700); mkdir($root . '/sessions', 0700);
    $call = static function (array $input, string $method = 'POST', string $auth = 'admin', string $mode = '') use ($root): array {
        $process = proc_open([PHP_BINARY, __FILE__, '--request', $root, json_encode($input), $method, $auth, $mode],
            [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes, null, null, ['bypass_shell' => true]);
        fclose($pipes[0]); $body = stream_get_contents($pipes[1]); fclose($pipes[1]);
        $stderr = stream_get_contents($pipes[2]); fclose($pipes[2]);
        $exit = proc_close($process);
        check($exit === 0, 'Controller process failed: ' . $stderr);
        preg_match('/STATUS:(\d+)/', $stderr, $matches);
        return ['status' => (int) ($matches[1] ?? 0), 'body' => $body, 'json' => json_decode($body, true)];
    };
    try {
        check($call(['action' => 'start'], 'POST', 'guest')['status'] === 401, 'Unauthenticated export allowed.');
        check($call(['action' => 'start'], 'POST', 'admin', 'csrf')['status'] === 403, 'Cross-site export allowed.');
        $response = $call(['action' => 'start']);
        check($response['status'] === 200 && $response['json']['total'] === 2, 'Start/snapshot failed.');
        $job = $response['json']['job'];
        $failed = $call(['action' => 'step', 'job' => $job, 'completed' => 0], 'POST', 'admin', 'denied');
        check($failed['status'] === 422 && str_contains($failed['json']['error'], 'HTTP 403'), 'Readable storage error failed.');
        check(!str_contains($failed['body'], 'r2.test.invalid'), 'SDK diagnostics leaked.');
        $first = $call(['action' => 'step', 'job' => $job, 'completed' => 0]);
        check($first['status'] === 200 && $first['json']['completed'] === 1, 'First real-source step failed.');
        $done = $call(['action' => 'step', 'job' => $job, 'completed' => 1]);
        check($done['status'] === 200 && $done['json']['ready'], 'Finalization failed.');
        $file = $call(['action' => 'file', 'job' => $job], 'GET');
        check(strlen($file['body']) === $done['json']['zip_bytes'], 'Binary download truncated.');
        file_put_contents($root . '/received.zip', $file['body']);
        $zip = new \ZipArchive();
        check($zip->open($root . '/received.zip', \ZipArchive::CHECKCONS) === true, 'Downloaded ZIP invalid.');
        check($zip->numFiles === 2 && $zip->getFromIndex(0) === str_repeat('test', 1000), 'Downloaded data changed.');
        $zip->close();
        check($call(['action' => 'release', 'job' => $job])['status'] === 200, 'Release failed.');
        check(!is_dir($root . '/exports/' . $job), 'Export was not released.');
        echo "PASS: complete controller start/step/file/release, public R2 HTTP mock, isolated SQLite, auth, CSRF, denied read and retry.\n";
    } finally {
        // Only fixture paths beneath our freshly generated test directory.
        foreach (glob($root . '/sessions/*') ?: [] as $path) unlink($path);
        if (is_file($root . '/received.zip')) unlink($root . '/received.zip');
        if (is_dir($root . '/exports')) {
            foreach (glob($root . '/exports/*', GLOB_ONLYDIR) ?: [] as $dir) {
                foreach (['state.json', 'state.tmp', 'lock', 'album.zip'] as $name) if (is_file($dir . '/' . $name)) unlink($dir . '/' . $name);
                rmdir($dir);
            }
            rmdir($root . '/exports');
        }
        rmdir($root . '/sessions'); rmdir($root);
    }
}
