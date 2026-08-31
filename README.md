# Sushin OS site

Repository: [yumind-vladislav/sushin-os-site](https://github.com/yumind-vladislav/sushin-os-site).

Standalone localhost-first implementation of the Sushin OS personal site. The editable 19-scene design presentation remains in the root project at `app/sushin-os/` and is not imported into this application.

## Routes

- `/` — statically generated Sushin OS desktop;
- `/cv` — standalone semantic Russian HTML CV with stable section anchors;
- `/box-news/[id]` — 130 build-time Russian Box News articles with stable URLs;
- `/privacy` and `/terms` — directly reachable legal/privacy documents;
- `/rss.xml`, `/sitemap.xml`, `/robots.txt` — static discovery surfaces;
- framework-native 404 — includes the removed `/icon-studies` route.

## Current slice

- selected direction A (`Catalina Object Fidelity`) as the working icon layer;
- one-viewport Catalina desktop with a translucent compact menu bar, central Music Utility notch, Dock, Aqua/Dark Aqua and local time zone;
- draggable, focusable, closable, minimizable and zoomable windows with persisted local state;
- `Random Fact → Vladislav` deep-link flow;
- one-window mobile mode with internal window scrolling;
- Interaction Pass 01: phased open, close, minimize, restore and maximize motion, isolated single-item Dock response, functional System/File/View/Window menus and persisted Catalina day/night state;
- a reduced-motion path for window, Dock, menu and wallpaper transitions;
- standard Next.js App Router with static export output in `out/`;
- typed RU/EN UI foundation with browser-language default and persisted manual
  override;
- confirmed bilingual profile content and dynamic age calculation;
- approved portrait derivative, full About timeline, direct contact/social
  surfaces, and Project Manager CV in HTML, PDF, and DOCX formats;
- five confirmed project cases, seven capability directions, and a bilingual
  20-fact roulette with persisted sound preference and supported CV deep links;
- a user-initiated Spotify capsule with loading, ready, blocked, retry and manual
  issue-report paths; no iframe or Spotify request exists before the first click;
- an original generated northern-island day/night wallpaper pair with automatic
  local 04:00/17:00 switching and persisted manual override;
- a typed Yandex Metrica adapter that is a complete no-op without its public
  counter ID, honors Do Not Track, disables Webvisor, and sends allowlisted IDs
  rather than content or user input; the counter remains off pending separate
  consent-mechanism approval and Russian Federation legal review;
- an accessible keyboard-operable Legal Fold plus direct Privacy/Terms routes,
  owner identity, third-party disclosures, and the dedicated legal email;
- deterministic Box News import for retained Telegram IDs 575–716 plus approved
  WEBCOPY IDs 717–719, 74 site-owned cover copies, desktop pagination, article
  metadata/JSON-LD and manual unpublish support;
- a tested, inert-by-default Netcup webhook bundle for new posts, edits, albums,
  durable retry handling and optional Git publishing;
- shared loading, unavailable, malformed-content, empty and not-found states.

## Canonical implementation brief

- `docs/PRODUCT_BRIEF.md` — every content and product answer approved on 2026-08-31;
- `docs/INTERFACE_CONTRACT.md` — required behavior for each window, route and service state;
- `docs/BOX_NEWS_PIPELINE.md` — Telegram import and `@trigger4site_bot` webhook contract;
- `docs/IMPLEMENTATION_PLAN.md` — plan-mode phases, acceptance criteria and review protocol;
- `docs/EXECUTOR_HANDOFF.md` — bounded instructions for the dedicated Berd implementation session;
- `docs/DEPLOYMENT_HANDOFF.md` — production-only Layero, Netcup, canonical-origin, and analytics gates.

The approved local implementation may proceed. Public code-repository setup is approved. Layero deployment, Netcup mutation, Telegram webhook installation and production publishing remain separately gated.

## Local commands

```bash
npm test
npm run dev
npm run lint
npm run build
npm run box-news:import -- --source /absolute/private/result.json \
  --legacy /absolute/legacy/posts.json \
  --output content/box-news/posts.json \
  --covers public/media/box-news \
  --report tmp/box-news-import-report.json
npm run box-news:unpublish -- --id 000
npm start # preview the generated out/ directory
```

No deployment or production publishing is configured or approved.
Layero must receive the real production origin through
`NEXT_PUBLIC_SITE_URL`; the built-in `http://localhost:3000` origin is only for
local checks and must never be published. `NEXT_PUBLIC_YANDEX_METRICA_ID` must
remain unset until the separately approved consent and legal gates are complete.
Box News operations and the deferred server handoff are documented in
`docs/BOX_NEWS_OPERATIONS.md`.
Analytics and legal behavior are documented in `docs/ANALYTICS_AND_LEGAL.md`.
The exact Layero/Netcup credential and deployment gates are documented in
`docs/DEPLOYMENT_HANDOFF.md`.

## Local browser note

Phantom can conflict with another wallet extension while both inject `window.ethereum`. On localhost, the app prevents only Phantom's exact `Cannot redefine property: ethereum` event from opening the development error overlay. The guard is restricted to extension ID `bfnaelmomeimhlpmgjnjophhpkkoljpa` and local hostnames; application errors are not suppressed. If Phantom itself is needed for Web3 testing, disable the competing wallet extension or use a dedicated Chrome profile.

## Assets

- Editable icon source: `public/icons/source/icon-studies.svg`;
- licensing notes: `ICON_LICENSES.md`;
- source and transformation records: `docs/ASSET_PROVENANCE.md`;
- full wallpaper prompts and visual QA: `docs/WALLPAPER_GENERATION.md`.
