# Changelog

## [Unreleased]

### Added

- Typed RU/EN dictionaries, locale persistence and browser-locale selection.
- Versioned confirmed profile content plus shared route/service states.
- A Node test runner for typed content invariants; the pre-migration baseline
  now passes `npm test`, `npm run lint`, and `npm run build`.
- Public standalone repository `yumind-vladislav/sushin-os-site` with the
  approved local checkpoint as baseline commit `095b768`.
- Canonical product brief with approved profile, CV, projects, social links,
  Random Facts, Box News, Spotify, appearance, SEO, analytics, and legal inputs.
- Interface contract for every public Sushin OS function and route.
- Phased implementation and review plan for a dedicated Berd executor session.
- Box News import/webhook contract for `@trigger4site_bot` and the existing
  Telegram Desktop export.
- Approved Project Manager CV as a semantic `/cv` route plus downloadable DOCX
  and PDF artifacts.
- Optimized portrait derivative, full About timeline, seven direct social
  channels, and contact window without a lead form.
- Five confirmed project cases with dated evidence and an intentionally
  anonymized client-work card.
- Seven grouped capability directions and the approved bilingual 20-fact pool
  with non-repeat selection, persisted sound, reduced-motion behavior, and CV
  deep links.
- Deterministic Box News history import, 130 static article routes, 74 owned
  covers, desktop pagination, self-canonical metadata, Article JSON-LD, RSS,
  sitemap, robots, manual unpublish, and a tested Netcup webhook bundle.
- User-initiated Spotify embed with loading/ready/blocked states and a static
  manual GitHub issue path that includes no visitor data.
- Original generated day/night northern-island wallpapers, automatic local
  04:00/17:00 schedule, and persisted day/night overrides.
- Typed no-op-safe Yandex Metrica adapter with the approved goal names, Do Not
  Track support, and Webvisor disabled.
- Direct Privacy and Terms routes, owner/third-party disclosures, dedicated
  legal email, accessible Legal Fold, and site-wide social metadata.

### Changed

- Removed the unowned `sushin.dev` canonical fallback in favor of an explicit
  localhost-only development origin and a required Layero production origin.
- Serialized webhook publishing across normal updates and album flushes, made
  failed-push retries push existing commits, tightened unsupported-update
  handling, validated downloaded image signatures and size, preserved album
  events accepted during a concurrent flush, and allowed the exact Git metadata
  path under systemd hardening.
- Disabled App Router prefetch for static RSS and CV PDF targets so the exported
  preview does not issue invalid RSC requests for those files.
- Expanded Privacy disclosures and official Yandex/Spotify links while keeping
  Metrica disabled pending separate consent and Russian legal review.
- Localized framework/service states, made every project card analytics event
  user-initiated through an accessible details control, and reduced Box News to
  one open event emitted by the article route.

- Migrated the build from Vinext/Vite/Cloudflare to standard Next.js App Router
  static export for the Layero handoff.
- Alternative Reality is removed from the first public release.
- `/icon-studies` and its public route components are removed.
- Target architecture is standard Next.js static generation for Layero, with a
  separate Netcup webhook ingestion service.
- Replaced profile and desktop placeholders with confirmed career copy and
  direct navigation to CV, Projects, Telegram, and contact surfaces.
- Enabled the What I Can Do Dock app and expanded Window navigation for all
  implemented desktop surfaces.
