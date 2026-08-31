# Sushin OS — agent instructions

This repository is the standalone implementation of Vladislav Sushin's public
portfolio site. The parent workspace instructions still apply when this folder
is used inside `Creative space`.

## Before changing code

1. Run `git status --short --branch` and preserve unrelated work.
2. Read, in order:
   - `docs/PRODUCT_BRIEF.md`;
   - `docs/INTERFACE_CONTRACT.md`;
   - `docs/IMPLEMENTATION_PLAN.md`;
   - `docs/BOX_NEWS_PIPELINE.md`;
   - `docs/EXECUTOR_HANDOFF.md`;
   - `README.md`.
3. Treat Git and tests as the source of truth for implementation. Notion is the
   operational content source; Obsidian is the source for confirmed voice and
   personal principles. Do not edit either without explicit approval.

## Ownership and workflow

- One Berd implementation session owns site-source edits at a time.
- The orchestration/review session performs read-only review and sends required
  fixes back to the implementation session.
- Keep changes phase-scoped and commit only after the phase checks pass.
- Do not deploy to Layero, configure Netcup, call Telegram `setWebhook`, or
  publish production without a separate explicit instruction.

## Secrets and private inputs

- Never request or accept a Telegram bot token in chat.
- Never read, print, commit, or log `.env*`, access tokens, webhook secrets,
  server credentials, raw private payloads, or local chat exports.
- The Telegram Desktop export is an import source only. Normalize it into the
  public Box News schema; never commit the raw export.
- Store future secrets directly in Netcup/GitHub environment configuration via
  a hidden prompt or user-controlled settings surface.

## Required checks

- `npm test`
- `npm run lint`
- `npm run build`
- Browser verification for desktop and mobile primary flows.

The project must keep a reduced-motion path, keyboard access, one-window mobile
behavior, and stable URLs for Box News articles.
