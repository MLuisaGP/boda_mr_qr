<?php
/**
 * R2StorageService: Integración ligera con Cloudflare R2 (API S3 compatible) vía async-aws/s3.
 * Diseñada para hosting compartido (HostGator):
 *  - Genera Presigned PUT URLs para subida directa navegador -> Cloudflare R2.
 *  - Verifica objetos subidos (HeadObject) antes de persistir en MySQL.
 *  - Elimina objetos principales y thumbnails de R2.
 */

declare(strict_types=1);

namespace App\Services;

use App\Config\Database;
use AsyncAws\Core\Exception\Http\ClientException;
use AsyncAws\S3\Input\DeleteObjectRequest;
use AsyncAws\S3\Input\HeadObjectRequest;
use AsyncAws\S3\Input\PutObjectRequest;
use AsyncAws\S3\S3Client;
use DateTimeImmutable;
use RuntimeException;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Throwable;

class R2StorageService {
    private static ?S3Client $client = null;
    private static ?array $config = null;
    private static ?HttpClientInterface $originalHttpClient = null;

    public static function getConfig(): array {
        if (self::$config !== null) {
            return self::$config;
        }

        $env = Database::loadEnv();
        $get = static function (string ...$keys) use ($env): string {
            foreach ($keys as $key) {
                if (isset($env[$key]) && trim((string) $env[$key]) !== '') {
                    return trim((string) $env[$key]);
                }
                if (isset($_ENV[$key]) && trim((string) $_ENV[$key]) !== '') {
                    return trim((string) $_ENV[$key]);
                }
                $val = getenv($key);
                if ($val !== false && trim((string) $val) !== '') {
                    return trim((string) $val);
                }
            }
            return '';
        };

        $accountId = $get('R2_ACCOUNT_ID');
        $endpoint = $get('R2_ENDPOINT');
        if ($endpoint === '' && $accountId !== '') {
            $endpoint = "https://{$accountId}.r2.cloudflarestorage.com";
        }
        if ($endpoint !== '' && !preg_match('#^https?://#i', $endpoint)) {
            $endpoint = 'https://' . $endpoint;
        }
        $endpoint = rtrim($endpoint, '/');

        $publicUrl = $get('R2_PUBLIC_URL', 'R2_PUBLIC_DOMAIN', 'R2_URL');
        if ($publicUrl !== '' && !preg_match('#^https?://#i', $publicUrl)) {
            $publicUrl = 'https://' . $publicUrl;
        }
        $publicUrl = rtrim($publicUrl, '/');

        self::$config = [
            'account_id' => $accountId,
            'endpoint' => $endpoint,
            'access_key_id' => $get('R2_ACCESS_KEY_ID', 'R2_ACCESS_KEY'),
            'secret_access_key' => $get('R2_SECRET_ACCESS_KEY', 'R2_SECRET_KEY'),
            'bucket' => $get('R2_BUCKET', 'R2_BUCKET_NAME'),
            'public_url' => $publicUrl,
            'db_pass_salt' => $get('DB_PASSWORD'),
        ];

        return self::$config;
    }

    public static function isConfigured(): bool {
        $cfg = self::getConfig();
        return $cfg['endpoint'] !== ''
            && $cfg['access_key_id'] !== ''
            && $cfg['secret_access_key'] !== ''
            && $cfg['bucket'] !== ''
            && $cfg['public_url'] !== '';
    }

    public static function getPublicConnectionInfo(): array {
        $cfg = self::getConfig();
        $host = $cfg['endpoint'] !== '' ? (parse_url($cfg['endpoint'], PHP_URL_HOST) ?: '') : '';

        return [
            'configured' => self::isConfigured(),
            'endpoint' => $cfg['endpoint'],
            'host' => $host,
            'bucket' => $cfg['bucket'],
            'public_url' => $cfg['public_url'],
            'media_prefix' => 'media/',
            'thumbs_prefix' => 'thumbs/',
        ];
    }

    private static function getClient(): S3Client {
        if (self::$client !== null) {
            return self::$client;
        }

        if (!self::isConfigured()) {
            throw new RuntimeException(
                'Cloudflare R2 no está configurado. Verifica R2_ACCOUNT_ID (o R2_ENDPOINT), R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET y R2_PUBLIC_URL en .env.'
            );
        }

        $cfg = self::getConfig();
        self::$client = new S3Client([
            'endpoint' => $cfg['endpoint'],
            'region' => 'auto',
            'accessKeyId' => $cfg['access_key_id'],
            'accessKeySecret' => $cfg['secret_access_key'],
            'pathStyleEndpoint' => true,
        ]);

        return self::$client;
    }

