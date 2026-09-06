/* Decap CMS preview — render prose sections with the real site CSS so the
   lead-in, heading, body and button appear composed, the way they will on the
   page (not as disconnected form fields). */
(function () {
  if (typeof CMS === "undefined") return;

  // The live stylesheet, plus a little page context for the preview iframe.
  CMS.registerPreviewStyle("/style.css");
  CMS.registerPreviewStyle("/admin/preview-extra.css");
  // Real Playfair italic face (style.css doesn't load it) so Editorial lead-ins
  // and the Playfair-Italic eyebrow render as true italic, not faux.
  CMS.registerPreviewStyle(
    "@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400;1,500;1,600&display=swap');",
    { raw: true }
  );

  /* Eyebrow-font mapping — mirrors src/_includes/design-vars.njk. Each option
     emits a COMPLETE `.eyebrow` rule so switching is deterministic. The preview
     reflects the SAVED design settings (updates after Save + rebuild); the real
     site is authoritative. */
  var EYEBROW_FONTS = {
    "Marck Script": {
      imp: "family=Marck+Script",
      stack: '"Marck Script", "Segoe Script", "Brush Script MT", cursive',
      rules: "font-size:calc(1.15rem + 2pt);font-weight:700;font-style:normal;text-transform:none;letter-spacing:normal;line-height:1.6;margin:0 0 1em;"
    },
    "Jost": {
      imp: "family=Jost:wght@400;500;600",
      stack: '"Jost", "Helvetica Neue", Arial, sans-serif',
      rules: "font-size:.84rem;font-weight:500;font-style:normal;text-transform:uppercase;letter-spacing:.18em;line-height:1.6;margin:0 0 1em;"
    },
    "Playfair Display Italic": {
      imp: "",
      stack: '"Playfair Display", Georgia, serif',
      rules: "font-size:1.2rem;font-weight:400;font-style:italic;text-transform:none;letter-spacing:normal;line-height:1.3;margin:0 0 .5em;"
    }
  };
  fetch("/admin/design-settings.json")
    .then(function (r) { return r.json(); })
    .then(function (d) {
      var e = EYEBROW_FONTS[d && d.eyebrow_font] || EYEBROW_FONTS["Marck Script"];
      var css =
        (e.imp ? "@import url('https://fonts.googleapis.com/css2?" + e.imp + "&display=swap');\n" : "") +
        ".cms-preview{--script:" + e.stack + ";}\n" +
        ".cms-preview .eyebrow{font-family:var(--script);color:var(--accent);" + e.rules + "}";
      CMS.registerPreviewStyle(css, { raw: true });
    })
    .catch(function () {});

  var h = window.h;

  // Section order per page file, so the preview reads top-to-bottom.
  var ORDER = {
    home: ["hero", "app", "solutions", "services", "about", "contact"],
    portfolio: ["hero", "cases", "clients", "closing"],
    pricing: ["hero", "howItWorks", "closing"]
  };
  var LABELS = {
    hero: "Hero", app: "Clarafide", solutions: "Solutions", services: "The Brand Edit",
    about: "About", contact: "Contact", cases: "Case studies", clients: "Prior clients",
    closing: "Closing CTA", howItWorks: "How pricing works"
  };

  function paragraphs(body) {
    if (!body) return [];
    return String(body).split(/\n{2,}/).map(function (chunk, i) {
      return h("p", { key: i }, chunk.trim());
    });
  }

  function leadin(s) {
    if (!s.leadin_text) return null;
    if (s.leadin_style === "Eyebrow") return h("p", { className: "eyebrow" }, s.leadin_text);
    if (s.leadin_style === "Editorial") return h("p", { className: "leadin-editorial" }, s.leadin_text);
    return null;
  }

  function button(s) {
    if (!s.button_text) return null;
    var cls = "btn btn-" + String(s.button_style || "Primary").toLowerCase();
    return h("a", { className: cls, href: s.button_url || "#" }, s.button_text);
  }

  function sectionBlock(key, s) {
    return h("section", { key: key },
      h("div", { className: "wrap" },
        h("p", { className: "preview-tag" }, LABELS[key] || key),
        leadin(s),
        h("h2", null, s.heading || ""),
        paragraphs(s.body),
        button(s)
      )
    );
  }

  function makePagePreview(pageKey) {
    return window.createClass({
      render: function () {
        var data = this.props.entry.get("data");
        var obj = data && data.toJS ? data.toJS() : {};
        var keys = ORDER[pageKey] || Object.keys(obj);
        return h("div", { className: "cms-preview" },
          keys.map(function (k) { return sectionBlock(k, obj[k] || {}); })
        );
      }
    });
  }

  CMS.registerPreviewTemplate("home", makePagePreview("home"));
  CMS.registerPreviewTemplate("portfolio", makePagePreview("portfolio"));
  CMS.registerPreviewTemplate("pricing", makePagePreview("pricing"));
})();
