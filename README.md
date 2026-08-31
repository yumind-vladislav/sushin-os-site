# Sushin OS site

Repository: [yumind-vladislav/sushin-os-site](https://github.com/yumind-vladislav/sushin-os-site).

Standalone localhost-first implementation of the Sushin OS personal site. The editable 19-scene design presentation remains in the root project at `app/sushin-os/` and is not imported into this application.

## Routes

- `/` — current production-shaped desktop slice;
- `/icon-studies` — archived comparison sheet and recorded icon decision.

## Current slice

- selected direction A (`Catalina Object Fidelity`) as the working icon layer;
- one-viewport Catalina desktop with a translucent compact menu bar, central Music Utility notch, Dock, Aqua/Dark Aqua and local time zone;
- draggable, focusable, closable, minimizable and zoomable windows with persisted local state;
- `Random Fact → Vladislav` deep-link flow;
- one-window mobile mode with internal window scrolling;
- Interaction Pass 01: phased open, close, minimize, restore and maximize motion, isolated single-item Dock response, functional System/File/View/Window menus and persisted Catalina day/night state;
- a reduced-motion path for window, Dock, menu and wallpaper transitions;
- explicit placeholders for unconfirmed biography, photo and birth year.

The Music Utility is intentionally non-interactive in this checkpoint. A user-initiated capsule with visible Spotify Embed is the next integration slice.

## Canonical implementation brief

- `docs/PRODUCT_BRIEF.md` — every content and product answer approved on 2026-08-31;
- `docs/INTERFACE_CONTRACT.md` — required behavior for each window, route and service state;
- `docs/BOX_NEWS_PIPELINE.md` — Telegram import and `@trigger4site_bot` webhook contract;
- `docs/IMPLEMENTATION_PLAN.md` — plan-mode phases, acceptance criteria and review protocol;
- `docs/EXECUTOR_HANDOFF.md` — bounded instructions for the dedicated Berd implementation session.

The approved local implementation may proceed. Public code-repository setup is approved. Layero deployment, Netcup mutation, Telegram webhook installation and production publishing remain separately gated.

## Local commands

```bash
npm run dev
npm run lint
npm run build
```

No deployment or production publishing is configured or approved.

## Local browser note

Phantom can conflict with another wallet extension while both inject `window.ethereum`. On localhost, the app prevents only Phantom's exact `Cannot redefine property: ethereum` event from opening the development error overlay. The guard is restricted to extension ID `bfnaelmomeimhlpmgjnjophhpkkoljpa` and local hostnames; application errors are not suppressed. If Phantom itself is needed for Web3 testing, disable the competing wallet extension or use a dedicated Chrome profile.

## Assets

- Editable icon source: `public/icons/source/icon-studies.svg`;
- licensing notes: `ICON_LICENSES.md`;
- the remote Catalina day/night wallpapers are localhost-only references and must be replaced with an owned or licensed pair before publication.
