<?php
declare(strict_types=1);

// Exercise the real source reader with the public R2 domain + mocked HTTP, never real R2.
require __DIR__ . '/../vendor/autoload.php';

use App\Services\AlbumZipService;
use App\Services\R2StorageService;
use Symfony\Component\HttpClient\MockHttpClient;
use Symfony\Component\HttpClient\Response\MockResponse;

$body = random_bytes(440163);
$requests = 0;
$mock = new MockHttpClient(function ($method, $url, $options) use ($body, &$requests) {
    $requests++;
    if ($method !== 'GET' || $url !== 'https://cdn.test.invalid/media/test.webp') throw new RuntimeException('Unexpected S3 request.');
    if (($options['max_redirects'] ?? null) !== 0) throw new RuntimeException('Redirects must be disabled.');
    if (isset($options['normalized_headers']['authorization']) || str_contains($url, 'X-Amz-')) throw new RuntimeException('Public export must not sign requests or forward credentials.');
    return new MockResponse($body, ['http_code' => 200, 'response_headers' => [
        'content-type: image/webp', 'content-length: ' . strlen($body),
    ]]);
});
$clientProperty = new ReflectionProperty(R2StorageService::class, 'originalHttpClient');
$configProperty = new ReflectionProperty(R2StorageService::class, 'config');
$clientProperty->setValue(null, $mock);
$configProperty->setValue(null, ['bucket' => 'test-bucket', 'public_url' => 'https://cdn.test.invalid']);
$root = sys_get_temp_dir() . '/boda-zip-r2-test-' . bin2hex(random_bytes(8));
$service = new AlbumZipService($root);
$state = $service->create([['id' => 1, 'file_path' => 'https://cdn.test.invalid/media/test.webp',
    'original_name' => 'test.jpg', 'file_size' => strlen($body), 'media_type' => 'image']], 'test');
try {
    $state = $service->step($state['job'], 'test', 0);
    if (!$state['ready'] || $requests !== 1) throw new RuntimeException('S3 export did not finish.');
    $zip = new ZipArchive();
    if ($zip->open($root . '/' . $state['job'] . '/album.zip', ZipArchive::CHECKCONS) !== true) throw new RuntimeException('Invalid ZIP.');
    if (hash('sha256', $zip->getFromIndex(0)) !== hash('sha256', $body)) throw new RuntimeException('Corrupted S3 media.');
    $zip->close();
    echo "PASS: public R2 source reader without signed requests, mocked HTTP GET, original bytes and valid ZIP.\n";
} finally {
    $service->remove($state['job'], 'test');
    rmdir($root);
    $clientProperty->setValue(null, null);
    $configProperty->setValue(null, null);
}
