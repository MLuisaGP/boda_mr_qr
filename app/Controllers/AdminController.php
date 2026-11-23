<?php
/**
 * AdminController: Despacha la vista administrativa o la pantalla de login.
 */

declare(strict_types=1);

namespace App\Controllers;

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
        ]);
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
