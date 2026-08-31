# Deployment handoff

Status: the repository is locally complete and produces a static `out/`
directory. Production publishing remains a separate, explicitly authorized
operation. Nothing in this document authorizes a Layero deployment, a Netcup
change, or a Telegram `setWebhook` call.

## Layero static site

Use Node.js 22.13 or newer and install from the lockfile.

```sh
npm ci
npm test
npm run lint
npm run build
```

Layero settings:

- build command: `npm run build`;
- output directory: `out`;
- required production build variable: `NEXT_PUBLIC_SITE_URL`, set to the final
  public HTTP(S) origin with no path, query, credentials, or fragment;
- keep `NEXT_PUBLIC_YANDEX_METRICA_ID` unset. Metrica is deferred until a
  consent mechanism and Russian Federation legal review are separately
  approved.

A build made without `NEXT_PUBLIC_SITE_URL` intentionally uses
`http://localhost:3000` in canonical metadata and must not be published. Before
production approval, inspect at least the homepage, `/cv/`, `/privacy/`,
`/terms/`, one `/box-news/[id]/` article, `/sitemap.xml`, `/robots.txt`, and
`/rss.xml` on a non-production preview.

Configure and verify security headers at the Layero edge for every static route:
at minimum `X-Content-Type-Options: nosniff`, an explicit `Referrer-Policy`, a
least-privilege `Permissions-Policy`, and clickjacking protection. Develop and
test a realistic Content Security Policy against the inline Next.js bootstrap,
click-to-load Spotify frame, and still-disabled Metrica path before enforcing
it; do not weaken it with broad source wildcards or `unsafe-eval`.

## Netcup webhook bundle

The reproducible bundle lives in `services/box-news-webhook/`. Its unit tests
run as part of `npm test`; it is inert without server-side configuration and
does not install its own webhook.

For a later, separately authorized setup:

1. Stop the previous Box News writer so there is exactly one canonical writer.
2. Install the bundle and systemd unit following the service README.
3. Enter the Telegram token, webhook secret, exact channel ID, repository path,
   and state path directly through protected Netcup configuration. Do not put
   values in this repository, chat, shell history, or the unit file.
4. Provision Git push credentials through a protected server-side credential
   mechanism and verify the destination branch.
5. Verify bot identity and a dry run before enabling `BOX_NEWS_GIT_PUSH=1`.
6. Only with a separate explicit instruction, call Telegram `setWebhook` with
   the approved HTTPS endpoint, secret header, and permitted update types.
7. Verify a new post, edit, album, duplicate retry, generated static build, and
   the resulting non-production Layero preview without exposing payloads or
   logs.

## Rollback

The site is a static artifact: select the previously accepted Git commit and
rebuild it. For content-only failures, revert the focused Box News content
commit and rebuild. For webhook failures, disable the systemd service and keep
the last accepted static artifact online; do not run two writers in parallel.

## Explicitly deferred

- Layero project creation, connection, preview, and production deployment;
- Netcup filesystem, service, firewall, reverse-proxy, and credential changes;
- bot authorization and Telegram webhook installation;
- Yandex counter creation, consent work, and analytics activation;
- DNS or canonical-origin changes.
