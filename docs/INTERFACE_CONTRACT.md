# Sushin OS — interface contract

Status: implementation contract for the approved 2026-08-31 brief.

## Global shell

- One viewport; the document itself does not become a long scrolling landing
  page.
- Desktop: multiple draggable, focusable, minimizable, closable, and zoomable
  windows with safe bounds and persisted state.
- Mobile: preserve the desktop metaphor but keep one near-fullscreen window
  open at a time; long content scrolls inside it.
- Keep Catalina Object Fidelity, the original icon system, Dark Aqua/Aqua,
  subtle material depth, isolated Dock hover, and existing motion language.
- Keep keyboard access, visible focus, touch targets, reduced motion, and usable
  internal scroll boundaries.
- Local preferences may use `localStorage`; no account or server profile.

## Menu bar and system controls

### OS mark

Keeps the current mark and opens a small application menu. Do not include
Alternative Reality or the archived icon study.

### Language

RU/EN switch with browser-language default and persisted manual override.

### Appearance

Manual day/night override plus automatic 04:00/17:00 schedule. No advanced
image controls in the first release.

### Time

Show the visitor's local time/date. If the browser cannot provide it, use
`Europe/Moscow`. Do not show Vladislav's city.

### Music Utility

Compact central notch/capsule. Initial state shows `загружаем треки, будь
готов`; click reveals/starts the official Spotify embed. Include loading,
ready, and blocked states. Blocked state offers a user-initiated prefilled
GitHub issue link.

## Windows and applications

### Random Fact

- Active core entry point.
- Uses the approved 20-fact pool.
- Counter format `01 / 20`.
- Random slowing roulette, never immediately repeats the current fact.
- Mute/unmute control; preference defaults to sound on.
- Synthetic sound begins only after a user gesture.
- Reduced motion switches immediately without intermediate roulette frames.
- CV deep-link appears only for a CV-confirmed fact.

### Vladislav / About

- Portrait, bilingual name, public role, dynamic age, and `open to work`.
- Short summary first, then a compact career timeline and personal paragraph.
- Primary CTA order: CV → Projects → Telegram.
- No city. Visitor time stays in the system control, not in the bio.

### CV Finder

- One Project Manager CV, Russian-only label.
- Tabs or segmented navigation for HTML and PDF preview.
- DOCX download is the download CTA.
- Clearly show `Актуально: август 2026` and Russian availability on English UI.
- HTML CV is an accessible semantic document with stable section anchors for
  supported Random Fact deep-links.

### Projects

First release cards:

1. YUMIND.
2. `@yumind_bot / Mini App`.
3. YUMIND Reborn.
4. Crypto project.
5. Selected client work.

Each card separates role, period, challenge, contribution, proof, status, and
links. Never label access counts as active users. Anonymous client work has no
invented metrics or assets.

### What I Can Do

Group approved directions into Project Delivery, Product Work, AI Systems,
Development Workflow, Knowledge Systems, Research, and AI-assisted Creative
Work. Make the difference between capability areas and tool names clear.

### Social Media

Show the seven approved channels in the fixed order from the product brief.
Each entry includes display name, one-sentence purpose, external-link behavior,
and an analytics event.

### Write to Me

No form. Provide the primary personal Telegram CTA, Gmail, and a smaller link to
the Telegram blog. Explain expected use briefly.

### Box News

- Window shows a chronological list of posts with cover when available, date,
  title, preview, and source indicator.
- Every item links to `/box-news/{telegram-message-id}`.
- Article pages are real server/static routes outside the desktop-only client
  state, with self-canonical metadata, Open Graph/X fields, Article JSON-LD,
  source link, published/edited dates, previous/next navigation, and inclusion
  in sitemap/RSS.
- No categories, search, or filters in MVP.
- A manual deny-list/unpublish state prevents a removed article from entering
  navigation and sitemap.

### Legal Fold

Final implementation stage. Accessible Privacy, Terms, analytics/cookie
information, owner identity, and the iCloud legal email. No contact form.

## Removed or deferred

- `/icon-studies`: remove from the public build.
- Alternative Reality: option A, remove for this release.
- Dashboard, Chats, Finder, Internet Explorer, and Karaoke: out of scope.
- Search/filter for Box News: defer.
- Custom wallpaper upload and intensity controls: defer.
- Contact form: explicitly excluded.

## Routes

Required public routes:

- `/` — Sushin OS desktop.
- `/cv` — stable HTML CV route or route-level preview target.
- `/box-news/[id]` — indexable Box News articles.
- `/privacy` and `/terms` — accessible legal documents, even if opened from the
  Legal Fold UI.
- `/404` through framework-native not-found handling.
- `/sitemap.xml`, `/robots.txt`, and `/rss.xml`.

No public `/icon-studies` route.

## Analytics events

Use a small typed analytics adapter so the UI works when Metrica is absent.

- `cv_view` with `format`.
- `cv_download` with `format`.
- `profile_open`.
- `contact_click` with `channel`.
- `project_open` with `project_id`.
- `box_news_open` with `article_id`.
- `social_click` with `network`.
- `music_start`.
- `music_blocked`.
- `random_fact_spin` with `fact_id`.

Do not create a separate Yandex goal per article or social network; pass IDs as
parameters.

## Service states

Every data-bearing or embedded surface must define:

- loading;
- empty;
- blocked/unavailable;
- malformed content fallback;
- keyboard/reduced-motion behavior.

Service copy may be original and concise. Do not invent product facts in an
empty or error state.
