# Sushin OS — final implementation plan

Status: GO approved for local implementation and repository setup on
2026-08-31. Production deployment remains separately gated.

## Goal

Deliver a complete, tested Sushin OS portfolio that prioritizes employment and
CV conversion, preserves the approved Catalina desktop interaction model,
publishes indexable Box News articles from Telegram, and is ready for Layero and
Netcup configuration without exposing credentials or changing production.

## Architecture decision

The current checkpoint uses `vinext`, Vite, and a Cloudflare Worker-oriented
build. The selected host is Layero and Box News should be build-time static
content. The implementation therefore migrates the site to a standard Next.js
App Router build with static generation/export where compatible.

Reasons:

- stable indexable `/box-news/[id]` pages;
- content present in generated HTML;
- no public runtime dependency on Telegram or Netcup;
- Git-reviewed content history;
- simpler Layero deployment;
- webhook secrets remain isolated on Netcup.

Capture a passing baseline before migration. Preserve the current visual and
interaction behavior instead of rebuilding from a starter theme. Remove legacy
Sites/Cloudflare configuration only after the standard Next build and preview
are working.

## Execution phases

### Phase 0 — repository and baseline

Baseline captured before standalone repository initialization:

- `npm run lint` — passed on 2026-08-31;
- `npm run build` — passed on 2026-08-31;
- current build routes: `/` and `/icon-studies`;
- `npm test` — not yet available and must be added by the executor.

- Confirm the standalone Git repository and clean ignore rules.
- Record a baseline `npm run lint` and `npm run build`.
- Add a real `npm test` command.
- Preserve the current UI before architectural changes.
- Do not commit generated traces, build output, private exports, or secrets.

Acceptance:

- source checkout is reproducible;
- current primary route compiles;
- tests/lint/build commands have documented outcomes.

### Phase 1 — framework, data, and localization foundation

- Migrate from vinext/Cloudflare Vite to standard Next.js App Router for
  Layero-oriented static generation.
- Add typed RU/EN dictionaries, browser-locale default, manual persisted switch,
  and Russian-content labels.
- Replace placeholder profile/content data with versioned typed content.
- Remove `/icon-studies` and Alternative Reality from the public route graph.
- Add not-found and shared loading/empty/error primitives.

Acceptance:

- no regression in desktop/window behavior;
- RU/EN switch works without hydration flash;
- `/icon-studies` returns not found and is absent from navigation/sitemap;
- test/lint/build pass.

### Phase 2 — career conversion surfaces

- Integrate the optimized portrait.
- Implement Vladislav/About with dynamic age and `open to work`.
- Regenerate Project Manager PDF/DOCX public artifacts with Gmail, keeping source
  files untouched.
- Build semantic Russian HTML CV with anchors.
- Implement PDF/HTML preview and DOCX download.
- Implement Social Media and Write to Me with direct links only.

Acceptance:

- primary flow CV → Projects → Telegram is obvious on desktop and mobile;
- every public CV version uses Gmail and states August 2026;
- education says incomplete higher education, 2017–2021;
- no contact form or accidental personal-data storage;
- test/lint/build and browser flow pass.

### Phase 3 — projects, skills, and Random Fact

- Implement the five approved project cards with exact metrics and chronology.
- Implement grouped What I Can Do directions.
- Replace temporary system facts with the approved 20-fact pool.
- Preserve roulette, non-repeat behavior, sound consent, and reduced motion.
- Add supported CV deep-links.

Acceptance:

- `96 + 1` is never labelled MAU or active users;
- every dated metric shows its date;
- anonymous client work contains no invented results/assets;
- Random Fact keyboard, sound, and reduced-motion tests pass.

### Phase 4 — Box News and SEO

- Implement the private-export importer and normalized schema.
- Import retained IDs 575–716 and merge later content through 719.
- Add Box News window, `/box-news/[id]`, canonical metadata, Article JSON-LD,
  Open Graph/X, sitemap, robots, and RSS.
- Add pagination; defer search/categories/filters.
- Add the reproducible Netcup webhook bundle for `@trigger4site_bot`, but do not
  deploy or install a webhook.
- Add edit replacement and manual unpublish behavior.

Acceptance:

- raw Telegram export is not committed;
- generated articles are available in build output without client fetching;
- cover paths are site-owned;
- hidden posts are absent from all discovery surfaces;
- importer, schema, metadata, and representative article tests pass.

### Phase 5 — music and appearance

- Integrate the approved Spotify playlist after a user click.
- Add loading, blocked, and issue-report states.
- Generate and integrate an original owned day/night wallpaper pair.
- Implement automatic local schedule and persisted manual override.
- Remove advanced image settings from the first release.

Acceptance:

- no autoplay before interaction;
- issue link is user-initiated and contains no secrets;
- 04:00/17:00 boundary tests pass;
- owned assets have source/licensing notes;
- reduced motion and mobile layout pass.

### Phase 6 — analytics, legal, and final states

- Add a no-op-safe typed Yandex Metrica adapter and approved events.
- Add Privacy, Terms, owner identity, third-party disclosures, and legal email.
- Implement accessible Legal Fold last.
- Finalize 404, loading, empty, malformed-content, and Spotify-blocked copy.
- Add site-wide and per-article social metadata.

Acceptance:

- site works without a Metrica counter ID;
- event parameters are typed and contain no sensitive content;
- legal content is reachable without interacting with the desktop fold;
- metadata matches each checked route.

### Phase 7 — final verification and handoff

- Run `npm test`, `npm run lint`, and `npm run build` from a clean checkout.
- Browser-test desktop and mobile primary flows, window interactions, language,
  CV, projects, facts, Box News, music blocked state, and legal routes.
- Check keyboard-only and reduced-motion paths.
- Check there are no console errors from the application.
- Audit tracked files for secrets and generated/private artifacts.
- Update README, CHANGELOG, status, and deployment instructions.

Acceptance:

- all checks pass;
- no production deploy occurred;
- remaining actions are only credential installation, Layero connection,
  Yandex counter ID, and explicit deployment approval.

## Review workflow

1. One Berd implementation session owns all source edits.
2. It reads the canonical docs and creates an internal plan before editing.
3. It commits each completed phase with a focused message after checks pass.
4. The current orchestration session reviews commits/diffs and test evidence.
5. Required fixes are sent back to the same implementation session.
6. The orchestration session stays read-only for site source during execution.
7. Production actions remain blocked until Vladislav gives a separate command.

This satisfies the requested `one implementation chat -> one review chat`
model while retaining phase checkpoints inside one continuous execution context.
