<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Helpers\AuthHelper;
use App\Helpers\Response;
use App\Config\Database;
use App\Services\AlbumZipService;
use PDO;
use App\Services\AlbumZipException;
use Throwable;

class ZipDownloadController extends Controller {
    public function __construct(private ?AlbumZipService $zipService = null) {}

    public function download(): void {
        AuthHelper::requireAdmin();
        header('Cache-Control: no-store, private');
        header('X-Content-Type-Options: nosniff');
        $owner = hash('sha256', session_id());
        $post = ($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST';
        if ($post && ($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') !== 'XMLHttpRequest') {
            Response::error('Solicitud no válida.', 403);
        }
        $input = $post ? $this->getJsonInput() : $_GET;
        $action = (string) ($input['action'] ?? '');
        $job = (string) ($input['job'] ?? '');
        try {
            if (PHP_INT_SIZE < 8) throw new AlbumZipException('El servidor necesita PHP de 64 bits para exportar el álbum.');
            $service = $this->zipService ?? new AlbumZipService();
            if ($post && $action === 'start') {
                $state = null;
                if (!empty($_SESSION['album_zip_job'])) {
                    try { $state = $service->status($_SESSION['album_zip_job'], $owner); }
                    catch (AlbumZipException $e) { /* Expired jobs can be replaced. */ }
                }
                if ($state === null) {
                    // Entire published album, independent of UI filters and pagination.
                    $items = Database::getConnection()->query(
                        'SELECT id, file_path, original_name, file_size, media_type FROM media WHERE is_approved = 1 ORDER BY id ASC'
                    )->fetchAll(PDO::FETCH_ASSOC);
                    $state = $service->create($items, $owner);
                    $_SESSION['album_zip_job'] = $state['job'];
                }
                session_write_close();
                Response::json(['success' => true] + $state);
            }
            if ($post && $action === 'release' && ($_SESSION['album_zip_job'] ?? '') === $job) {
                unset($_SESSION['album_zip_job']);
            }
            session_write_close(); // Let other admin requests proceed during the export.
            if ($post && $action === 'step') {
                @set_time_limit(120);
                Response::json(['success' => true] + $service->step($job, $owner, (int) ($input['completed'] ?? -1)));
            }
            if ($post && $action === 'release') {
                $service->remove($job, $owner);
                Response::json(['success' => true]);
            }
            if (!$post && $action === 'file') {
                $download = $service->openDownload($job, $owner);
                while (ob_get_level()) ob_end_clean();
                @ini_set('zlib.output_compression', '0');
                @set_time_limit(0);
                header('Content-Type: application/zip');
                header('Content-Disposition: attachment; filename="Album_Michelle_y_Rene.zip"');
                header('Content-Length: ' . $download['size']);
                header('X-Accel-Buffering: no');
                try {
                    while (!feof($download['stream']) && !connection_aborted()) {
                        $chunk = fread($download['stream'], 1048576);
                        if ($chunk === false) break;
                        echo $chunk;
                        flush();
                    }
                } finally {
                    fclose($download['stream']);
                    flock($download['lock'], LOCK_UN);
                    fclose($download['lock']);
                }
                exit;
            }
            Response::error('Operación de descarga no válida.', 400);
        } catch (AlbumZipException $e) {
            if (session_status() === PHP_SESSION_ACTIVE) session_write_close();
            Response::error($e->getMessage(), 422);
        } catch (Throwable $e) {
            if (session_status() === PHP_SESSION_ACTIVE) session_write_close();
            // Safe diagnostic: no exception message, SQL, credentials or signed URLs.
            $reference = bin2hex(random_bytes(4));
            $diagnostic = sprintf('Album ZIP [%s] action=%s type=%s source=%s:%d code=%s',
                $reference, preg_replace('/[^a-z]/', '', $action), get_class($e),
                basename($e->getFile()), $e->getLine(), preg_replace('/[^A-Za-z0-9_-]/', '', (string) $e->getCode()));
            error_log($diagnostic);
            // Built-in PHP servers may have no readable stderr log. Keep the same safe record locally.
            $diagnosticFile = sys_get_temp_dir() . '/boda-zip-diagnostics-' . substr(hash('sha256', dirname(__DIR__, 2)), 0, 16) . '.log';
            @file_put_contents($diagnosticFile, $diagnostic . PHP_EOL, FILE_APPEND | LOCK_EX);
            @chmod($diagnosticFile, 0600);
            Response::error('No se pudo preparar el álbum. Reintenta en unos momentos.', 500,
                ['reference' => $reference, 'stage' => $action]);
        }
    }
}
