<?php
/**
 * LikeController: Toggle like en fotos y videos.
 */

declare(strict_types=1);

namespace App\Controllers;

use App\Helpers\Response;
use App\Helpers\AuthHelper;
use App\Config\Database;

class LikeController extends Controller {
    public function toggle(): void {
        AuthHelper::startSession();
        $input = array_merge($_POST, $this->getJsonInput());
        $mediaId = (int) ($input['media_id'] ?? 0);

        if ($mediaId <= 0) {
            Response::error('ID de medio requerido.', 422);
        }

        $token = AuthHelper::getGuestToken();
        if (!$token) {
            $token = $_COOKIE['like_device_token'] ?? bin2hex(random_bytes(16));
            setcookie('like_device_token', $token, [
                'expires' => time() + (365 * 86400),
                'path' => '/',
                'samesite' => 'Lax'
            ]);
        }

        $pdo = Database::getConnection();

        $chk = $pdo->prepare('SELECT `id`, `likes_count` FROM `media` WHERE `id` = :id LIMIT 1');
        $chk->execute([':id' => $mediaId]);
        $media = $chk->fetch();

        if (!$media) {
            Response::error('El recuerdo no existe.', 404);
        }

        $likeStmt = $pdo->prepare('SELECT `id` FROM `media_likes` WHERE `media_id` = :mid AND `guest_token` = :tok LIMIT 1');
        $likeStmt->execute([':mid' => $mediaId, ':tok' => $token]);
        $existingLike = $likeStmt->fetch();

        if ($existingLike) {
            $del = $pdo->prepare('DELETE FROM `media_likes` WHERE `id` = :lid');
            $del->execute([':lid' => $existingLike['id']]);

            $upd = $pdo->prepare('UPDATE `media` SET `likes_count` = GREATEST(0, CAST(`likes_count` AS SIGNED) - 1) WHERE `id` = :mid');
            $upd->execute([':mid' => $mediaId]);

            $hasLiked = false;
        } else {
            $ins = $pdo->prepare('INSERT INTO `media_likes` (`media_id`, `guest_token`, `created_at`) VALUES (:mid, :tok, NOW())');
            $ins->execute([':mid' => $mediaId, ':tok' => $token]);

            $upd = $pdo->prepare('UPDATE `media` SET `likes_count` = `likes_count` + 1 WHERE `id` = :mid');
            $upd->execute([':mid' => $mediaId]);

            $hasLiked = true;
        }

        $res = $pdo->prepare('SELECT `likes_count` FROM `media` WHERE `id` = :mid');
        $res->execute([':mid' => $mediaId]);
        $newCount = (int) $res->fetchColumn();

        Response::success('Like actualizado.', [
            'media_id' => $mediaId,
            'has_liked' => $hasLiked,
            'likes_count' => $newCount,
        ]);
    }
}
