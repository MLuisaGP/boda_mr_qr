<?php
declare(strict_types=1);

namespace App\Services;

use Throwable;

/** Incremental, uncompressed ZIP64. Each request copies one main media file. */
class AlbumZipService {
    public const TTL = 86400;
    private string $root;

    public function __construct(?string $root = null) {
        $this->root = $root ?? sys_get_temp_dir() . '/boda-album-' . substr(hash('sha256', dirname(__DIR__, 2)), 0, 16);
        if (!is_dir($this->root) && !mkdir($this->root, 0700, true) && !is_dir($this->root)) {
            throw new AlbumZipException('No hay espacio temporal disponible para preparar el álbum.');
        }
    }

    public function create(array $items, string $owner): array {
        $this->cleanupExpired();
        if (!$items) throw new AlbumZipException('Todavía no hay recuerdos para descargar.');
        $totalBytes = (int) array_sum(array_column($items, 'file_size'));
        $largest = (int) max(array_column($items, 'file_size'));
        $free = disk_free_space($this->root);
        if ($free !== false && $free < $totalBytes + $largest + count($items) * 512 + 10485760) {
            throw new AlbumZipException('El servidor no tiene espacio temporal suficiente para preparar todo el álbum.');
        }
        $job = bin2hex(random_bytes(16));
        $dir = $this->directory($job);
        if (!mkdir($dir, 0700)) throw new AlbumZipException('No se pudo preparar la descarga.');
        $state = ['job' => $job, 'owner' => $owner, 'items' => array_values($items), 'entries' => [],
            'completed' => 0, 'bytes' => 0, 'offset' => 0, 'ready' => false, 'updated' => time(),
            'total_bytes' => $totalBytes];
        $this->save($dir, $state);
        return $this->summary($state);
    }

    public function status(string $job, string $owner): array {
        return $this->summary($this->read($this->directory($job), $owner));
    }

    /** $openSource is injectable so tests never connect to a database or R2. */
    public function step(string $job, string $owner, int $expected, ?callable $openSource = null): array {
        $dir = $this->directory($job);
        if (!is_dir($dir)) throw new AlbumZipException('La descarga caducó. Vuelve a iniciarla.');
        $lock = fopen($dir . '/lock', 'c');
        if (!$lock || !flock($lock, LOCK_EX)) throw new AlbumZipException('La descarga está ocupada. Reintenta.');
        $output = null;
        $source = null;
        try {
            $state = $this->read($dir, $owner);
            // A retry after a lost response must not append the same item twice.
            if ($state['ready'] || $expected !== $state['completed']) return $this->summary($state);
            $item = $state['items'][$state['completed']];
            $required = max(0, (int) $item['file_size']) + 10485760;
            $free = disk_free_space($dir);
            if ($free !== false && $free < $required) throw new AlbumZipException('El servidor no tiene espacio temporal suficiente para el álbum.');
            $source = ($openSource ?? [$this, 'openSource'])($item);
            if (!is_resource($source)) throw new AlbumZipException('No se pudo leer uno de los recuerdos.');
            $output = fopen($dir . '/album.zip', 'c+b');
            if (!$output || !ftruncate($output, $state['offset']) || fseek($output, $state['offset']) !== 0) {
                throw new AlbumZipException('No se pudo continuar el ZIP.');
            }
            $name = self::entryName($item);
            // Data descriptor permits calculating CRC and size without buffering a video in RAM.
            $this->write($output, pack('VvvvvvVVVvv', 0x04034b50, 20, 0x0808, 0, 0, 33, 0, 0, 0, strlen($name), 0) . $name);
            $hash = hash_init('crc32b');
            $size = 0;
            while (!feof($source)) {
                $chunk = fread($source, 1048576);
                if ($chunk === false || ($chunk === '' && !feof($source))) throw new AlbumZipException('Se interrumpió la lectura de un recuerdo. Reintenta.');
                $size += strlen($chunk);
                if ($size > 0xfffffffe) throw new AlbumZipException('Uno de los archivos supera el tamaño admitido.');
                hash_update($hash, $chunk);
                $this->write($output, $chunk);
            }
            if ($size === 0 || $size !== (int) $item['file_size']) {
                throw new AlbumZipException('Un recuerdo está incompleto o cambió durante la exportación. No se generó un ZIP parcial.');
            }
            $crc = (int) hexdec(hash_final($hash));
            $this->write($output, pack('VVVV', 0x08074b50, $crc, $size, $size));
            $state['entries'][] = ['name' => $name, 'size' => $size, 'crc' => $crc, 'offset' => $state['offset']];
            $state['completed']++;
            $state['bytes'] += $size;
            $state['offset'] = ftell($output);
            if ($state['completed'] === count($state['items'])) {
                $this->finish($output, $state['entries']);
                $state['ready'] = true;
                $state['zip_bytes'] = ftell($output);
            }
            if (!fflush($output)) throw new AlbumZipException('No se pudo guardar el ZIP.');
            $state['updated'] = time();
            $this->save($dir, $state);
            return $this->summary($state);
        } finally {
            if (is_resource($source)) fclose($source);
            if (is_resource($output)) fclose($output);
            flock($lock, LOCK_UN);
            fclose($lock);
        }
    }

