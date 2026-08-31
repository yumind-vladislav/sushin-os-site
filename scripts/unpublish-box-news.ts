#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

function requestedId(): string {
  const index = process.argv.indexOf('--id');
  const value = index >= 0 ? process.argv[index + 1] : undefined;
  if (!value || !/^\d+$/.test(value)) throw new TypeError('Provide a numeric --id');
  return value;
}

async function main() {
  const id = requestedId();
  const restore = process.argv.includes('--restore');
  const hiddenPath = path.resolve('content/box-news/hidden.json');
  const postsPath = path.resolve('content/box-news/posts.json');
  const posts = JSON.parse(await readFile(postsPath, 'utf8')) as Array<{ id?: unknown }>;
  if (!posts.some((post) => String(post.id) === id)) {
    throw new TypeError(`Box News id ${id} does not exist`);
  }
  const current = JSON.parse(await readFile(hiddenPath, 'utf8')) as unknown;
  if (!Array.isArray(current) || !current.every((value) => /^\d+$/.test(String(value)))) {
    throw new TypeError('Hidden-list schema is invalid');
  }
  const hidden = new Set(current.map(String));
  if (restore) hidden.delete(id);
  else hidden.add(id);
  const sorted = [...hidden].sort((a, b) => Number(a) - Number(b));
  await writeFile(hiddenPath, `${JSON.stringify(sorted, null, 2)}\n`, 'utf8');
  process.stdout.write(
    `box-news ${restore ? 'restored' : 'hidden'}: id=${id} hidden=${sorted.length}\n`,
  );
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown unpublish error';
  process.stderr.write(`box-news unpublish failed: ${message}\n`);
  process.exitCode = 1;
});
