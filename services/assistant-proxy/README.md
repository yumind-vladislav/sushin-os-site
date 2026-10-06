# Rover assistant proxy

A small, dependency-free Node service that lets the static Sushin OS site talk
to an LLM through OpenRouter without exposing the API key to visitors. It is
inert until a server operator supplies configuration and starts it. Nothing in
this directory deploys or configures Netcup.

## Behavior

- `POST` on the configured path only; `OPTIONS` answers CORS preflight;
- accepts requests only from `ASSISTANT_ALLOWED_ORIGINS`;
- body ≤ 16 KiB, ≤ 8 messages, ≤ 600 characters each; client roles other than
  `user`/`assistant` are downgraded to `user`, so a visitor cannot inject a
  system message;
- the system prompt (`src/os-guide.mjs`) lives on the server and lists every
  Sushin OS window; `tests/assistant.test.ts` keeps it in sync with
  `content/apps.ts`;
- replies may end with `[[open:<app>]]`, `[[wallpaper:next]]` or
  `[[theme:toggle]]`; the client executes only those known tokens;
- per-address limit (default 8/min) and a global daily cap (default 500) bound
  the cost;
- never logs prompts, replies, the API key or client addresses — only the
  failure class.

The site falls back to built-in offline answers whenever the proxy is absent or
fails, so the OS stays usable without it.

## Server configuration

Create `/etc/sushin-assistant-proxy.conf` on the server with mode `0600`. Enter
values directly in the server's protected configuration surface — not in chat,
Git, shell history, or this repository:

```text
OPENROUTER_API_KEY
ASSISTANT_ALLOWED_ORIGINS   # e.g. https://sushin.dev
```

Optional: `OPENROUTER_MODEL` (default `deepseek/deepseek-v4-flash`),
`ASSISTANT_PATH` (default `/assistant`), `PORT` (default `8788`, bound to
127.0.0.1), `ASSISTANT_TRUST_PROXY=1` behind the HTTPS reverse proxy,
`ASSISTANT_RATE_PER_MINUTE`, `ASSISTANT_DAILY_CAP`.

Set a spending limit on the OpenRouter key itself as the final guard.

## Site configuration

Build the site with the public proxy URL:

```text
NEXT_PUBLIC_ASSISTANT_URL=https://<public-host>/assistant
```

Without it, Rover and Spotlight use offline answers. Add the proxy origin to
the site's `connect-src` when the Content Security Policy is enforced.

## Local verification

```bash
npm test
node --check src/server.mjs
```

## Later authorized installation

1. Create the `sushin-assistant` system user and use the existing checkout
   below `/opt`.
2. Install the unit file and the protected configuration.
3. Route only `POST/OPTIONS <ASSISTANT_PATH>` from the HTTPS reverse proxy to
   `127.0.0.1:8788`.
4. Rebuild the site with `NEXT_PUBLIC_ASSISTANT_URL` and verify a question,
   an `open` action, the rate limit, and the offline fallback.
