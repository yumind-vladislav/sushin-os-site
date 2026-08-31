# Asset provenance

This register covers public derivatives committed to this repository. Originals
remain outside the repository and are never modified.

## Profile portrait

- Public file: `public/media/profile/vladislav-sushin.jpg`
- Source: user-approved local portrait
  `photo_2026-08-31_13-06-39.jpg` from the Telegram Desktop downloads folder
- Source SHA-256:
  `964bd640f18ef78683d281b606f04dc8528a5091e890c2224c88fbb5a5752997`
- Derivative SHA-256:
  `96ecb306db9f9a3d0e3372a5edd3508383f503beb8332e37a05022405f8c7338`
- Transformation: `sips` JPEG conversion, proportional resize to 720 px wide,
  and public derivative copy only
- Output: 720 × 960 px JPEG
- Rights: supplied and approved by the site owner for this portfolio
- Recorded: 2026-08-31

## Wallpapers

- Public files:
  - `public/wallpapers/northern-island-day.webp`
  - `public/wallpapers/northern-island-night.webp`
- Source: original AI-generated fictional northern-island scene; no source or
  reference image was supplied
- Tool mode: built-in `image_gen`; day generated as `photorealistic-natural`,
  night created as a `lighting-weather` edit of the selected day so composition
  and geography stay aligned
- Output: both files are 1672 × 941 px WebP; converted from generated PNG with
  `cwebp -q 94 -m 6 -sharp_yuv`, without resizing
- SHA-256 day:
  `2b2504d0c923a440eb3c97b7c4d3df7d20d801d3a989c8df4d58e191e2ded82c`
- SHA-256 night:
  `bf1ccd4f89d84e21c0ad502eb4ea1bf219b110e6b259c0194050f80d80741504`
- Constraints: fictional geography; no direct Catalina/macOS wallpaper copy;
  no text, marks, people, buildings, or third-party source assets
- Full prompts and visual QA record: `docs/WALLPAPER_GENERATION.md`
- Rights: original project-owned pair generated for and approved for use on the
  site owner's portfolio
- Recorded: 2026-08-31

## Box News covers

- Public directory: `public/media/box-news/`
- Source: owner-controlled photos embedded in the approved private Telegram
  Desktop export
- Derivation: deterministic copy by stable Telegram message ID; the raw export,
  Telegram HTML, temporary CDN URLs, absent large files, and videos are not
  included
- Output: 74 site-owned cover files, 7.7 MB total
- Aggregate SHA-256 of the sorted per-file checksum manifest:
  `cb8bc8b4bd9de31d290fe22677b11bf53f3b23465819d77d4d2fefd80f51473f`
- Rights: supplied through and approved for the site owner's own Box News
  channel
- Recorded: 2026-08-31
