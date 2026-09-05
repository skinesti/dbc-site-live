# Design by Cristina — Project Notes (for humans)

This file is a plain-English summary of the project for you (Cristina), not instructions for Claude. Claude's working instructions live in `CLAUDE.md` in this same folder.

## What this is

A small static website for Design by Cristina — just HTML, CSS, and a little JavaScript. There's no build step, no framework, and no package manager involved. You can open the HTML files directly or edit them as plain text.

The site has three pages:
- `index.html` — the homepage
- `portfolio.html` — portfolio/work page
- `pricing.html` — pricing page

Plus supporting files: `style.css` (all styling), an `images/` folder, and a `files/` folder (e.g. the pricing PDF).

## How to launch Claude Code on this project in the future

Open a terminal and run:

```
cd ~/dbc-site/dbc-site-live
claude
```

That starts Claude Code in this folder, where it will automatically pick up `CLAUDE.md` for context.

## Where the navigation and footer live

Each of the three HTML pages has its own copy of the top navigation menu and the footer. There's no template system, so the same markup exists in all three files. In the past this drifted out of sync — a link would get updated on the homepage but not on the pricing page, and the pages ended up with different menus.

**How it works now:** `index.html` is the "master" copy. A small helper (`tools/sync-partials.py`) copies the header and footer from `index.html` into `portfolio.html` and `pricing.html` so all three always match. If you look inside those two files you'll see a line that says `AUTO-SYNCED FROM index.html — edit there, not here`. That's the reminder: **only change the menu or footer in `index.html`.** A change made directly in the other two files will just get overwritten the next time the helper runs.

**One-time setup on each computer you edit from:** open a terminal in this project folder and run this line once:

```
git config core.hooksPath .githooks
```

**Why this matters:** that command switches on an automatic safety check. From then on, every time a change is saved into the project's history, the computer re-copies the header and footer from `index.html` and stops you if the other two pages weren't updated to match. It's what keeps the menus from silently drifting apart across pages again. You only need to run it once per computer — it doesn't travel with the project automatically, so if you ever set the project up on a new machine, run it again there. (Claude Code will also run the helper as part of its normal work.)

## How deploys work

There's no automatic deployment. This site isn't connected to Netlify through GitHub or a CLI — it's deployed manually:

1. Select everything *inside* the project folder (not the folder itself).
2. Zip it up into a new file, e.g. `dbc-site-14.zip`, placed one level above the project folder.
3. Drag that zip file into Netlify's manual deploy area.

Claude will create this versioned zip automatically after making changes to the actual site files (the HTML, the CSS, or images), so there's usually a fresh zip ready to drag in whenever you're ready to publish.

## Old zip files are safe to delete

Every deploy creates a new numbered zip (`dbc-site-8.zip`, `dbc-site-9.zip`, etc.) sitting one level above this folder. You don't need to keep these around — Netlify keeps its own history of every deploy, so you can always roll back to a previous version from the Netlify dashboard even after the local zip is gone. Feel free to clean old ones up whenever you like.

## A note about CLAUDE.md and this file

`CLAUDE.md` and this file (`PROJECT-NOTES.md`) are documentation about the project, not part of the actual website. Editing either of them does not count as a site change, so it won't trigger Claude to create a new deploy zip — only changes to the real site files (HTML, CSS, images) do that.
