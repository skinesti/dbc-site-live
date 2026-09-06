/**
 * Eleventy config — Design by Cristina
 *
 * Input templates live in src/. Everything the deployed site needs at its web
 * root is passthrough-copied from the repo root, UNCHANGED, into _site/:
 *
 *   - style.css   stays physically at the repo root so the raw GitHub URL
 *                 (https://raw.githubusercontent.com/skinesti/dbc-site-live/main/style.css)
 *                 keeps resolving for the dbc-resources build. Do not move it.
 *   - _redirects  Netlify reads this from the publish dir (_site/); the
 *                 /resources/* proxy depends on it landing there.
 *   - images/, files/, robots.txt, sitemap.xml — served as-is.
 *   - admin/      Decap CMS — admin/index.html, config.yml, preview assets.
 *
 * Content the CMS edits lives in src/_data/ as JSON:
 *   - design.json        -> `design`      (global design settings)
 *   - copy/index.json    -> `copy.index`  (home prose sections)
 *   - copy/portfolio.json, copy/pricing.json  -> `copy.portfolio` etc.
 *     (the folder is `copy/`, not `content/` — `content` is a reserved
 *     Eleventy data name)
 */
const markdownIt = require("markdown-it");

const md = markdownIt({ html: true, linkify: false, typographer: false });

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({
    "style.css": "style.css",
    "images": "images",
    "files": "files",
    "_redirects": "_redirects",
    "robots.txt": "robots.txt",
    "sitemap.xml": "sitemap.xml",
    "admin": "admin",
  });

  // Rebuild when the root stylesheet changes during `eleventy --serve`.
  eleventyConfig.addWatchTarget("./style.css");
  eleventyConfig.addWatchTarget("./admin");

  /**
   * mdp — render a CMS markdown string to HTML. When `cls` is given, every
   * top-level <p> gets that class (used to keep `.lede` / `.lede-app` styling
   * on hero and section-head body copy). The content here has no nested <p>,
   * so the plain replace is safe.
   */
  eleventyConfig.addFilter("mdp", (str, cls) => {
    if (!str) return "";
    const html = md.render(String(str));
    return cls ? html.replace(/<p>/g, `<p class="${cls}">`) : html;
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"],
  };
};