    /** Locks the completed archive for the duration of its download. */
    public function openDownload(string $job, string $owner): array {
        $dir = $this->directory($job);
        if (!is_dir($dir)) throw new AlbumZipException('La descarga caducó. Vuelve a iniciarla.');
        $lock = fopen($dir . '/lock', 'c');
        if (!$lock || !flock($lock, LOCK_SH)) throw new AlbumZipException('No se pudo abrir el ZIP.');
        try {
            $state = $this->read($dir, $owner);
            if (!$state['ready']) throw new AlbumZipException('El álbum todavía se está preparando.');
            $stream = fopen($dir . '/album.zip', 'rb');
            if (!$stream || fstat($stream)['size'] !== $state['zip_bytes']) {
                if (is_resource($stream)) fclose($stream);
                throw new AlbumZipException('El ZIP está incompleto. Vuelve a prepararlo.');
            }
            return ['stream' => $stream, 'lock' => $lock, 'size' => $state['zip_bytes']];
        } catch (Throwable $e) {
            flock($lock, LOCK_UN);
            fclose($lock);
            throw $e;
        }
    }

    public function remove(string $job, string $owner): void {
        $dir = $this->directory($job);
        $this->read($dir, $owner);
        $this->removeDirectory($dir);
    }

    private function openSource(array $item) {
        $path = (string) $item['file_path'];
        if (R2StorageService::isRemoteUrl($path)) {
            $key = R2StorageService::extractKeyFromUrl($path);
            if ($key === null) throw new AlbumZipException('No se encontró un archivo del álbum.');
            return R2StorageService::openOriginalStream($key);
        }
        // Legacy uploads only; never allow arbitrary local paths or thumbnail folders.
        $base = realpath(dirname(__DIR__, 2) . '/public/uploads');
        $file = realpath(dirname(__DIR__, 2) . '/public/' . ltrim($path, '/'));
        if (!$base || !$file || !str_starts_with($file, $base . DIRECTORY_SEPARATOR) || str_contains(str_replace('\\', '/', $file), '/thumbs/')) {
            throw new AlbumZipException('No se encontró un archivo del álbum.');
        }
        return fopen($file, 'rb');
    }

    public static function entryName(array $item): string {
        // Keep the stored extension: original_name may refer to a JPEG converted to WebP on upload.
        $ext = strtolower(pathinfo(parse_url((string) $item['file_path'], PHP_URL_PATH) ?: '', PATHINFO_EXTENSION));
        if (!preg_match('/^[a-z0-9]{1,8}$/', $ext)) $ext = $item['media_type'] === 'video' ? 'mp4' : 'webp';
        $stem = pathinfo(str_replace('\\', '/', (string) $item['original_name']), PATHINFO_FILENAME);
        $stem = preg_replace('/[^\pL\pN _-]+/u', '_', $stem) ?: 'recuerdo';
        $stem = mb_strcut($stem, 0, 120, 'UTF-8');
        return ($item['media_type'] === 'video' ? 'Videos/' : 'Fotos/') . (int) $item['id'] . '_' . $stem . '.' . $ext;
    }

