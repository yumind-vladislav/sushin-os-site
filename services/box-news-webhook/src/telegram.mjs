import { mkdir, rename, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';

const MAX_PHOTO_BYTES = 20 * 1024 * 1024;

export function imageExtensionFor(buffer) {
  if (!Buffer.isBuffer(buffer)) return null;
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return '.jpg';
  }
  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'))
  ) {
    return '.png';
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return '.webp';
  }
  return null;
}

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
  if (
    remotePath.startsWith('/') ||
    remotePath.includes('..') ||
    !/^[A-Za-z0-9_./-]+$/.test(remotePath)
  ) {
    throw new Error('telegram_file_path_invalid');
  }
  const mediaResponse = await telegramFetch(
    `https://api.telegram.org/file/bot${token}/${remotePath}`,
    'telegram_file_download_failed',
  );
  const declaredLength = Number(mediaResponse.headers.get('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_PHOTO_BYTES) {
    throw new Error('telegram_file_too_large');
  }
  const image = Buffer.from(await mediaResponse.arrayBuffer());
  if (image.length > MAX_PHOTO_BYTES) {
    throw new Error('telegram_file_too_large');
  }
  const extension = imageExtensionFor(image);
  if (!extension) throw new Error('telegram_file_type_invalid');
  const destination = path.join(mediaDirectory, `${postId}${extension}`);
  const temporary = `${destination}.${randomUUID()}.tmp`;

  await mkdir(mediaDirectory, { recursive: true });
  await writeFile(temporary, image, {
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
