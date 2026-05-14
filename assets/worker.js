// Minimal Worker: serve wrangler.toml [assets] config handles static files
// This file exists only because wrangler requires a main entry point.
// All .html, .md, .js and other static assets in the project root
// are automatically served by the [assets] configuration above.

export default {
  async fetch(request) {
    const url = new URL(request.url);
    // Let static asset serving handle everything
    return new Response("Not Found", { status: 404 });
  }
};