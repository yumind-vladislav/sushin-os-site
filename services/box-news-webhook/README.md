# Box News webhook bundle

This directory is a reproducible, uninstalled Netcup-side bundle for Telegram
`channel_post` and `edited_channel_post` events. It is intentionally inert until
a server operator supplies secrets and starts it. Local implementation does not
install the webhook or alter Netcup, Telegram, GitHub, or Layero.

## Behavior

- accepts the configured webhook path by `POST` only;
- compares `X-Telegram-Bot-Api-Secret-Token` in constant time;
- checks the exact configured channel ID;
- stores an event receipt before returning success;
- coalesces photo albums and resumes pending albums after a restart;
- downloads the selected Telegram photo immediately into site-owned storage;
- serializes normal updates and album flushes across the JSON write, commit, and
  push boundary;
- replaces edits by stable message ID and prevents duplicate commits;
- rejects updates without text/caption or supported media, while representing a
  valid Telegram poll question as marked plaintext;
- never renders Telegram HTML and does not log request bodies, content, tokens,
  secret headers, Telegram file URLs, or user identifiers;
- keeps Git commit/push disabled unless `BOX_NEWS_GIT_PUSH=1` is explicitly set.

## Required server configuration

Create `/etc/sushin-box-news-webhook.conf` directly on the server with mode
`0600`. Enter all values in the server's protected configuration surface, not in
chat, Git, shell history, or this repository:

```text
TELEGRAM_BOT_TOKEN
TELEGRAM_WEBHOOK_SECRET
TELEGRAM_CHANNEL_CHAT_ID
BOX_NEWS_STATE_DIRECTORY
BOX_NEWS_REPOSITORY_DIRECTORY
```

Optional names are `PORT`, `WEBHOOK_PATH`, `BOX_NEWS_ALBUM_DELAY_MS`,
`BOX_NEWS_GIT_PUSH`, and `BOX_NEWS_GIT_BRANCH`. Push remains off by default.

## Local verification

```bash
npm test
node --check src/server.mjs
```

No production credentials are needed for those checks.

## Later authorized installation

1. Create the dedicated unprivileged service user, clone the public repository
   below `/opt`, and create the state directory below `/var/lib`.
2. Adjust the paths in `box-news-webhook.service` if the checkout differs, copy
   the unit to systemd, and install the protected configuration directly on the
   server.
3. Configure the existing HTTPS reverse proxy to send only the private webhook
   path to the loopback listener. Keep `/health` available only to local/server
   monitoring.
4. Disable the legacy WEBCOPY scraper as a writer before enabling this service;
   there must be exactly one canonical writer.
5. With separate explicit production authorization, verify the bot identity,
   install the Telegram webhook with the secret header and permitted update
   types, then provision any push credential through a protected server-side
   credential mechanism and enable `BOX_NEWS_GIT_PUSH=1` only after a dry run is
   accepted. Never place the credential in this repository or the unit file.
6. Verify a new post, an edit, an album, a duplicate retry, the static site build,
   and the resulting Layero deployment without exposing response bodies.

## Rollback

Stop and disable the systemd unit, remove the Telegram webhook through an
authorized hidden server-side operation, and leave push disabled. Restore the
last reviewed `content/box-news/posts.json` and cover commit with a normal Git
revert. The durable state directory can be retained for forensic ID/status
checks; it contains no raw Telegram payloads.
