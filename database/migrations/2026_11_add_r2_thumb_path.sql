-- Migración: Soporte para URLs completas de Cloudflare R2 y thumbnails WebP/JPEG
-- Fecha: 2026-11-19
-- Segura y retrocompatible con los registros locales existentes en `uploads/`.

ALTER TABLE `media`
    MODIFY COLUMN `file_path` VARCHAR(500) NOT NULL,
    ADD COLUMN `thumb_path` VARCHAR(500) NULL DEFAULT NULL AFTER `file_path`;
