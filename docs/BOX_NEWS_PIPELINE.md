# Box News — Telegram sync and publishing contract

Status: local implementation complete; Netcup, Telegram webhook, and Layero
deployment remain separately gated.

## Confirmed inputs

- Channel: `@yumind_reborn`.
- Existing bot username: `@trigger4site_bot`.
- Bot token must never be sent in chat, committed, printed, or logged.
- Netcup may host the webhook ingestion service.
- Import the entire available channel history.
- Publish new posts automatically.
- Automatically update an existing article when the Telegram post is edited.
- Copy owned photo covers into site-controlled storage.
- Article bodies remain Russian.

## Existing local export

Private source path:

`/Users/astro_vlad420/Downloads/Telegram Desktop/ChatExport_2026-08-23/result.json`

Validated structure on 2026-08-31 without printing message contents:

- channel name `YUMIND._/`;
- `public_channel` export;
- 127 message records and two service records;
- retained message IDs 575–716;
- date range 12 November 2025–18 August 2026;
- 74 referenced photos, all present locally;
- some large file/video references are intentionally absent.

The raw export is private input and must not enter Git. Current WEBCOPY remote
content supplies later IDs through 719. The importer must merge by stable
Telegram message ID and prefer the newest `edited` timestamp.

## Existing WEBCOPY code

Reusable concepts:

- normalized static JSON;
- local photo download;
- idempotent merge by message ID;
- bounded network retries;
- static article generation.

Do not treat the existing code as a ready webhook:

- the active workflow scrapes `t.me/s/yumind_reborn` twice daily;
- `scripts/sync-posts.js` is inactive `getUpdates` polling;
- there is no Netcup HTTP endpoint or `setWebhook` integration;
- legacy polling does not handle edits, captions, albums, video, or deletion.

The HTML scraper may remain a reconciliation fallback, not the canonical live
writer.

## Versioned public schema

```ts
type BoxNewsPost = {
  schemaVersion: 1;
  id: string;
  title: string;
  preview: string;
  content: string;
  publishedAt: string;
  editedAt?: string;
  telegramUrl: string;
  references: Array<{ label: string; url: string }>;
  cover?: {
    src: string;
    width?: number;
    height?: number;
    alt: string;
  };
  media: Array<{
    type: 'photo' | 'video' | 'file';
    telegramUrl: string;
  }>;
  status: 'published' | 'hidden';
};
```

Store normalized records at `content/box-news/posts.json` and owned covers at
`public/media/box-news/{message-id}.*`. Validate the JSON at build time. Do not
persist Telegram HTML or temporary CDN URLs.

## Target flow

```text
Telegram channel
  -> @trigger4site_bot
  -> HTTPS webhook on Netcup
  -> validate secret header and exact chat_id
  -> normalize channel_post / edited_channel_post
  -> save owned cover
  -> update one record by message_id
  -> commit content artifact to sushin-os-site
  -> GitHub push
  -> Layero rebuild
  -> /box-news/{message-id}
```

There must be exactly one canonical writer. Do not let the WEBCOPY scraper and
the webhook write to the same JSON concurrently.

## Webhook requirements

- Accept only `POST`.
- Verify `X-Telegram-Bot-Api-Secret-Token` with constant-time comparison.
- Verify the exact expected channel/chat ID after secure configuration.
- Accept only `channel_post` and `edited_channel_post`.
- Be idempotent by `update_id`, `chat_id`, and `message_id`.
- Parse text and captions using Telegram entities; never render untrusted HTML.
- Support photo albums through `media_group_id`.
- Download the selected photo immediately; Telegram file URLs expire.
- Do not log the bot token, secret header, full update payload, message text, or
  user identifiers.
- Return a successful response only after the event is durably accepted.
- Keep retries safe and prevent duplicate commits.

## History import

Create a deterministic importer that:

1. Reads the Telegram Desktop JSON from an explicit local path.
2. Ignores service records.
3. Preserves formatted text through a safe plaintext/entities representation.
4. Copies photo covers but leaves large video playback in Telegram.
5. Merges WEBCOPY records 717–719 and future webhook records by ID.
6. Emits a validation report containing counts and IDs, never post bodies.
7. Does not modify or move the source export.

## Edit and deletion policy

- Edit: replace the same ID automatically and update `editedAt`, metadata, and
  cover if present.
- Delete: Telegram Bot API has no channel-post deletion event. Use a committed
  manual deny-list or an authenticated `unpublish <id>` admin operation.
- Hidden records must not appear in the desktop list, sitemap, RSS, previous/
  next links, or structured data.

## Secret installation and deployment

Implementation may create a reproducible Netcup bundle, environment-variable
template, systemd unit, verifier, and rollback instructions. It must not:

- put a real token in `.env.example`;
- call `setWebhook` before explicit production authorization;
- change existing Hermes, `cover-letter`, or `yumind` services;
- deploy the website or webhook as part of local implementation.

When authorized later, the user enters the token directly into server secret
configuration or a hidden terminal prompt. `getMe`, webhook installation, and
health verification must redact credentials.
