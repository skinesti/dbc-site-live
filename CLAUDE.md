# Design by Cristina — Project Notes

Marketing site for Design by Cristina: **Eleventy** static-site generator + **Decap CMS**.
Three pages — home, portfolio, pricing — plus a proxied `/resources/` blog that lives in a
separate repo (`dbc-resources`). Migrated from hand-written static HTML in Sept 2026
(Phase 1 = Eleventy conversion; Phase 2 = Decap CMS layer).

`PROJECT-NOTES.md` in this folder is the plain-English version for Cristina; this file is
the working reference.

## Commands

```
npm install            # once
npm run dev             # Eleventy dev server + live reload on :8080
npm run build           # production build -> _site/
npm run build:check     # eleventy --dryrun; the pre-commit hook runs this
npm run cms             # decap-server on :8081 for local CMS editing (see below)
```

## Layout

```
eleventy.config.js        input=src/, output=_site/, Nunjucks; passthrough list; `mdp` filter
netlify.toml              build command + Node version; pretty_urls OFF (see notes)
style.css                 ROOT — single source of truth for styling; see "style.css" below
robots.txt, sitemap.xml   ROOT — passthrough-copied verbatim
_redirects                ROOT — Netlify reads from _site/; /resources/* proxy + /images/uploads/* proxy
images/, files/           ROOT — passthrough-copied wholesale
admin/                    Decap CMS — passthrough-copied to /admin/
tools/gen-cms-config.js   regenerates admin/config.yml (run after editing the section schema)

src/
  index.njk portfolio.njk pricing.njk   the three pages: front matter + body; use the prose() macro
  site-chrome.njk                        -> /partials/site-chrome.html  (consumed by dbc-resources)
  design-settings.njk                    -> /admin/design-settings.json (consumed by admin/preview.js)
  _includes/
    base.njk               page shell (<head>, header/footer/script includes, canonical, design-vars)
    site-header.njk site-footer.njk site-script.njk   the shared chrome, ONE copy each
    prose-section.njk       prose() macro — renders a CMS section (lead-in / heading / body / button)
    design-vars.njk         turns design.json into a Google-Fonts <link> + a :root override <style>
  _data/
    site.json               nav + footer link lists (single source; header ≠ footer by design)
    design.json             global design settings (CMS: "Site Design Settings")
    copy/index.json copy/portfolio.json copy/pricing.json   prose sections (CMS: "Page Content")
```

Everything at the repo root that the deployed site needs is **passthrough-copied**, not moved —
`style.css` especially (see below). `_data/` is `copy/` not `content/` because `content` is a
reserved Eleventy data name.

## Shared nav / header / footer

The header, footer and nav `<script>` live **once** in `src/_includes/site-{header,footer,script}.njk`
and are `{% include %}`d by `base.njk`. Nav and footer **link lists** are in `src/_data/site.json`
(`navLinks`, `footLinks`) and looped in the header/footer partials — edit links there.

**Header and footer intentionally differ:** footer = the full header set **plus Portfolio**
(Portfolio is footer-only, never in the header). `navLinks` and `footLinks` are therefore not
identical arrays — that is correct, not drift. There is no `/#services` link in either.

The old `tools/sync-partials.py` + `HEADER-START`/`FOOTER-START` marker workflow is **gone**.

### `/partials/site-chrome.html` — cross-repo contract with dbc-resources

`src/site-chrome.njk` renders the header + footer + script wrapped in `<!-- HEADER-START -->` /
`FOOTER` / `SCRIPT` marker comments and publishes them at
`https://designbycristina.com/partials/site-chrome.html`. The **dbc-resources** repo fetches
that URL at build time (`scripts/fetch-header-footer.js`), rewrites root-relative links to
absolute `https://designbycristina.com/…`, and splices it into its own layout. So:

- A nav/footer change here reaches `/resources/` pages only **after** this site deploys AND
  dbc-resources rebuilds (it must be pushed/redeployed separately).
- Keep the marker comments in `site-chrome.njk` intact — the fetch script string-scans for them.
- `/partials/` is `Disallow`ed in `robots.txt` and the file carries no `<meta>`/sitemap entry.

## `style.css`

