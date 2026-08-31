import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import path from 'node:path';
import { mergePostRecords } from './core.mjs';
import { atomicJson } from './storage.mjs';
import { downloadPhoto } from './telegram.mjs';

const execFileAsync = promisify(execFile);

async function readPosts(postsPath) {
  const value = JSON.parse(await readFile(postsPath, 'utf8'));
  if (!Array.isArray(value)) throw new TypeError('box_news_collection_invalid');
  return value;
}

export async function writeEvent({ event, token, repositoryDirectory }) {
  const postsPath = path.join(repositoryDirectory, 'content/box-news/posts.json');
  const mediaDirectory = path.join(repositoryDirectory, 'public/media/box-news');
  const posts = await readPosts(postsPath);
  const cover = await downloadPhoto({
    token,
    photo: event.photo,
    postId: event.post.id,
    mediaDirectory,
  });
  const post = {
    ...event.post,
    ...(cover ? { cover } : {}),
  };
  await atomicJson(postsPath, mergePostRecords(posts, post));
  return {
    id: post.id,
    trackedPaths: [
      'content/box-news/posts.json',
      ...(cover ? [cover.src.replace(/^\//, '')] : []),
    ],
  };
}

export async function commitAndPush({
  repositoryDirectory,
  trackedPaths,
  postId,
  branch,
  enabled,
}) {
  if (!enabled) return false;
  await execFileAsync('git', ['add', '--', ...trackedPaths], {
    cwd: repositoryDirectory,
  });
  try {
    await execFileAsync('git', ['diff', '--cached', '--quiet'], {
      cwd: repositoryDirectory,
    });
    return false;
  } catch (error) {
    if (error?.code !== 1) throw new Error('git_diff_failed');
  }
  await execFileAsync('git', ['commit', '-m', `content(box-news): sync ${postId}`], {
    cwd: repositoryDirectory,
  });
  await execFileAsync('git', ['push', 'origin', branch], {
    cwd: repositoryDirectory,
  });
  return true;
}
