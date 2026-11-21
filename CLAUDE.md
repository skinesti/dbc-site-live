# Design by Cristina: Project Notes

Plain HTML website for designbycristina.com. One repo, no build step, no CMS.
Netlify publishes the repo exactly as it is whenever `main` is pushed.
`PROJECT-NOTES.md` is the plain-English version for Cristina; this file is the working reference.

## Pages (each is a real file with its full text)

```
index.html                              Home
services/  custom-software/  web-site-design/  digital-solutions/
clarafide/  shop/  about/  contact/  portfolio/
resources/index.html                    Resources list (topic filter chips)
resources/<slug>/index.html             One folder per article
thanks/index.html                       Contact form success page (noindex)
_templates/article-template.html        Starting point for a new article (not published, disallowed in robots.txt)
style.css  site.js                      One shared stylesheet, one small shared script
fonts/                                  Jonathan Signature subset (see "Open items")
images/  images/uploads/                Site images; article images live in images/uploads/
sitemap.xml  robots.txt  _redirects  netlify.toml
files/                                  Two-page take-away pricing guide PDF (rebuilt Nov 21, 2026; update it whenever prices change)
```

The header, footer and head tags are repeated in every page. A nav or footer change means editing every
page (use a search and replace across the repo, then check the diff).

## Design rules (agreed, do not drift)

- Colors: Whisper Mint #f6faf9, Line Mint #dce6e3, Slate Teal #2f4858, Deep Teal #1b2e37, Coral #dc775e, white.
  In the CSS: `--mint`, `--line`, `--teal` (Slate Teal), `--ink` (Deep Teal), `--clay` (Coral), `--white`.
- Fonts: Playfair Display 400/500 for headings, buttons and links; Jost 400 for body; Jonathan Signature for script accents only.
  No bold, no italic (strong renders at weight 500, em is not italic).
- Buttons: coral solid with white text (hover white fill, coral border), or Slate Teal solid with white text and an arrow.
  42px tall, 7px corners, 12rem minimum width. Topic bubbles: white, 1px coral outline, teal text, Playfair 12px.
- No eyebrows or small labels above headings. Portfolio appears in the footer only. Atlanta stays out of the H1.
- Prices: custom software from $1,500, Websites: Essentials one page $1,000, Foundation up to 4 pages $1,400, Signature up to 6 $1,600, Complete Brand up to 8 $2,000 (half to start, half at launch); digital solutions and support $100 an hour (most jobs $100 to $300). Raised from $75 on Nov 21, 2026 after a client said it was low. Clarafide: Starter $19, Studio $29, Concierge custom.
- Copy: "website" is one word, lowercase unless it starts a sentence or heading (changed Nov 21, 2026; it used to be two words, "Web site"). Never use em dashes.

## Adding an article

Articles are written and edited as Google Docs in the DBC Drive, folder "DBC Article Writer [Do Not Delete]"
(subfolders Drafts, Published, Images; the DBC Article Tracker sheet records every article).
The Doc is the master copy. To publish:

1. Copy `_templates/article-template.html` to `resources/<slug>/index.html` and fill in every `{{TOKEN}}`
   (SLUG, TITLE, DESCRIPTION, IMAGE_FILE, TOPIC, DATE_ISO, DATE_LONG). Put the article body HTML where the comment says.
2. Put the image in `images/uploads/` (about 1600px wide, JPG or PNG, named after the slug).
3. Add the article card to `resources/index.html` (newest first) and, if it is one of the two newest, to the "Latest from Resources" block in `index.html`.
4. Add the URL to `sitemap.xml`.
5. Add or update the row in the DBC Article Tracker sheet (Status Published, Publish Date, Links To).
6. Move the Doc from Drafts to Published.

To change a published article, edit the Doc, then update that article's HTML to match. Never edit only the HTML.

## Deploying

Commit locally with a descriptive message and end it with the Co-Authored-By and Claude-Session trailers.
Netlify deploys when `main` is pushed. Publishing and pushing need Cristina's explicit approval for that release.
This session's GitHub connection could not push on the first build (the Claude GitHub App was not installed for this repo).

## Open items

- The home hero photo (`images/hero.webp`) is cleared for use by Cristina (confirmed Nov 21, 2026).
- Cristina holds the Jonathan Signature license. `fonts/jonathan-signature-subset.woff2` still only contains the letters used for the About sign-off and the contact thank-you.
  The full font is in the DBC Drive: Fonts / Jonathan-Signature-Font (JonathanSignature.woff, .otf, .ttf, plus a zip).
  Swap it in only if the script is used on more pages than the About sign-off and thank-you.
- Years of experience are always "eighteen years" (or "18+ years"), never "two decades".
- `dbc-resources` (the old articles repo) is retired in practice: the articles now live here. Retire it only with Cristina's approval.
