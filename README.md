# Sushin OS site

Repository: [yumind-vladislav/sushin-os-site](https://github.com/yumind-vladislav/sushin-os-site).

Standalone localhost-first implementation of the Sushin OS personal site. The editable 19-scene design presentation remains in the root project at `app/sushin-os/` and is not imported into this application.

## Routes

- `/` — statically generated Sushin OS desktop;
- `/cv` — standalone semantic Russian HTML CV with stable section anchors;
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
- shared loading, unavailable, malformed-content, empty and not-found states.

The Music Utility is intentionally non-interactive in this checkpoint. A user-initiated capsule with visible Spotify Embed is scheduled for Phase 5.

## Canonical implementation brief

- `docs/PRODUCT_BRIEF.md` — every content and product answer approved on 2026-08-31;
- `docs/INTERFACE_CONTRACT.md` — required behavior for each window, route and service state;
- `docs/BOX_NEWS_PIPELINE.md` — Telegram import and `@trigger4site_bot` webhook contract;
- `docs/IMPLEMENTATION_PLAN.md` — plan-mode phases, acceptance criteria and review protocol;
- `docs/EXECUTOR_HANDOFF.md` — bounded instructions for the dedicated Berd implementation session.

The approved local implementation may proceed. Public code-repository setup is approved. Layero deployment, Netcup mutation, Telegram webhook installation and production publishing remain separately gated.

## Local commands

```bash
npm test
npm run dev
npm run lint
npm run build
npm start # preview the generated out/ directory
```

No deployment or production publishing is configured or approved.

## Local browser note

Phantom can conflict with another wallet extension while both inject `window.ethereum`. On localhost, the app prevents only Phantom's exact `Cannot redefine property: ethereum` event from opening the development error overlay. The guard is restricted to extension ID `bfnaelmomeimhlpmgjnjophhpkkoljpa` and local hostnames; application errors are not suppressed. If Phantom itself is needed for Web3 testing, disable the competing wallet extension or use a dedicated Chrome profile.

## Assets

- Editable icon source: `public/icons/source/icon-studies.svg`;
- licensing notes: `ICON_LICENSES.md`;
- source and transformation records: `docs/ASSET_PROVENANCE.md`;
- the temporary Catalina day/night references are replaced by an owned pair in
  Phase 5 and must not be published before then.
