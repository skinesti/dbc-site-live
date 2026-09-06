#!/usr/bin/env node
/**
 * gen-cms-config.js — regenerates admin/config.yml.
 *
 * The 13 per-section field blocks in the "pages" collection are byte-identical
 * on purpose (a YAML anchor for `fields:` makes Decap choke on entry open — see
 * the note at the top of the generated file). Edit the field schema HERE, in
 * one place, then run:  node tools/gen-cms-config.js
 *
 * The "design" collection block is written inline below (it is not repeated).
 */
const fs = require("fs");
const path = require("path");
process.chdir(path.join(__dirname, ".."));

// One section object, correctly indented as an item of a file-collection's
// `fields:` list (the `-` sits at column 10).
const sec = (name, label) => `          - name: ${name}
            label: "${label}"
            widget: object
            fields:
              - name: leadin_style
                label: "Lead-in style"
                widget: select
                default: "None"
                options: ["None", "Eyebrow", "Editorial"]
                hint: "None = no lead-in. Eyebrow = accent colour, font set in Site Design Settings (Marck Script, Jost, or Playfair Italic). Editorial = Playfair italic, accent colour (a standout treatment, e.g. 'Introducing Clarafide')."
              - name: leadin_text
                label: "Lead-in text"
                widget: string
                required: false
                hint: "Ignored when Lead-in style is None."
              - name: heading
                label: "Heading"
                widget: string
                hint: "Always renders in Playfair Display — font is locked site-wide."
              - name: body
                label: "Body text"
                widget: markdown
                required: false
                minimal: true
              - name: button_text
                label: "Button text"
                widget: string
                required: false
                hint: "Leave blank for no button."
              - name: button_url
                label: "Button URL"
                widget: string
                required: false
                hint: "e.g. /pricing.html, /#contact, or a full https:// link. Ignored when Button text is blank."
              - name: button_style
                label: "Button style"
                widget: select
                default: "Primary"
                options: ["Primary", "Secondary", "Tertiary"]
                hint: "Primary = Clay fill. Secondary = Teal Deep outline. Tertiary = Teal Deep fill, inverts on hover. (Definitions are locked; not editable here.) Ignored when Button text is blank."`;

const home = [
  ["hero", "Hero"],
  ["app", "Clarafide (flagship section)"],
  ["solutions", "Solutions — section heading"],
  ["services", "The Brand Edit"],
  ["about", "About Cristina"],
  ["contact", "Contact — section heading"],
];
const portfolio = [
  ["hero", "Hero"],
  ["cases", "Case studies — section heading"],
  ["clients", "Prior clients — section heading"],
  ["closing", "Closing call-to-action"],
];
const pricing = [
  ["hero", "Hero"],
  ["howItWorks", "How pricing works"],
  ["closing", "Closing call-to-action"],
];

const out = `# Decap CMS — Design by Cristina
#
# Backend: GitHub OAuth (OAuth app callback https://api.netlify.com/auth/done,
# client id/secret set in Netlify → Project configuration → Access & security →
# OAuth). Editors sign in with their own GitHub account; commits go straight to
# \`main\`, Netlify rebuilds.
#
# What the CMS edits:
#   - src/_data/copy/{index,portfolio,pricing}.json — prose sections
#   - src/_data/design.json                         — global design settings
# Cards, case studies, the client list, the pricing service blocks and the
# contact form stay in the templates for now (a later phase).
#
# NOTE: the per-section field list is repeated inline for every section on
# purpose. A YAML anchor (&section_fields / *section_fields) makes all the
# section field lists the SAME array instance, which Decap's entry editor
# cannot process — the collection list loads but opening an entry throws
# "Failed to load entry: Unknown error". Keep these copies in sync by hand.

backend:
  name: github
  repo: skinesti/dbc-site-live
  branch: main

# Lets \`npx decap-server\` drive the CMS against local files with no auth when
# the admin page is opened from localhost. Ignored in production.
local_backend: true

# Only exercised if an image is added inside a Body field. NOT images/uploads —
# that path is proxied to dbc-resources by the site's _redirects.
media_folder: "images/cms"
public_folder: "/images/cms"

collections:
  - name: pages
    label: "Page Content"
    description: "Lead-in, heading, body and button for each prose section."
    editor:
      preview: true
    files:
      - name: home
        label: "Home Page"
        file: "src/_data/copy/index.json"
        fields:
${home.map(([n, l]) => sec(n, l)).join("\n")}

      - name: portfolio
        label: "Portfolio Page"
        file: "src/_data/copy/portfolio.json"
        fields:
${portfolio.map(([n, l]) => sec(n, l)).join("\n")}

      - name: pricing
        label: "Pricing Page"
        file: "src/_data/copy/pricing.json"
        fields:
${pricing.map(([n, l]) => sec(n, l)).join("\n")}

  - name: design
    label: "Site Design Settings"
    description: "Global look and feel. Applies to every page."
    editor:
      preview: false
    files:
      - name: settings
        label: "Design Settings"
        file: "src/_data/design.json"
        fields:
          - name: eyebrow_font
            label: "Eyebrow font"
            widget: select
            default: "Marck Script"
            options: ["Marck Script", "Jost", "Playfair Display Italic"]
            hint: "Font + treatment for Eyebrow-style lead-in labels. Marck Script: script, natural case, no tracking. Jost: UPPERCASE + .18em tracking (the site's original label treatment — the one exception to no-uppercase for Eyebrow). Playfair Display Italic: serif italic, natural case, no tracking (same visual treatment as the Editorial lead-in)."
          - name: body_font
            label: "Body font"
            widget: select
            default: "Work Sans"
            options: ["Work Sans", "Nunito Sans", "Archivo"]
            hint: "Everything that isn't a heading or an eyebrow. Headings stay Playfair Display."
          - name: text_size
            label: "Text size"
            widget: select
            default: "Medium"
            options: ["Small", "Medium", "Large"]
            hint: "Preset body scale — Small 16px / Medium 17px / Large 19px."
          - name: accent_color
            label: "Accent colour"
            widget: select
            default: "#C2876F"
            options:
              - { label: "Clay (#C2876F)", value: "#C2876F" }
              - { label: "Teal Deep (#1B2E37)", value: "#1B2E37" }
              - { label: "Sage (#93A89B)", value: "#93A89B" }
            hint: "Lead-in labels, list dots and small marks. Does not change button colours."
          - name: button_radius
            label: "Button radius"
            widget: select
            default: "6px"
            options: ["4px", "6px", "8px"]
            hint: "Corner rounding on buttons only."
          # Button definitions are fixed and documented here for reference — not editable:
          #   Primary   — background Clay (#C2876F), white text; Teal Deep (#1B2E37) background on hover, text stays white.
          #   Secondary — Teal Deep outline + Teal Deep text; fills Teal Deep with white text on hover.
          #   Tertiary  — background Teal Deep (#1B2E37), white text, no visible border; inverts on hover to
          #               white background with a Teal Deep outline and Teal Deep text.
`;

fs.writeFileSync("admin/config.yml", out);
console.log("wrote admin/config.yml (" + out.split("\n").length + " lines)");
