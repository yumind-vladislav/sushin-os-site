# Sushin OS icon studies — licensing

Status: direction A selected for localhost production work, 2026-08-29.

- All vector geometry in `public/icons/source/icon-studies.svg` is original project work.
- No Apple icon file, logo, trademark glyph, or traced Apple asset is included.
- macOS Catalina is used as a historical craft and interaction reference only.
- Direction A (`Catalina Object Fidelity`) was selected by Vladislav on 2026-08-29. Its original SVG symbols now power the localhost icon layer; individual delivery exports remain pending until the full object inventory is locked.
- The Catalina wallpaper shown in the component sheet is loaded as a localhost-only visual reference and must be replaced by an original or explicitly licensed day/night pair before any publication.

## Temporary ryOS raster set — localhost only (2026-10-06)

Status: chosen by Vladislav on 2026-10-06 as a **temporary, localhost-only**
layer. It must be replaced by original or explicitly licensed icons before any
publication.

- Files: `public/icons/ryos/*.png`, mapped in `content/icon-manifest.ts`
  (`temporaryIconFiles`).
- Source: `https://os.ryo.lu/icons/macosx/` (ryOS, github.com/ryokun6/ryos,
  AGPL-3.0 code). The images themselves are Mac OS X–era Apple icons and
  third-party marks (Winamp, Internet Explorer, AIM); ryOS's license does not
  grant rights to them.
- Rover: `public/assistant/rover/map.png` and `agent.json` — Microsoft Agent
  “Rover” sprite and animation data as redistributed by ryOS (originally from
  Windows XP Search). Same status: temporary, localhost only.
- This supersedes the “No copying Apple assets” criterion for local work only.
  The publication checklist still requires it.
- The files are **gitignored** because this repository is public; committing
  them would already be publication. Fetch them locally with
  `npm run assets:temporary` (`scripts/fetch-temporary-assets.mjs`).
