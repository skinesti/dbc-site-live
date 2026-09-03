# Design by Cristina — Project Notes

- This is a static HTML/CSS/JS site for Design by Cristina, no build step or framework.
- The navigation block (`class="navlinks"`) is duplicated across `index.html`, `portfolio.html`, and `pricing.html`, so any nav change must be applied identically to all three files.
- Anchor link style should be consistent across all three files: use the `/#section` format (e.g. `/#contact`), not `#section`.
- To deploy, the contents of this folder (not the folder itself) get zipped and dragged into Netlify manually. This site is not connected to Netlify via CLI or GitHub.
- Brand colors and fonts are defined in `style.css` as CSS variables (`--teal`, `--clay`, `--ink`, etc.), along with `--serif` (Playfair Display) and `--sans` (Jost).
- `style.css` is currently duplicated between this repo and the separate dbc-resources site (dbc-resources.netlify.app, proxied here via `/resources/*` in `_redirects`). There is no shared source of truth — the two copies must be kept in sync manually. Any future style change made in one should be checked against the other, since proxied `/resources/*` pages load root-relative `/style.css`, `/images/...`, etc. from *this* site, not from dbc-resources.
- Always flag any inconsistency you notice across the three HTML files rather than silently skipping it.
- Required final step: after any changes to deployable content (`index.html`, `portfolio.html`, `pricing.html`, `style.css`, or the `images` folder) are made and confirmed, automatically zip the folder contents (not the folder itself) into a new versioned zip file one level up (e.g. `dbc-site-14.zip`, incrementing from the highest existing number), ready to drag into Netlify. Do this without waiting to be asked separately. `CLAUDE.md` and `PROJECT-NOTES.md` are documentation, not deployable content — edits to them alone do not trigger this step.
