<?php
/**
 * AuthController: Maneja autenticación de invitados y novios.
 */

declare(strict_types=1);

namespace App\Controllers;

use App\Helpers\Response;
use App\Helpers\AuthHelper;
use App\Models\Guest;
use App\Models\Media;
use App\Models\User;

class AuthController extends Controller {
    public function guestLogin(): void {
        AuthHelper::startSession();
        $input = array_merge($_POST, $this->getJsonInput());
        $name = trim($input['name'] ?? '');

        if ($name === '') {
            Response::error('Por favor escribe tu nombre para comenzar.', 422);
        }

        if (mb_strlen($name) < 2 || mb_strlen($name) > 100) {
            Response::error('El nombre debe tener entre 2 y 100 caracteres.', 422);
        }

        $token = trim($input['token'] ?? '');
        $guest = Guest::createOrUpdate($name, $token ?: null);

        setcookie('guest_token', $guest['token'], [
            'expires' => time() + (30 * 86400),
            'path' => '/',
            'httponly' => false,
            'samesite' => 'Lax'
        ]);
        $_SESSION['guest_token'] = $guest['token'];

        $itemCount = Guest::getItemCount((int) $guest['id']);
        $videoCount = Guest::getVideoCount((int) $guest['id']);
        $deadlineInfo = Media::getUploadDeadlineInfo();

        Response::success('¡Bienvenido a la boda de Michelle & René!', [
            'guest' => [
                'id' => (int) $guest['id'],
                'name' => $guest['name'],
                'token' => $guest['token'],
                'item_count' => $itemCount,
                'max_items' => Guest::MAX_ITEMS,
                'video_count' => $videoCount,
                'max_videos' => Guest::MAX_VIDEOS,
            ],
            'uploads_closed' => $deadlineInfo['uploads_closed'],
            'upload_deadline' => $deadlineInfo['upload_deadline'],
        ]);
    }

    public function guestMe(): void {
        AuthHelper::startSession();
        $guest = AuthHelper::getGuest();
        if (!$guest) {
            Response::error('No hay sesión de invitado activa.', 401);
        }

        $itemCount = Guest::getItemCount((int) $guest['id']);
        $videoCount = Guest::getVideoCount((int) $guest['id']);
        $deadlineInfo = Media::getUploadDeadlineInfo();

        Response::json([
            'success' => true,
            'guest' => [
                'id' => (int) $guest['id'],
                'name' => $guest['name'],
                'token' => $guest['token'],
                'item_count' => $itemCount,
                'max_items' => Guest::MAX_ITEMS,
                'video_count' => $videoCount,
                'max_videos' => Guest::MAX_VIDEOS,
            ],
            'uploads_closed' => $deadlineInfo['uploads_closed'],
            'upload_deadline' => $deadlineInfo['upload_deadline'],
        ]);
    }

    public function adminLogin(): void {
        AuthHelper::startSession();
        $input = array_merge($_POST, $this->getJsonInput());
        $username = trim($input['username'] ?? '');
        $password = trim($input['password'] ?? '');

        if ($username === '' || $password === '') {
            Response::error('Por favor ingresa usuario y contraseña.', 422);
        }

        $user = User::verifyCredentials($username, $password);
        if (!$user) {
            Response::error('Credenciales incorrectas. Verifica tu usuario y contraseña.', 401);
        }

        $_SESSION['admin_user'] = $user;

        Response::success('Inicio de sesión exitoso.', [
            'user' => $user
        ]);
    }

    public function adminLogout(): void {
        AuthHelper::startSession();
        unset($_SESSION['admin_user']);
        Response::success('Sesión finalizada correctamente.');
    }

    public function adminCheck(): void {
        AuthHelper::startSession();
        $admin = AuthHelper::getAdminUser();
        if (!$admin) {
            Response::error('No autenticado', 401);
        }
        Response::json(['success' => true, 'user' => $admin]);
    }

    public function handleLegacy(): void {
        $input = array_merge($_GET, $_POST, $this->getJsonInput());
        $action = $input['action'] ?? '';

        match ($action) {
            'guest_login' => $this->guestLogin(),
            'guest_me' => $this->guestMe(),
            'admin_login' => $this->adminLogin(),
            'admin_logout' => $this->adminLogout(),
            'admin_check' => $this->adminCheck(),
            default => Response::error('Acción de autenticación no válida.', 400),
        };
    }
}
