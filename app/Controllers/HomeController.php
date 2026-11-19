<?php
/**
 * HomeController: Despacha la vista principal de la boda.
 */

declare(strict_types=1);

namespace App\Controllers;

class HomeController extends Controller {
    public function index(): void {
        $this->renderView('home');
    }

    public function camera(): void {
        $this->renderView('camera');
    }

    public function gallery(): void {
        $this->renderView('gallery');
    }

    public function guestbook(): void {
        $this->renderView('guestbook');
    }
}
