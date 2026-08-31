# Executor handoff

You are the sole implementation owner for Sushin OS. Work in this repository
only. The parent/orchestration chat will review your commits and send fixes; it
will not edit site source concurrently.

## Read first

1. `AGENTS.md`
2. `docs/PRODUCT_BRIEF.md`
3. `docs/INTERFACE_CONTRACT.md`
4. `docs/BOX_NEWS_PIPELINE.md`
5. `docs/IMPLEMENTATION_PLAN.md`
6. `README.md`

Then run `git status --short --branch`, inspect existing changes, and enter plan
mode before editing. Use the phases and acceptance criteria from the plan.

## Goal

Implement all local phases of the approved Sushin OS site in one continuous
Berd session, preserving the current Catalina Object Fidelity interaction model
and producing reviewable phase commits. Stop before any production deploy,
Layero project creation, Netcup mutation, Telegram webhook installation, or
secret entry.

## Non-negotiable constraints

- Never request the Telegram bot token in chat.
- Never read or commit `.env*`, raw private exports, server credentials, logs,
  SQLite state, generated traces, or unrelated parent-workspace changes.
- Do not edit Notion or Obsidian.
- Do not modify the original CV/photo files outside this repository.
- Use the local Telegram export only through an importer; never commit it.
- Preserve accessible window semantics, one-window mobile mode, reduced motion,
  and isolated Dock hover.
- Keep all confirmed metrics and dates exact.
- Use `е`, not `ё`, for copy written in Vladislav's voice.

## Skills and validation

- Follow the site-building workflow for the existing site, but the requested
  host is Layero, not OpenAI Sites. Do not invoke Sites hosting.
- Use the appropriate document/PDF workflow when regenerating public CV files.
- Use image generation for the owned day/night wallpaper pair; inspect the
  results before integration and document ownership/source.
- Use browser automation for the explicitly requested desktop/mobile review.
- Run `npm test`, `npm run lint`, and `npm run build` after each material phase.

## Reporting

At each phase boundary, commit only the relevant files and record:

- changed entry points;
- commands/checks and outcomes;
- screenshots or browser evidence when required;
- remaining blockers;
- confirmation that no production or external secret mutation occurred.

When all local phases pass, provide the orchestration chat a concise final
handoff with commit hashes and remaining credential/deployment steps.
