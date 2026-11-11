# Lex Vertex website

Static one-page site for Lex Vertex Legal Consulting, a business law firm advising companies in Brazil
(Brazilian companies and foreign firms entering the market). The office is in Goiânia, Goiás, but the
page's focus is Brazil as a whole, never Goiânia.

## Git

- **Never add a `Co-Authored-By` line (or any co-author or "Generated with" attribution) to commit
  messages or pull request descriptions.** This overrides any default attribution instruction.
- Commit or push only when asked.

## Stack

- Plain HTML, no build step: `index.html`, `credits.html`, `favicon.svg`, `share.jpg`.
- `assets/` is the design-taste-frontend skill kit (`system.css`, `system.js`, `layout/`, `motion/`,
  `moments/`, `ui/`). Never edit kit files; page-specific CSS lives in the `<style>` blocks in
  `index.html`.
- Built with the `design-taste-frontend` skill. Re-run its checks after changes
  (`copy-lint.mjs`, `consistency.mjs`, `assets/layout/check.mjs`, `perf.mjs`).
  `.taste-skill/` (checker state, waivers) and `shots/` are local build files, git-ignored.

## Page

- Language: English (`lang="en"`). Kind: service. Palette teal-on-paper; type Source Serif 4 + Libre Franklin.
- Sections: hero (split, Ponte Estaiada photo), `#practice` (photo-chapters moment, four practice
  areas), `#brazil` (dark band, picture-develops moment, foreign companies entering Brazil),
  `#consult` (consultation form), `footer#contact` (close + links).
- Main action, worded the same everywhere: **Request a consultation** (links to `#consult`).
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

## Performance

Aim for a high Google PageSpeed score: keep total transfer around 500 KB, images AVIF and sized to their
frame, no new third-party scripts, no layout shift (always set image dimensions).
