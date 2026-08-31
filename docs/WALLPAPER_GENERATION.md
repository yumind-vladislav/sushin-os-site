# Wallpaper generation record

Date: 2026-08-31  
Mode: built-in `image_gen`  
Final format: WebP, 1672 × 941 px, no resize

## Day prompt

```text
Use case: photorealistic-natural
Asset type: wide desktop operating-system wallpaper, landscape 16:9
Primary request: an entirely original fictional northern sea island and rugged rocky shoreline, designed as a calm desktop wallpaper
Scene/backdrop: cold open northern sea, a low weathered dark-stone island with sculptural sea cliffs and a narrow natural inlet, distant horizon under layered overcast daylight; the place must be fictional and not recognizable
Subject: the island and shoreline only, with restrained natural detail and subtle sea mist
Style/medium: subtle cinematic photographic realism with a tasteful slightly surreal atmosphere; convincing wet basalt, muted water texture, gentle filmic depth; sophisticated and understated, not fantasy concept art
Composition/framing: ultra-wide establishing view at eye level, cohesive continuous landscape, low-to-mid horizon; clean low-contrast negative space across broad sky and calm water for desktop icons and windows; no important focal details near screen edges
Lighting/mood: cool late-afternoon daylight filtered through soft clouds, quiet, contemplative, crisp but not harsh
Color palette: deep navy, steel blue, slate, charcoal, tiny restrained cold-silver highlights
Materials/textures: naturally fractured wet rock, fine sea haze, softly rippled water, realistic cloud layers
Constraints: original fictional geography; no direct copy or visual quotation of macOS Catalina or any recognizable real wallpaper; no people; no animals; no buildings; no boats; no roads; no artificial objects; no logos; no text; no watermark; no borders; usable as a clean premium desktop wallpaper
Avoid: tropical colors, warm sunset, exaggerated fantasy formations, dramatic lightning, giant moon, stars, aurora, excessive fog, oversaturated teal, crushed blacks, clutter
```

## Night edit prompt

```text
Use case: lighting-weather
Asset type: matching night version of the same wide desktop operating-system wallpaper
Input images: Image 1 is the edit target and exact composition anchor
Primary request: transform the scene into a quiet northern night while preserving the landscape exactly
Lighting/mood: cool moonless blue-hour-to-night ambient light behind layered clouds, subtle silvery cloud glow and restrained reflected light on the water; contemplative, cinematic, legible, not pitch black
Color palette: deep navy, midnight blue, blue-black slate, subtle steel-blue highlights
Constraints: change only time of day, lighting, color grade, cloud illumination, and atmospheric depth; keep every island contour, rock formation, inlet, distant landform, wave pattern, camera position, horizon, framing, crop, and composition unchanged; maintain clean low-contrast negative space for desktop icons and windows; preserve realistic wet-rock and water textures; no new elements; no people; no animals; no buildings; no boats; no artificial lights; no stars; no moon disk; no aurora; no logos; no text; no watermark; no borders
Avoid: changing geometry, moving or reshaping rocks, dramatic fantasy sky, bright celestial objects, crushed black detail, oversaturated cyan, excessive fog, warm light
```

## Visual QA

- Day and night retain the same island geometry, horizon, inlet, rock placement,
  framing, and negative-space layout.
- The night scene changes illumination and grade while keeping rock and water
  detail legible.
- Both final WebP files were inspected at original resolution after conversion.
- No people, buildings, logos, text, watermarks, recognizable geography, or
  conversion artifacts were found.
- Source generation resolution is intentionally retained; no synthetic upscale
  was applied.