    public static function buildObjectKeys(string $guestName, string $mainExt, string $thumbExt): array {
        $cleanGuest = self::sanitizeGuestSlug($guestName);
        $stamp = date('Ymd_His');
        $rand = bin2hex(random_bytes(4));
        $baseName = "{$stamp}_{$cleanGuest}_{$rand}";

        return [
            'main_key' => "media/{$baseName}.{$mainExt}",
            'thumb_key' => "thumbs/{$baseName}_thumb.{$thumbExt}",
        ];
    }

    private static function sanitizeGuestSlug(string $guestName): string {
        $slug = trim($guestName);
        $slug = strtr($slug, [
            'á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o', 'ú' => 'u', 'ü' => 'u', 'ñ' => 'n',
            'Á' => 'A', 'É' => 'E', 'Í' => 'I', 'Ó' => 'O', 'Ú' => 'U', 'Ü' => 'U', 'Ñ' => 'N',
        ]);
        if (function_exists('iconv')) {
            $converted = @iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $slug);
            if ($converted !== false && $converted !== '') {
                $slug = str_replace(["'", '"', '`', '^', '~'], '', $converted);
            }
        }
        $slug = preg_replace('/[^a-zA-Z0-9]+/', '_', $slug) ?? '';
        $slug = trim($slug, '_');
        if ($slug === '') {
            $slug = 'Invitado';
        }
        return substr($slug, 0, 32);
    }

    public static function createPresignedPutUrl(
        string $key,
        string $contentType,
        int $contentLength,
        int $ttlSeconds = 600
    ): string {
        $cfg = self::getConfig();
        $client = self::getClient();

        $request = new PutObjectRequest([
            'Bucket' => $cfg['bucket'],
            'Key' => ltrim($key, '/'),
            'ContentType' => $contentType,
            'ContentLength' => $contentLength,
            'CacheControl' => 'public, max-age=31536000, immutable',
        ]);

        return $client->presign($request, new DateTimeImmutable("+{$ttlSeconds} seconds"));
    }

    public static function headObject(string $key): ?array {
        $cfg = self::getConfig();
        $client = self::getClient();

        try {
            $result = $client->headObject(new HeadObjectRequest([
                'Bucket' => $cfg['bucket'],
                'Key' => ltrim($key, '/'),
            ]));

            return [
                'size' => (int) ($result->getContentLength() ?? 0),
                'content_type' => (string) ($result->getContentType() ?? ''),
                'etag' => trim((string) ($result->getETag() ?? ''), '"'),
            ];
        } catch (ClientException $e) {
            if ($e->getCode() === 404) {
                return null;
            }
            error_log('R2 HeadObject Error: ' . $e->getMessage());
            return null;
        } catch (Throwable $e) {
            error_log('R2 HeadObject Error: ' . $e->getMessage());
            return null;
        }
    }

    /** @return resource Main object only; credentials never leave the server. */
    public static function openOriginalStream(string $key) {
        if (!str_starts_with($key, 'media/') || str_contains($key, '..')) {
            throw new AlbumZipException('Ruta de recuerdo no válida.');
        }
        // The gallery already serves these main objects from the configured public domain.
        // Read that same object without SigV4: export must not depend on the host's clock.
        // Build from trusted configuration, never fetch an arbitrary database URL or redirect.
        $url = self::buildPublicUrl($key);
        if (strtolower((string) parse_url($url, PHP_URL_SCHEME)) !== 'https') {
            throw new AlbumZipException('La descarga del álbum necesita una conexión HTTPS al almacenamiento.');
        }
        $client = self::$originalHttpClient ??= HttpClient::create();
        $response = $client->request('GET', $url, [
            'timeout' => 20, 'max_duration' => 90, 'max_redirects' => 0,
            'headers' => ['Accept-Encoding' => 'identity'],
        ]);
        $stream = null;
        try {
            $status = $response->getStatusCode();
            if ($status !== 200) {
                throw new AlbumZipException('No se pudo leer uno de los recuerdos del almacenamiento (HTTP ' . $status . '). Reintenta la descarga.');
            }
            $stream = fopen('php://temp/maxmemory:2097152', 'w+b');
            if ($stream === false) throw new AlbumZipException('No se pudo abrir el archivo temporal del recuerdo.');
            foreach ($client->stream($response) as $chunk) {
                if ($chunk->isTimeout()) throw new AlbumZipException('La lectura de un recuerdo tardó demasiado. Reintenta la descarga.');
                $data = $chunk->getContent();
                for ($written = 0, $length = strlen($data); $written < $length;) {
                    $count = fwrite($stream, substr($data, $written));
                    if ($count === false || $count === 0) throw new AlbumZipException('No hay espacio temporal suficiente para leer el recuerdo.');
                    $written += $count;
                }
            }
            rewind($stream);
            return $stream;
        } catch (Throwable $e) {
            if (is_resource($stream)) fclose($stream);
            throw $e;
        } finally {
            $response->cancel();
        }
    }

    public static function deleteObject(string $key): bool {
        $cleanKey = ltrim(trim($key), '/');
        if ($cleanKey === '' || !self::isConfigured()) {
            return false;
        }

        try {
            $cfg = self::getConfig();
            $client = self::getClient();
            $result = $client->deleteObject(new DeleteObjectRequest([
                'Bucket' => $cfg['bucket'],
                'Key' => $cleanKey,
            ]));
            $result->resolve();
            return true;
        } catch (Throwable $e) {
            error_log('R2 DeleteObject Error (' . $cleanKey . '): ' . $e->getMessage());
            return false;
        }
    }

    public static function deleteByUrl(?string $url): bool {
        $key = self::extractKeyFromUrl($url);
        if ($key === null) {
            return false;
        }
        return self::deleteObject($key);
    }

    public static function extractKeyFromUrl(?string $url): ?string {
        if ($url === null || trim($url) === '' || !self::isRemoteUrl($url)) {
            return null;
        }

        $trimmed = trim($url);
        $publicUrl = self::getConfig()['public_url'];

        if ($publicUrl !== '' && str_starts_with($trimmed, $publicUrl . '/')) {
            $key = substr($trimmed, strlen($publicUrl) + 1);
            $key = explode('?', $key, 2)[0];
            $key = rawurldecode(ltrim($key, '/'));
            return $key !== '' ? $key : null;
        }

        $path = parse_url($trimmed, PHP_URL_PATH);
        if (!is_string($path) || $path === '' || $path === '/') {
            return null;
        }

        $key = rawurldecode(ltrim($path, '/'));
        return $key !== '' ? $key : null;
    }

    public static function buildPublicUrl(string $key): string {
        $publicUrl = self::getConfig()['public_url'];
        if ($publicUrl === '') {
            throw new RuntimeException('R2_PUBLIC_URL no está configurado.');
        }

        $segments = array_map('rawurlencode', explode('/', ltrim($key, '/')));
        return $publicUrl . '/' . implode('/', $segments);
    }

    public static function isRemoteUrl(?string $path): bool {
        if ($path === null || $path === '') {
            return false;
        }
        return (bool) preg_match('#^https?://#i', trim($path));
    }

    private static function getSigningSecret(): string {
        $cfg = self::getConfig();
        return hash('sha256', 'boda_mr_r2_v1|' . $cfg['secret_access_key'] . '|' . $cfg['db_pass_salt'], true);
    }

    public static function signUploadToken(array $payload, int $ttlSeconds = 900): string {
        $payload['exp'] = time() + $ttlSeconds;
        $json = json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        if ($json === false) {
            throw new RuntimeException('No se pudo codificar el token de subida.');
        }
        $encoded = rtrim(strtr(base64_encode($json), '+/', '-_'), '=');
        $sig = hash_hmac('sha256', $encoded, self::getSigningSecret());
        return $encoded . '.' . $sig;
    }

    public static function verifyUploadToken(string $token): ?array {
        $parts = explode('.', trim($token), 2);
        if (count($parts) !== 2) {
            return null;
        }

        [$encoded, $sig] = $parts;
        $expected = hash_hmac('sha256', $encoded, self::getSigningSecret());
        if (!hash_equals($expected, $sig)) {
            return null;
        }

        $padded = strtr($encoded, '-_', '+/');
        $mod = strlen($padded) % 4;
        if ($mod > 0) {
            $padded .= str_repeat('=', 4 - $mod);
        }

        $decoded = base64_decode($padded, true);
        if ($decoded === false) {
            return null;
        }

        $payload = json_decode($decoded, true);
        if (!is_array($payload)) {
            return null;
        }

        if (!isset($payload['exp']) || (int) $payload['exp'] < time()) {
            return null;
        }

        return $payload;
    }
}
