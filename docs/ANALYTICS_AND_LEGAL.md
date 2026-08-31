# Analytics and legal operations

Status: implemented locally; Yandex counter configuration and production
deployment remain separately gated. Do not set `NEXT_PUBLIC_YANDEX_METRICA_ID`
until a consent mechanism and a legal review for the Russian Federation have
both been separately approved. The counter remains off.

## Runtime boundary

The only analytics setting is the public build variable
`NEXT_PUBLIC_YANDEX_METRICA_ID`. It must contain a positive numeric counter ID.
It is a production-only gate and must not be added to Layero or any other build
environment during the current handoff.
When the setting is absent or malformed:

- no Metrica script is added;
- no `window.ym` queue is created;
- every tracking call returns safely without network activity;
- the rest of the site behaves identically.

If the browser exposes Do Not Track as `1` or `yes`, the adapter remains off even
when a counter is configured. The approved initialization keeps Webvisor off and
enables only click/link and bounce tracking. Never pass post bodies, contact
values, free text, browser fingerprints, message content, or credentials as goal
parameters.

## Typed goals

- `cv_view` — `format: html | pdf`
- `cv_download` — `format: pdf | docx`
- `profile_open` — no parameters
- `contact_click` — allowlisted `channel`
- `project_open` — allowlisted `project_id`
- `box_news_open` — numeric Telegram `article_id`
- `social_click` — allowlisted `network`
- `music_start` — no parameters
- `music_blocked` — no parameters
- `random_fact_spin` — approved `fact_id`

Article and network IDs are goal parameters, not separate Yandex goals.

## Public legal surfaces

- `/privacy/` describes localStorage, optional Metrica visit/device data,
  Metrica cookie/localStorage anonymous identifiers, Do Not Track, Spotify
  click-to-load behavior and third-party cookies, direct official links, owner
  identity, and legal email.
- `/terms/` describes the portfolio/editorial purpose, content boundary,
  third-party names, availability, and contact path.
- The desktop Legal Fold links to both routes and
  `vladislav.sushin@icloud.com`, and is operable by keyboard.

The site has no account system, contact form, or stored inbound messages.

## Later authorized verification

1. Obtain separate approval for a consent mechanism and legal review for the
   Russian Federation.
2. Implement and verify the approved consent boundary before loading Metrica.
3. Create or select the Yandex counter outside this repository.
4. Enter the public numeric counter ID in the Layero build settings.
5. Build a preview and verify exactly one consent-gated Metrica initialization.
6. Confirm the approved goals and parameter names in a non-production check.
7. Verify that refusal and Do Not Track both suppress initialization.
8. Review `/privacy/` once more before production authorization.

No counter was created or configured during local implementation.
