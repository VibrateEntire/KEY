// Cloudflare Worker - Static file server
const ACCESS_KEY = "bluecloudKEY@3";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Check access key
    if (url.searchParams.get("key") !== ACCESS_KEY) {
      return new Response("Unauthorized", { status: 401 });
    }

    let pathname = decodeURIComponent(url.pathname);

    // Serve index.html for root
    if (pathname === '/') {
      pathname = '/index.html';
    }

    // Fetch the asset from the assets binding
    const asset = await env.ASSETS.get(pathname);

    if (!asset) {
      return new Response('Not Found', { status: 404 });
    }

    const headers = new Headers();
    const contentType = getContentType(pathname);
    if (contentType) {
      headers.set('Content-Type', contentType);
    }

    // Cache for 1 year for static assets
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    return new Response(asset.body, {
      status: 200,
      headers,
    });
  },
};

function getContentType(pathname) {
  const ext = pathname.split('.').pop().toLowerCase();
  const types = {
    html: 'text/html; charset=utf-8',
    css: 'text/css',
    js: 'application/javascript',
    json: 'application/json',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    ico: 'image/x-icon',
    webp: 'image/webp',
    wav: 'audio/wav',
    mp4: 'video/mp4',
    webm: 'video/webm',
    woff: 'font/woff',
    woff2: 'font/woff2',
    ttf: 'font/ttf',
    eot: 'application/vnd.ms-fontobject',
    otf: 'font/otf',
    wasm: 'application/wasm',
    txt: 'text/plain',
    xml: 'application/xml',
    pdf: 'application/pdf',
    zip: 'application/zip',
    md: 'text/markdown',
  };
  return types[ext] || 'application/octet-stream';
}
