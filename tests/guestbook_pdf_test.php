<?php
declare(strict_types=1);

namespace App\Config {
    // Isolated in-memory stub PDO (no DB drivers needed; real DB config is never loaded).
    class StubStatement {
        public function __construct(private array $rows) {}
        public function fetchAll(int $mode = \PDO::FETCH_DEFAULT, mixed ...$args): array {
            return $this->rows;
        }
    }

    class StubPdo extends \PDO {
        private array $rows = [
            ['id' => 1, 'guest_id' => 10, 'guest_name' => 'Familia Rodríguez', 'message' => '¡Muchas felicidades en esta nueva etapa!', 'font_family' => 'ballet', 'is_visible' => 1, 'created_at' => '2026-12-19 18:00:00'],
            ['id' => 2, 'guest_id' => 11, 'guest_name' => 'Ana & Carlos', 'message' => "Que el amor los acompañe siempre.\nCon cariño.", 'font_family' => 'lavishly_yours', 'is_visible' => 1, 'created_at' => '2026-12-19 18:10:00'],
            ['id' => 3, 'guest_id' => 12, 'guest_name' => 'Tío Luis <script>alert(1)</script>', 'message' => 'Brindamos por ustedes.', 'font_family' => 'tangerine', 'is_visible' => 1, 'created_at' => '2026-12-19 18:20:00'],
            ['id' => 4, 'guest_id' => 13, 'guest_name' => 'Elena P.', 'message' => 'Qué alegría compartir este día.', 'font_family' => 'annie_use_your_telescope', 'is_visible' => 1, 'created_at' => '2026-12-19 18:25:00'],
            ['id' => 5, 'guest_id' => 14, 'guest_name' => 'Mateo G.', 'message' => 'Mucho amor y risas.', 'font_family' => 'indie_flower', 'is_visible' => 1, 'created_at' => '2026-12-19 18:26:00'],
            ['id' => 6, 'guest_id' => 15, 'guest_name' => 'Valeria R.', 'message' => 'Les deseamos lo mejor.', 'font_family' => 'oooh_baby', 'is_visible' => 1, 'created_at' => '2026-12-19 18:28:00'],
            ['id' => 7, 'guest_id' => 16, 'guest_name' => 'Sofía M.', 'message' => 'Una boda mágica.', 'font_family' => 'italianno', 'is_visible' => 1, 'created_at' => '2026-12-19 18:30:00'],
            ['id' => 8, 'guest_id' => 17, 'guest_name' => 'Oculta', 'message' => 'No debe aparecer.', 'font_family' => 'ballet', 'is_visible' => 0, 'created_at' => '2026-12-19 18:40:00'],
        ];

        public function __construct() {}

        #[\ReturnTypeWillChange]
        public function query(string $query, ?int $fetchMode = null, mixed ...$fetchModeArgs) {
            if (stripos($query, 'SHOW COLUMNS') !== false) {
                return new StubStatement([['Field' => 'font_family']]);
            }
            $visible = array_values(array_filter($this->rows, static fn (array $r): bool => $r['is_visible'] === 1));
            if (stripos($query, 'ORDER BY `id` DESC') !== false) {
                usort($visible, static fn (array $a, array $b): int => $b['id'] <=> $a['id']);
            } else {
                usort($visible, static fn (array $a, array $b): int => $a['id'] <=> $b['id']);
            }
            return new StubStatement($visible);
        }
    }

    class Database {
        public static function getConnection(): \PDO {
            return new StubPdo();
        }
    }
}

namespace {
    use App\Controllers\AdminController;

    require __DIR__ . '/../vendor/autoload.php';

    if (($argv[1] ?? '') === '--request') {
        $root = $argv[2];
        $auth = $argv[3] ?? 'guest';
        $order = $argv[4] ?? 'asc';
        session_save_path($root . '/sessions');
        session_id('gbpdftest' . substr(hash('sha256', $root . $auth . $order), 0, 16));
        session_start();
        $_SESSION['admin_user'] = $auth === 'admin' ? ['id' => 1, 'full_name' => 'Michelle & René', 'role' => 'admin'] : null;
        $_GET = ['order' => $order];

        $controller = new AdminController();
        $controller->guestbookPdf();
        exit;
    }

