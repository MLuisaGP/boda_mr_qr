<?php
declare(strict_types=1);

namespace App\Services;

/** Safe, user-facing export error; SDK/DB errors must never be exposed. */
class AlbumZipException extends \RuntimeException {}