Stays physically at the repo **root**, edited in place, only passthrough-copied to `_site/`.
Reason: dbc-resources' build does `curl …/raw.githubusercontent.com/skinesti/dbc-site-live/main/style.css`
before every deploy — moving the file breaks that. It must also remain a **complete, working
stylesheet on its own** (dbc-resources gets nothing but the raw file).

Tokens on `:root` are the **defaults**; `design-vars.njk` emits a later `:root` override block
from `design.json`, so the CMS-selectable ones win at runtime:

| token        | default            | CMS control            |
|--------------|--------------------|------------------------|
| `--sans`     | Work Sans stack    | Body font              |
| `--script`   | Marck Script stack | Eyebrow font           |
| `--font-base`| `17px`             | Text size (16/17/19)   |
| `--accent`   | `#C2876F` (clay)   | Accent colour          |
| `--radius`   | `6px`              | Button radius (4/6/8)  |

`--accent` recolours only the lead-in labels, `.offer-dot`, and `#app .feature-row li::before`.
Structural `--clay` (borders, link underlines, `.tag`, hovers) is untouched by the accent setting.
Headings are **always** Playfair Display (locked, not a CMS choice).

### Buttons — `.btn-primary` / `.btn-secondary` / `.btn-tertiary`

Definitions are fixed in `style.css` and documented in `admin/config.yml`; the CMS only picks
which one per button.

- **Primary** — Clay fill, white text; Teal Deep fill on hover.
- **Secondary** — Teal Deep outline + text; fills Teal Deep with white text on hover.
  (`.btn-ghost` is kept as an alias of Secondary so old markup still works.)
- **Tertiary** — Teal Deep fill, white text, no visible border; inverts on hover to white fill
  with a Teal Deep outline + text.

### Eyebrow lead-in — font-specific treatment

`design-vars.njk` maps the **Eyebrow font** choice to a complete `.eyebrow` rule (emitted after
`style.css`, so it wins). `admin/preview.js` mirrors the same map for the CMS preview pane.

- **Marck Script** — script face, natural case, no tracking, weight 700.
- **Jost** — the site's original label treatment: `text-transform:uppercase` + `.18em`
  letter-spacing, `.84rem`, weight 500. This is the **one exception** to "no uppercase" for
  Eyebrow style.
- **Playfair Display Italic** — serif italic, natural case, no tracking, `1.2rem` — the same
  visual treatment as the Editorial lead-in (different lead-in category).

Colour is always `--accent` for all three. The "Creative Developer" hero label uses
`.eyebrow.eyebrow-plain` (Work Sans uppercase, higher specificity) and is deliberately opted
out of all of the above.

## Content model (Decap "Page Content")

Each page has one JSON file in `src/_data/copy/` with **named** section keys (not an ordered
list — prose sections are interleaved with hardcoded markup in the templates). Every section
object has the same 7 fields:

| field         | widget   | notes |
|---------------|----------|-------|
| `leadin_style`| select   | `None` / `Eyebrow` / `Editorial` |
| `leadin_text` | string   | used only when style ≠ None |
| `heading`     | string   | always Playfair Display |
| `body`        | markdown | rendered by the `mdp` filter; `\n\n` → paragraphs |
| `button_text` | string   | empty → no button |
| `button_url`  | string   | e.g. `/pricing.html`, `/#contact`, full `https://` |
| `button_style`| select   | `Primary` / `Secondary` / `Tertiary` |

Sections per file: `index.json` → hero, app, solutions, services, about, contact ·
`portfolio.json` → hero, cases, clients, closing · `pricing.json` → hero, howItWorks, closing.

`prose(section, level="h2", bodyClass="", headingClass="")` in `prose-section.njk` renders
lead-in → heading → body → optional button. `level="h1"` + `bodyClass="lede"` +
`headingClass="h1-compact"` are used on the portfolio/pricing heroes.

**Hardcoded, NOT CMS-editable this phase** (a later phase): the Solutions cards, the Brand Edit
offer-list, the `#app` feature list + phone images + the inline italic "Clarafide" span, the
portfolio case studies + client list, the pricing `.service` blocks, the contact form, and the
home hero's second italic tagline line. The home hero and `#app` use inline `{{ copy.… }}`
field refs (not the macro) because their surrounding markup is bespoke.

