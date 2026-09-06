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
 */
module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({
    "style.css": "style.css",
    "images": "images",
    "files": "files",
    "_redirects": "_redirects",
    "robots.txt": "robots.txt",
    "sitemap.xml": "sitemap.xml",
  });

  // Rebuild when the root stylesheet changes during `eleventy --serve`.
  eleventyConfig.addWatchTarget("./style.css");

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
