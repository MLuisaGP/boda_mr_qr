<?php
/**
 * AdminController: Despacha la vista administrativa o la pantalla de login.
 */

declare(strict_types=1);

namespace App\Controllers;

use App\Config\Database;
use App\Helpers\AuthHelper;
use App\Models\Guestbook;
use App\Services\R2StorageService;

class AdminController extends Controller {
    public function index(): void {
        AuthHelper::startSession();
        $adminUser = AuthHelper::getAdminUser();

        if (!$adminUser) {
            $this->renderView('login');
        }

        $this->renderView('admin', [
            'adminUser' => $adminUser,
            'r2Info' => R2StorageService::getPublicConnectionInfo(),
            'qrUrl' => $this->resolveQrUrl(),
        ]);
    }

    private function resolveQrUrl(): string {
        $env = Database::loadEnv();
        foreach (['QR_URL', 'APP_URL'] as $key) {
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
    }

    public function guestbookPdf(): void {
        AuthHelper::startSession();
        $adminUser = AuthHelper::getAdminUser();

        if (!$adminUser) {
            $this->renderView('login');
        }

        $orderParam = strtolower(trim((string) ($_GET['order'] ?? 'asc')));
        $order = $orderParam === 'desc' ? 'DESC' : 'ASC';
        $entries = Guestbook::listAllVisible($order);

        $this->renderView('admin_guestbook_pdf', [
            'adminUser' => $adminUser,
            'entries' => $entries,
            'order' => strtolower($order),
            'generatedAt' => date('d/m/Y'),
        ]);
    }
}
