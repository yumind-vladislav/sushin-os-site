# Box News local operations

This runbook covers repository-local work only. It does not authorize Layero
deployment, Netcup changes, Telegram webhook installation, or secret entry.

## Build-time data

- Normalized records: `content/box-news/posts.json`
- Manual deny-list: `content/box-news/hidden.json`
- Owned covers: `public/media/box-news/`
- Public routes: `/box-news/[id]/`
- Discovery: `/rss.xml`, `/sitemap.xml`, `/robots.txt`

The app validates all records while importing the module at build time. Hidden
IDs are removed before the desktop summaries, static params, metadata,
structured data, RSS, sitemap, and previous/next relationships are generated.

## Deterministic history import

Run the importer only with explicit absolute paths. Keep the source export,
legacy checkout, and generated validation report outside tracked source. The
report contains counts and IDs only.

```bash
npm run box-news:import -- \
  --source /absolute/private/result.json \
  --legacy /absolute/legacy/posts.json \
  --output content/box-news/posts.json \
  --covers public/media/box-news \
  --report tmp/box-news-import-report.json \
  --minimum-legacy-id 717
```

After import, review only the normalized public artifact and count-only report,
then run:

```bash
npm test
npm run lint
npm run build
```

The checked-in 2026-08-31 result contains 130 retained records across IDs
575–719 and 74 owned covers. Gaps are expected because service messages and
non-retained records are not public articles.

## Manual unpublish and restore

Telegram does not emit channel-post deletion events. Commit deny-list changes as
normal reviewed content changes:

```bash
npm run box-news:unpublish -- --id 000
npm run box-news:unpublish -- --id 000 --restore
```

Rebuild after either operation. A hidden post must be absent from every
discovery surface and will no longer receive a generated article route.

## Canonical URL

Static metadata uses `NEXT_PUBLIC_SITE_URL`, with `https://sushin.dev` as the
approved fallback. Set the final canonical origin in the Layero build settings
before an authorized deployment if the production origin differs.

## Deferred webhook handoff

The reproducible bundle lives at `services/box-news-webhook/`. Its README lists
the protected configuration names, systemd unit, reverse-proxy boundary,
single-writer requirement, verification sequence, and rollback. Git push is off
by default. The operator must disable the legacy WEBCOPY scraper as a writer
before enabling the webhook and must enter the bot token only through protected
server configuration or a hidden prompt.
