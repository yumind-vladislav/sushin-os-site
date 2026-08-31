#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  mergeBoxNewsPosts,
  normalizeDesktopExport,
  normalizeLegacyPost,
} from '../lib/box-news-import';

function argument(name: string, required = true): string | undefined {
  const index = process.argv.indexOf(name);
  const value = index >= 0 ? process.argv[index + 1] : undefined;
  if (required && (!value || value.startsWith('--'))) {
    throw new TypeError(`Missing ${name}`);
  }
  return value;
}

async function readJson(filePath: string): Promise<unknown> {
  return JSON.parse(await readFile(filePath, 'utf8')) as unknown;
}

async function main() {
  const sourcePath = path.resolve(argument('--source') as string);
  const legacyPath = path.resolve(argument('--legacy') as string);
  const outputPath = path.resolve(argument('--output') as string);
  const coverDirectory = path.resolve(argument('--covers') as string);
  const reportPath = path.resolve(argument('--report') as string);
  const minimumLegacyId = Number(argument('--minimum-legacy-id', false) ?? 717);

  const source = await readJson(sourcePath);
  const { posts: imported, report: sourceReport } = await normalizeDesktopExport(
    source,
    path.dirname(sourcePath),
    coverDirectory,
  );
  const legacyValue = await readJson(legacyPath);
  if (!Array.isArray(legacyValue)) throw new TypeError('Legacy posts must be an array');
  const laterPosts = legacyValue
    .map(normalizeLegacyPost)
    .filter(({ id }) => Number(id) >= minimumLegacyId);
  const posts = mergeBoxNewsPosts(imported, laterPosts);
  const report = {
    ...sourceReport,
    mergedIds: laterPosts.map(({ id }) => id),
    postsWritten: posts.length,
  };

  await writeFile(outputPath, `${JSON.stringify(posts, null, 2)}\n`, 'utf8');
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  process.stdout.write(
    `box-news import: posts=${posts.length} covers=${sourceReport.coversCopied.length} ids=${posts[0]?.id ?? '-'}..${posts.at(-1)?.id ?? '-'}\n`,
  );
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown import error';
  process.stderr.write(`box-news import failed: ${message}\n`);
  process.exitCode = 1;
});
