<?php
/**
 * AdminController: Despacha la vista administrativa o la pantalla de login.
 */

declare(strict_types=1);

namespace App\Controllers;

use App\Helpers\AuthHelper;

class AdminController extends Controller {
    public function index(): void {
        AuthHelper::startSession();
        $adminUser = AuthHelper::getAdminUser();

        if (!$adminUser) {
            $this->renderView('login');
        }

        $this->renderView('admin', [
            'adminUser' => $adminUser
        ]);
    }
}
