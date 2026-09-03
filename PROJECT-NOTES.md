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

## Where the navigation lives, and why it's duplicated

Each of the three HTML pages has its own copy of the navigation menu (the `navlinks` block near the top of the file, inside the `<header>`). There's no shared template system, so the same menu markup is pasted into all three files separately.

This means: any time the nav changes — adding a link, reordering links, renaming something — it has to be changed in all three files by hand (or by asking Claude to do it), or the pages will show different menus.

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
