import { mkdir, rename, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

async function telegramFetch(url, errorCode) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(15_000),
    redirect: 'error',
  });
  if (!response.ok) throw new Error(errorCode);
  return response;
}

export async function downloadPhoto({ token, photo, postId, mediaDirectory }) {
  if (!photo?.fileId) return null;

  const metadataResponse = await telegramFetch(
    `https://api.telegram.org/bot${token}/getFile?file_id=${encodeURIComponent(photo.fileId)}`,
    'telegram_get_file_failed',
  );
  const metadata = await metadataResponse.json();
  if (!metadata?.ok || typeof metadata.result?.file_path !== 'string') {
    throw new Error('telegram_file_metadata_invalid');
  }

  const remotePath = metadata.result.file_path;
  const suffix = path.extname(remotePath).toLowerCase();
  const extension = ALLOWED_EXTENSIONS.has(suffix) ? suffix : '.jpg';
  const destination = path.join(mediaDirectory, `${postId}${extension}`);
  const temporary = `${destination}.${randomUUID()}.tmp`;
  const mediaResponse = await telegramFetch(
    `https://api.telegram.org/file/bot${token}/${remotePath}`,
    'telegram_file_download_failed',
  );

  await mkdir(mediaDirectory, { recursive: true });
  await writeFile(temporary, Buffer.from(await mediaResponse.arrayBuffer()), {
    mode: 0o600,
  });
  await rename(temporary, destination);

  return {
    src: `/media/box-news/${postId}${extension}`,
    ...(photo.width ? { width: photo.width } : {}),
    ...(photo.height ? { height: photo.height } : {}),
    alt: `Обложка публикации Box News ${postId}`,
  };
}
