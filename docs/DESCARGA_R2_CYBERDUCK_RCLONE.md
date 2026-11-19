# Descarga Masiva del Álbum desde Cloudflare R2 (Cyberduck / rclone)

Los recuerdos de la boda se almacenan directamente en **Cloudflare R2**, donde el tráfico de salida (**egress**) es **$0 USD (gratuito)**.  
Para evitar saturar el hosting compartido (HostGator) empaquetando gigabytes de fotos y videos en un `.ZIP` desde PHP, la descarga completa se realiza directamente desde R2.

## Estructura de carpetas en tu bucket R2

- `media/` → **Todas las fotos optimizadas (máx. 1920px) y videos originales (≤ 30 MB / ≤ 20 s)**, nombrados cronológicamente con el nombre del invitado (`YYYYMMDD_His_NombreInvitado_xxxx.webp|mp4|mov|webm`).
- `thumbs/` → Solo miniaturas de 400px y portadas de video usadas para la galería web. **No necesitas descargar esta carpeta.**

---

## Opción 1: Cyberduck (Interfaz gráfica para Windows / macOS)

1. Descarga e instala [Cyberduck](https://cyberduck.io/).
2. Haz clic en **Abrir conexión** (*Open Connection*).
3. Selecciona el protocolo **Amazon S3** (o el perfil **Cloudflare R2** si aparece en tu versión).
4. Completa los datos con los valores de tu archivo `.env`:
   - **Servidor**: `<R2_ACCOUNT_ID>.r2.cloudflarestorage.com`
   - **Puerto**: `443`
   - **Access Key ID**: tu `R2_ACCESS_KEY_ID`
   - **Secret Access Key**: tu `R2_SECRET_ACCESS_KEY`
   - **Más opciones → Ruta (Path)**: `/<R2_BUCKET>/media`
5. Haz clic en **Conectar**.
6. Arrastra la carpeta `media` (o selecciona todos los archivos) hacia tu computadora para descargarlos a máxima velocidad.

---

## Opción 2: rclone (Línea de comandos ultrarrápida y reanudable)

1. Instala [rclone](https://rclone.org/downloads/).
2. Crea el perfil remoto `r2` ejecutando `rclone config` (o agrega esto en tu archivo `rclone.conf`):

```ini
[r2]
type = s3
provider = Cloudflare
access_key_id = TU_R2_ACCESS_KEY_ID
secret_access_key = TU_R2_SECRET_ACCESS_KEY
endpoint = https://TU_R2_ACCOUNT_ID.r2.cloudflarestorage.com
acl = private
no_check_bucket = true
```

3. Descarga todo el álbum (solo archivos en alta calidad, omitiendo `thumbs/`) con:

```bash
rclone copy r2:TU_R2_BUCKET/media ./Boda_Michelle_y_Rene --progress --transfers 8
```

Si la descarga se interrumpe, vuelve a ejecutar exactamente el mismo comando: `rclone` omitirá los archivos que ya descargaste y continuará donde se quedó.

---

## Política CORS recomendada en Cloudflare R2

Para que los teléfonos de los invitados puedan subir fotos y videos directamente desde el navegador hacia tu bucket, pega esta política en **Cloudflare Dashboard → R2 → Tu Bucket → Settings → CORS Policy**:

```json
[
  {
    "AllowedOrigins": [
      "https://TU_DOMINIO_BODA.com",
      "https://www.TU_DOMINIO_BODA.com",
      "http://localhost:8000"
    ],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedHeaders": ["Content-Type", "Cache-Control"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```
