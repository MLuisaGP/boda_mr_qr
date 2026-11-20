<?php
/**
 * HomeController: Despacha la vista principal de la boda.
 */

declare(strict_types=1);

namespace App\Controllers;

use App\Models\Media;

class HomeController extends Controller {
    private function sharedViewData(): array {
        $deadline = Media::getUploadDeadlineInfo();
        return [
            'uploadsClosed' => $deadline['uploads_closed'],
            'uploadDeadlineIso' => $deadline['upload_deadline'],
            'uploadDeadlineLabel' => $deadline['upload_deadline_label'],
        ];
    }

    public function index(): void {
        $this->renderView('home', $this->sharedViewData());
    }

    public function camera(): void {
        $this->renderView('camera', $this->sharedViewData());
    }

    public function gallery(): void {
        $this->renderView('gallery', $this->sharedViewData());
    }

    public function guestbook(): void {
        $this->renderView('guestbook', $this->sharedViewData());
    }
}
