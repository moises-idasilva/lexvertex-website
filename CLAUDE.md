# Lex Vertex website

Static one-page site for Lex Vertex Legal Consulting, a business law firm advising companies in Brazil
(Brazilian companies and foreign firms entering the market). The office is in Goiânia, Goiás, but the
page's focus is Brazil as a whole, never Goiânia.

## Git

- **Never add a `Co-Authored-By` line (or any co-author or "Generated with" attribution) to commit
  messages or pull request descriptions.** This overrides any default attribution instruction.
- Commit or push only when asked.

## Stack

- Plain HTML; the only build step is `node tools/build-i18n.mjs` for the translated pages. Root files: `index.html`, `credits.html`, `favicon.svg`, `share.jpg`, `sitemap.xml`.
- `assets/` is the design-taste-frontend skill kit (`system.css`, `system.js`, `layout/`, `motion/`,
  `moments/`, `ui/`). Never edit kit files; page-specific CSS lives in the `<style>` blocks in
  `index.html`.
- Built with the `design-taste-frontend` skill. Re-run its checks after changes
  (`copy-lint.mjs`, `consistency.mjs`, `assets/layout/check.mjs`, `perf.mjs`).
  `.taste-skill/` (checker state, waivers) and `shots/` are local build files, git-ignored.

## Languages

- Six static pages: English (UK, `en-GB`) at the root `index.html`, plus `es/` (es-ES), `fr/` (fr-FR),
  `pt-br/` (pt-BR), `de/` (de-DE) and `zh/` (zh-CN, Simplified Chinese).
- **`index.html` (English) is the only source. Never edit the files in the language folders by hand.**
  Edit `index.html`, add or change the translation in every `i18n/<lang>.json` (keys are the exact
  English text), then run `node tools/build-i18n.mjs`. The build stops with an error listing any
  English string that has no translation.
- The build also writes the generated blocks between `<!--i18n:...-->` markers (canonical and hreflang
  links, the nav language menu, the footer language row with flags). Don't edit those blocks by hand.
- Flags are small local SVGs in `flags/`. Chinese uses the system's CJK fonts (no extra download).
- `sitemap.xml` lists every language version with its hreflang alternates.
- The skill's copy checks (`copy-headline`, `copy-fact`, `copy-headings`) only understand English, so they
  flag the translated pages falsely. Layout and consistency checks pass on all six languages.

## Page

- Source language: English (`lang="en-GB"`). Kind: service. Palette teal-on-paper; type Source Serif 4 + Libre Franklin.
- Sections: hero (split, Ponte Estaiada photo), `#practice` (photo-chapters moment, four practice
  areas), `#brazil` (dark band, picture-develops moment, foreign companies entering Brazil),
  `#consult` (consultation form), `footer#contact` (close + links).
- Main action, worded the same everywhere: **Request a consultation** (links to `#consult`).
- No phone action bar (`nav.actionbar`): on phones the header shows the logo and the menu button, and the
  main action sits in the hero and the menu sheet. Gate waivers (max 5) live in `.taste-skill/waivers.json`.
- Form posts via `mailto:moises@lexvertex.com`; WhatsApp link `https://wa.me/5562992818615`
  (never print the number or the email on the page).

## Images

- Every photograph is **AVIF**, in `assets/img/photo-<id>-<width>.avif`, served with `srcset`/`sizes`,
  `width`/`height`, `loading="lazy"` (hero: eager, `fetchpriority="high"` and preloaded).
- Encode with ffmpeg (libsvtav1), e.g.
  `ffmpeg -i src.jpg -vf "scale=1280:-2:flags=lanczos,format=yuv420p" -c:v libsvtav1 -crf 34 -preset 4 -frames:v 1 out.avif`.
- All current photographs are licensed stand-ins from Wikimedia Commons, credited in `credits.html`
  (regenerate with the skill's `photos.mjs credits --out . --write`). Replace them with the firm's own
  photographs when available. No AI-generated images, no composites, no stock faces shown as the team.
- `images/logo.png` is the client's logo (white outline on transparent; unusable on the light ground);
  the nav uses the `arc` mark with the name until a dark or SVG version exists.

## SEO and AI search

- Every page has a canonical URL, hreflang links for all six languages, Open Graph and Twitter tags, and
  `robots` meta; `credits.html` is `noindex, follow`.
- JSON-LD (`LegalService` with its services, `WebSite`, `WebPage`) is generated per language by
  `tools/build-i18n.mjs` from the same translations; edit the `SERVICES` list there when a practice area changes.
- `robots.txt` allows all crawlers, AI crawlers included, and points to `sitemap.xml` (update its
  `lastmod` dates when content changes). `llms.txt` is the plain-text summary for AI assistants: keep it
  in step with the page.
- Domain used everywhere: `https://www.lexvertex.com/`.

## Performance

Aim for a high Google PageSpeed score: keep total transfer around 500 KB, images AVIF and sized to their
frame, no new third-party scripts, no layout shift (always set image dimensions).
