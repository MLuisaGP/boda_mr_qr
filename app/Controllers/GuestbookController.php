<?php
/**
 * GuestbookController: Libro de firmas y dedicatorias de amor.
 */

declare(strict_types=1);

namespace App\Controllers;

use App\Helpers\Response;
use App\Helpers\AuthHelper;
use App\Models\Guestbook;

class GuestbookController extends Controller {
    public function index(): void {
        $rows = Guestbook::listVisible(300);

        $entries = array_map(function ($r) {
            return [
                'id' => (int) $r['id'],
                'guest_id' => $r['guest_id'] ? (int) $r['guest_id'] : null,
                'guest_name' => htmlspecialchars($r['guest_name'], ENT_QUOTES, 'UTF-8'),
                'raw_guest_name' => $r['guest_name'],
                'message' => nl2br(htmlspecialchars($r['message'], ENT_QUOTES, 'UTF-8')),
                'raw_message' => $r['message'],
                'font_family' => Guestbook::normalizeFont($r['font_family'] ?? null, (int) $r['id']),
                'created_at' => $r['created_at'],
            ];
        }, $rows);

        Response::json([
            'success' => true,
            'entries' => $entries,
            'total' => count($entries)
        ]);
    }

    public function store(): void {
        AuthHelper::startSession();
        $input = array_merge($_POST, $this->getJsonInput());
        $guest = AuthHelper::getGuest();

        $name = trim($input['name'] ?? ($guest['name'] ?? ''));
        $message = trim($input['message'] ?? '');

        if ($name === '') {
            Response::error('Por favor escribe tu nombre.', 422);
        }

        if ($message === '') {
            Response::error('Por favor escribe tus buenos deseos para los novios.', 422);
        }

        if (mb_strlen($name) > 100) {
            Response::error('El nombre no puede superar 100 caracteres.', 422);
        }

        if (mb_strlen($message) > 2000) {
            Response::error('El mensaje no puede exceder 2000 caracteres.', 422);
        }

        $guestId = $guest ? (int) $guest['id'] : null;
        $assignedFont = null;
        $entryId = Guestbook::create($guestId, $name, $message, $assignedFont);

        Response::success('¡Muchas gracias por tus hermosos deseos!', [
            'entry' => [
                'id' => $entryId,
                'guest_name' => htmlspecialchars($name, ENT_QUOTES, 'UTF-8'),
                'raw_guest_name' => $name,
                'message' => nl2br(htmlspecialchars($message, ENT_QUOTES, 'UTF-8')),
                'raw_message' => $message,
                'font_family' => $assignedFont ?? Guestbook::normalizeFont(null, $entryId),
                'created_at' => date('Y-m-d H:i:s')
            ]
        ], 201);
    }

    public function destroy(?string $id = null): void {
        AuthHelper::requireAdmin();

        $input = array_merge($_POST, $this->getJsonInput());
        $entryId = (int) ($id ?? ($input['id'] ?? ($_GET['id'] ?? 0)));

        if ($entryId <= 0) {
            Response::error('ID inválido.', 422);
        }

        Guestbook::delete($entryId);

        Response::success('Firma eliminada correctamente.');
    }
}