    function check(bool $value, string $message): void {
        if (!$value) {
            throw new \RuntimeException($message);
        }
    }

    $root = sys_get_temp_dir() . '/boda-gbpdf-test-' . bin2hex(random_bytes(8));
    mkdir($root, 0700);
    mkdir($root . '/sessions', 0700);

    $call = static function (string $auth, string $order = 'asc') use ($root): string {
        $process = proc_open(
            [PHP_BINARY, __FILE__, '--request', $root, $auth, $order],
            [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']],
            $pipes,
            null,
            null,
            ['bypass_shell' => true]
        );
        fclose($pipes[0]);
        $body = stream_get_contents($pipes[1]);
        fclose($pipes[1]);
        $stderr = stream_get_contents($pipes[2]);
        fclose($pipes[2]);
        proc_close($process);
        if ($stderr !== '') {
            throw new \RuntimeException('Unexpected stderr: ' . $stderr);
        }
        return (string) $body;
    };

    try {
        // 1. Unauthenticated access must render login, never guestbook signatures.
        $guestHtml = $call('guest');
        check(!str_contains($guestHtml, 'Familia Rodríguez'), 'Unauthenticated user must not see signatures');
        check(str_contains($guestHtml, 'login') || str_contains($guestHtml, 'Iniciar') || str_contains($guestHtml, 'Contraseña'), 'Unauthenticated user should see login view');

        // 2. Authenticated admin gets cover, borderless interior sheets, back cover + all 7 visible signatures with their exact font classes.
        $ascHtml = $call('admin', 'asc');
        check(str_contains($ascHtml, 'Libro de Honor'), 'Cover title missing');
        check(str_contains($ascHtml, 'pdf-sheet-backcover'), 'Back cover missing');
        check(str_contains($ascHtml, 'Gracias por ser parte de nuestra historia'), 'Back cover message missing');
        check(!str_contains($ascHtml, 'pdf-page-spine'), 'Interior sheets should not have outer spine border');
        check(str_contains($ascHtml, 'sig-font-ballet'), 'ballet font class missing');
        check(str_contains($ascHtml, 'sig-font-lavishly_yours'), 'lavishly_yours font class missing');
        check(str_contains($ascHtml, 'sig-font-tangerine'), 'tangerine font class missing');
        check(str_contains($ascHtml, 'sig-font-annie_use_your_telescope'), 'annie_use_your_telescope font class missing');
        check(str_contains($ascHtml, 'sig-font-indie_flower'), 'indie_flower font class missing');
        check(str_contains($ascHtml, 'sig-font-oooh_baby'), 'oooh_baby font class missing');
        check(str_contains($ascHtml, 'sig-font-italianno'), 'italianno font class missing');
        check(!str_contains($ascHtml, 'No debe aparecer.'), 'Hidden signature leaked into PDF');
        check(!str_contains($ascHtml, '<script>alert(1)</script>'), 'XSS payload was not escaped');
        check(str_contains($ascHtml, '&lt;script&gt;alert(1)&lt;/script&gt;'), 'Escaped author name missing');

        // 3. Ordering check: ASC puts Familia Rodríguez before Sofía M., DESC puts Sofía M. first.
        $posFirstAsc = strpos($ascHtml, 'Familia Rodríguez');
        $posLastAsc = strpos($ascHtml, 'Sofía M.');
        check($posFirstAsc !== false && $posLastAsc !== false && $posFirstAsc < $posLastAsc, 'ASC order failed');

        $descHtml = $call('admin', 'desc');
        $posFirstDesc = strpos($descHtml, 'Familia Rodríguez');
        $posLastDesc = strpos($descHtml, 'Sofía M.');
        check($posFirstDesc !== false && $posLastDesc !== false && $posLastDesc < $posFirstDesc, 'DESC order failed');

        echo "OK: guestbook PDF controller & view tests passed.\n";
    } finally {
        foreach (glob($root . '/sessions/*') ?: [] as $f) @unlink($f);
        @rmdir($root . '/sessions');
        @rmdir($root);
    }
}
