<?php
/**
 * Guestbook Model.
 */

declare(strict_types=1);

namespace App\Models;

use App\Config\Database;
use PDO;

class Guestbook {
    /**
     * Tipografías manuscritas asignadas automáticamente al azar a cada firma.
     */
    public const SIGNATURE_FONTS = [
        'ballet',
        'lavishly_yours',
        'tangerine',
        'annie_use_your_telescope',
        'indie_flower',
        'oooh_baby',
        'italianno',
    ];

    private static ?bool $hasFontColumn = null;

    private static function ensureFontColumn(PDO $pdo): bool {
        if (self::$hasFontColumn !== null) {
            return self::$hasFontColumn;
        }

        try {
            $check = $pdo->query("SHOW COLUMNS FROM `guestbook` LIKE 'font_family'")->fetchAll();
            if (empty($check)) {
                $pdo->exec("ALTER TABLE `guestbook` ADD COLUMN `font_family` VARCHAR(40) NULL DEFAULT NULL AFTER `message`");
            }
            self::$hasFontColumn = true;
        } catch (\Throwable $e) {
            self::$hasFontColumn = false;
        }

        return self::$hasFontColumn;
    }

    public static function normalizeFont(?string $font, int $fallbackSeed = 0): string {
        if ($font !== null && in_array($font, self::SIGNATURE_FONTS, true)) {
            return $font;
        }
        $count = count(self::SIGNATURE_FONTS);
        $index = abs($fallbackSeed) % $count;
        return self::SIGNATURE_FONTS[$index];
    }

    public static function pickRandomFont(?string $excludeFont = null): string {
        $pool = self::SIGNATURE_FONTS;
        if ($excludeFont !== null && in_array($excludeFont, $pool, true)) {
            $pool = array_values(array_filter($pool, static fn (string $f): bool => $f !== $excludeFont));
        }
        return $pool[random_int(0, count($pool) - 1)];
    }

    public static function listVisible(int $limit = 300): array {
        $pdo = Database::getConnection();
        $hasFont = self::ensureFontColumn($pdo);
        $fontSelect = $hasFont ? ', `font_family`' : '';

        $stmt = $pdo->prepare("
            SELECT `id`, `guest_id`, `guest_name`, `message`{$fontSelect}, `created_at`
            FROM `guestbook`
            WHERE `is_visible` = 1
            ORDER BY `id` DESC
            LIMIT :lim
        ");
        $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll();

        foreach ($rows as &$row) {
            $row['font_family'] = self::normalizeFont($row['font_family'] ?? null, (int) ($row['id'] ?? 0));
        }
        unset($row);

        return $rows;
    }

    public static function listAllVisible(string $order = 'ASC'): array {
        $pdo = Database::getConnection();
        $hasFont = self::ensureFontColumn($pdo);
        $fontSelect = $hasFont ? ', `font_family`' : '';
        $direction = strtoupper($order) === 'DESC' ? 'DESC' : 'ASC';

        $stmt = $pdo->query("
            SELECT `id`, `guest_id`, `guest_name`, `message`{$fontSelect}, `created_at`
            FROM `guestbook`
            WHERE `is_visible` = 1
            ORDER BY `id` {$direction}
        ");
        $rows = $stmt->fetchAll();

        foreach ($rows as &$row) {
            $row['font_family'] = self::normalizeFont($row['font_family'] ?? null, (int) ($row['id'] ?? 0));
        }
        unset($row);

        return $rows;
    }

    public static function create(?int $guestId, string $guestName, string $message, ?string &$assignedFont = null): int {
        $pdo = Database::getConnection();
        $hasFont = self::ensureFontColumn($pdo);

        $lastFont = null;
        if ($hasFont) {
            try {
                $lastRow = $pdo->query('SELECT `font_family` FROM `guestbook` ORDER BY `id` DESC LIMIT 1')->fetch();
                if ($lastRow && !empty($lastRow['font_family'])) {
                    $lastFont = (string) $lastRow['font_family'];
                }
            } catch (\Throwable $e) {
                $lastFont = null;
            }
        }

        $assignedFont = self::pickRandomFont($lastFont);

        if ($hasFont) {
            $stmt = $pdo->prepare('
                INSERT INTO `guestbook` (`guest_id`, `guest_name`, `message`, `font_family`, `is_visible`, `created_at`)
                VALUES (:guest_id, :guest_name, :message, :font_family, 1, NOW())
            ');
            $stmt->execute([
                ':guest_id' => $guestId,
                ':guest_name' => $guestName,
                ':message' => $message,
                ':font_family' => $assignedFont,
            ]);
        } else {
            $stmt = $pdo->prepare('
                INSERT INTO `guestbook` (`guest_id`, `guest_name`, `message`, `is_visible`, `created_at`)
                VALUES (:guest_id, :guest_name, :message, 1, NOW())
            ');
            $stmt->execute([
                ':guest_id' => $guestId,
                ':guest_name' => $guestName,
                ':message' => $message,
            ]);
        }

        return (int) $pdo->lastInsertId();
    }

    public static function delete(int $id): bool {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('DELETE FROM `guestbook` WHERE `id` = :id');
        return $stmt->execute([':id' => $id]);
    }
}
