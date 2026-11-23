<?php
declare(strict_types=1);

// Standalone integration test: synthetic streams, no bootstrap, database, or R2.
require __DIR__ . '/../app/Services/AlbumZipException.php';
require __DIR__ . '/../app/Services/AlbumZipService.php';

use App\Services\AlbumZipException;
use App\Services\AlbumZipService;

function check(bool $condition, string $message): void {
    if (!$condition) throw new RuntimeException($message);
}
function denied(callable $fn, string $message): void {
    try { $fn(); } catch (AlbumZipException $e) { return; }
    throw new RuntimeException($message);
}
function stream(string $bytes) {
    $stream = fopen('php://temp', 'w+b');
    fwrite($stream, $bytes);
    rewind($stream);
    return $stream;
}

$root = sys_get_temp_dir() . '/boda-zip-test-' . bin2hex(random_bytes(8));
$service = new AlbumZipService($root);
$owner = hash('sha256', 'test-owner');
$payloads = [1 => str_repeat('photo-test', 300000), 2 => random_bytes(1048579)];
$items = [
    ['id' => 1, 'file_path' => 'https://example.invalid/media/photo.webp', 'original_name' => '../foto.jpg', 'file_size' => strlen($payloads[1]), 'media_type' => 'image'],
    ['id' => 2, 'file_path' => 'https://example.invalid/media/video.mp4', 'original_name' => 'foto.jpg', 'file_size' => strlen($payloads[2]), 'media_type' => 'video'],
];
$source = fn(array $item) => stream($payloads[$item['id']]);
$jobs = [];
try {
    denied(fn() => $service->create([], $owner), 'Empty album must fail.');
    $state = $service->create($items, $owner);
    $jobs[] = $job = $state['job'];
    check($state['total'] === 2 && $state['completed'] === 0 && !$state['ready'], 'Incorrect start state.');
    denied(fn() => $service->status($job, 'another-session'), 'Another session accessed the export.');
    denied(fn() => $service->status('../escape', $owner), 'Traversal job accepted.');
    denied(fn() => $service->openDownload($job, $owner), 'Partial archive could be downloaded.');
    $first = $service->step($job, $owner, 0, $source);
    check($first['completed'] === 1 && $first['bytes'] === strlen($payloads[1]), 'Incorrect byte progress.');
    $duplicate = $service->step($job, $owner, 0, fn() => throw new RuntimeException('Duplicate read'));
    check($duplicate === $first, 'Lost-response retry duplicated a file.');
    // Simulate truncation midway through the next item, then retry the same item.
    denied(fn() => $service->step($job, $owner, 1, fn() => stream('truncated')), 'Truncated source accepted.');
    check($service->status($job, $owner)['completed'] === 1, 'Failed item advanced the snapshot.');
    $done = $service->step($job, $owner, 1, $source);
    check($done['ready'] && $done['completed'] === 2, 'Archive not complete.');
    $file = $service->openDownload($job, $owner);
    check($file['size'] === $done['zip_bytes'], 'Incorrect download Content-Length.');
    fclose($file['stream']); flock($file['lock'], LOCK_UN); fclose($file['lock']);
    $zip = new ZipArchive();
    check($zip->open($root . '/' . $job . '/album.zip', ZipArchive::CHECKCONS) === true, 'Invalid ZIP/ZIP64 structure.');
    check($zip->numFiles === 2, 'ZIP contains extra files or thumbnails.');
    foreach ($items as $index => $item) {
        $name = AlbumZipService::entryName($item);
        check(!str_contains($name, '..'), 'Unsafe ZIP path.');
        check($zip->getNameIndex($index) === $name, 'Wrong archive name.');
        check(hash('sha256', $zip->getFromName($name)) === hash('sha256', $payloads[$item['id']]), 'Stored bytes changed.');
        check($zip->statIndex($index)['comp_method'] === ZipArchive::CM_STORE, 'Media was recompressed.');
    }
    check(str_ends_with($zip->getNameIndex(0), '.webp'), 'Original JPEG name mislabeled stored WebP.');
    $zip->close();
    check($service->step($job, $owner, 2, $source) === $done, 'Completed retry changed ZIP.');
    denied(fn() => $service->remove($job, 'another-session'), 'Another session deleted the export.');
    // Expiration and lazy cleanup on the next export.
    $path = $root . '/' . $job . '/state.json';
    $saved = json_decode(file_get_contents($path), true);
    $saved['updated'] = time() - AlbumZipService::TTL - 5;
    file_put_contents($path, json_encode($saved));
    touch($path, $saved['updated']);
    denied(fn() => $service->status($job, $owner), 'Expired export accepted.');
    $next = $service->create($items, $owner);
    $jobs[] = $next['job'];
    check(!is_dir($root . '/' . $job), 'Expired ZIP was not cleaned up.');
    echo "PASS: ZIP64 integrity, original bytes/extensions, no thumbnails, progress, retries, failures, ownership, expiry and cleanup.\n";
} finally {
    foreach ($jobs as $job) {
        if (is_dir($root . '/' . $job)) {
            // Restore expired fixture state solely to invoke authenticated cleanup.
            $statePath = $root . '/' . $job . '/state.json';
            $state = json_decode(file_get_contents($statePath), true);
            $state['updated'] = time();
            file_put_contents($statePath, json_encode($state));
            $service->remove($job, $owner);
        }
    }
    rmdir($root);
}