**Deliberate visual changes from the pre-CMS site:** Primary/Secondary buttons restyled to
Clay / Teal-Deep-outline; "Introducing Clarafide" is now `Editorial` (Playfair italic) instead
of a script eyebrow. Everything else renders byte-for-byte as before at the default settings.

## Site Design Settings (Decap "design" collection)

Single file `src/_data/design.json`, one CMS entry, no preview pane. Fields: `eyebrow_font`,
`body_font`, `text_size`, `accent_color`, `button_radius` — see the `style.css` table above.
Applied globally by `design-vars.njk`. `src/design-settings.njk` also publishes the same JSON
at `/admin/design-settings.json` so `admin/preview.js` can reflect the eyebrow-font choice in
the Page Content preview (it reads the **saved** value — updates after Save + rebuild).

## Decap CMS (`admin/`)

- **Backend: GitHub OAuth** (`backend: { name: github, repo: skinesti/dbc-site-live, branch: main }`).
  The OAuth app's callback is `https://api.netlify.com/auth/done`; its client id/secret are set
  in Netlify → Project configuration → Access & security → OAuth. Editors sign in with their own
  GitHub account; saving commits straight to `main` and Netlify rebuilds. (Not git-gateway /
  Netlify Identity.)
- **`admin/config.yml` is generated** by `tools/gen-cms-config.js`. The 13 per-section field
  blocks are byte-identical **on purpose**: a YAML anchor for `fields:` makes Decap's entry
  editor throw *"Failed to load entry: Unknown error"* (the collection list still loads, which
  makes it look like a data problem — it isn't). Edit the schema in the generator, run
  `node tools/gen-cms-config.js`, commit both.
- **`media_folder: "images/cms"`** (with `.gitkeep`). It must **exist** — `decap-server`'s
  `getMedia` returns HTTP 500 on a missing folder, which also surfaces as "Failed to load
  entry: Unknown error". Do **not** use `images/uploads` — that path is proxied to dbc-resources
  by `_redirects`. Only exercised if an image is dropped into a Body field (no image widgets in
  the schema).
- **`admin/preview.js`** registers `/style.css` + a little layout CSS, loads the real Playfair
  italic face, applies the eyebrow-font treatment from `/admin/design-settings.json`, and
  renders each Page Content collection as composed sections (lead-in / heading / body / button).

### Local CMS testing

```
npm run cms     # terminal 1 — decap-server :8081
npm run dev     # terminal 2 — Eleventy   :8080
```

Open `http://localhost:8080/admin/`, click **Login** — `local_backend: true` connects to
decap-server with no auth. Saves write straight to the `src/_data/**` JSON files; Eleventy
rebuilds on the file change. `local_backend` is ignored in production.

## Netlify build & deploy

`netlify.toml`: `command = "npm run build"`, `publish = "_site"`, `NODE_VERSION = "20"`, and
`[build.processing.html] pretty_urls = false` (Netlify's pretty-URL post-processing was
rewriting deployed HTML — stripping `.html`, re-quoting attributes — so `/partials/site-chrome.html`
diverged from the templates; turning it off makes the templates authoritative).

Repo is `skinesti/dbc-site-live` (private). **Deploy: commit locally, then push `main` from a
real Terminal — not from a Claude Code session.** The push triggers the Netlify build.

`.githooks/pre-commit` runs `npm run build:check` and aborts the commit on a build error.
Enable per clone once: `git config core.hooksPath .githooks`.

## Canonicals & URLs

Every page sets a self-referential `<link rel="canonical">` via a `canonical:` front-matter var
(`/`, `/portfolio.html`, `/pricing.html`) — `/pricing` and `/pricing.html` both resolve, this
consolidates them.

## Working rules

- After any change to deployable content (`src/**`, `style.css`, `admin/**`, `images/`,
  `robots.txt`, `sitemap.xml`, `netlify.toml`, `eleventy.config.js`), stage and commit locally
  with a descriptive message. Do not push — Cristina pushes `main` from a Terminal.
- `CLAUDE.md` / `PROJECT-NOTES.md` are docs, not deployable content.
- Flag any inconsistency across the three pages rather than silently skipping it.
- End commit messages with the `Co-Authored-By:` / `Claude-Session:` trailer for the session.