    private function finish($stream, array $entries): void {
        $start = ftell($stream);
        foreach ($entries as $entry) {
            $large = $entry['offset'] >= 0xffffffff;
            $extra = $large ? pack('vv', 1, 8) . $this->uint64($entry['offset']) : '';
            $this->write($stream, pack('VvvvvvvVVVvvvvvVV', 0x02014b50, 45, $large ? 45 : 20, 0x0808, 0, 0, 33,
                $entry['crc'], $entry['size'], $entry['size'], strlen($entry['name']), strlen($extra), 0, 0, 0, 0,
                $large ? 0xffffffff : $entry['offset']) . $entry['name'] . $extra);
        }
        $length = ftell($stream) - $start;
        $end = ftell($stream);
        $count = count($entries);
        // ZIP64 end records keep archives above 4 GiB and 65,535 entries valid.
        $this->write($stream, pack('V', 0x06064b50) . $this->uint64(44) . pack('vvVV', 45, 45, 0, 0)
            . $this->uint64($count) . $this->uint64($count) . $this->uint64($length) . $this->uint64($start));
        $this->write($stream, pack('VV', 0x07064b50, 0) . $this->uint64($end) . pack('V', 1));
        $this->write($stream, pack('VvvvvVVv', 0x06054b50, 0, 0, min($count, 65535), min($count, 65535),
            min($length, 0xffffffff), min($start, 0xffffffff), 0));
    }

    private function uint64(int $value): string { return pack('V2', $value & 0xffffffff, $value >> 32); }

    private function write($stream, string $data): void {
        $length = strlen($data);
        for ($written = 0; $written < $length;) {
            $n = fwrite($stream, substr($data, $written));
            if ($n === false || $n === 0) throw new AlbumZipException('No hay espacio para completar el ZIP.');
            $written += $n;
        }
    }

    private function directory(string $job): string {
        if (!preg_match('/^[a-f0-9]{32}$/D', $job)) throw new AlbumZipException('Descarga no válida.');
        return $this->root . '/' . $job;
    }

    private function read(string $dir, string $owner): array {
        $raw = is_file($dir . '/state.json') ? file_get_contents($dir . '/state.json') : false;
        $state = $raw !== false ? json_decode($raw, true) : null;
        if (!is_array($state) || !hash_equals($state['owner'], $owner) || $state['updated'] < time() - self::TTL) {
            throw new AlbumZipException('La descarga caducó o no pertenece a tu sesión. Vuelve a iniciarla.');
        }
        return $state;
    }

    private function save(string $dir, array $state): void {
        $json = json_encode($state, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
        if (file_put_contents($dir . '/state.tmp', $json) !== strlen($json) || !rename($dir . '/state.tmp', $dir . '/state.json')) {
            throw new AlbumZipException('No se pudo guardar el progreso.');
        }
    }

    private function summary(array $state): array {
        return array_intersect_key($state, array_flip(['job', 'completed', 'bytes', 'total_bytes', 'ready', 'zip_bytes']))
            + ['total' => count($state['items']), 'filename' => 'Album_Michelle_y_Rene.zip'];
    }

    private function cleanupExpired(): void {
        clearstatcache();
        foreach (glob($this->root . '/*', GLOB_ONLYDIR) ?: [] as $dir) {
            $stamp = is_file($dir . '/state.json') ? filemtime($dir . '/state.json') : filemtime($dir);
            if (preg_match('/^[a-f0-9]{32}$/D', basename($dir)) && $stamp < time() - self::TTL) {
                $this->removeDirectory($dir);
            }
        }
    }

    private function removeDirectory(string $dir): void {
        $lock = fopen($dir . '/lock', 'c');
        if (!$lock || !flock($lock, LOCK_EX | LOCK_NB)) { if ($lock) fclose($lock); return; }
        foreach (['state.json', 'state.tmp', 'album.zip'] as $file) {
            if (is_file($dir . '/' . $file)) unlink($dir . '/' . $file);
        }
        flock($lock, LOCK_UN);
        fclose($lock);
        unlink($dir . '/lock');
        rmdir($dir);
    }
}
