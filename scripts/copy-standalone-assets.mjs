// `output: 'standalone'` traces only the server bundle and node_modules it
// needs — per Next.js's own docs it deliberately does NOT copy `public/` or
// `.next/static/`, since those are expected to be served by a CDN. This repo
// has no CDN/Dockerfile step doing that copy, so without this script the
// standalone server has no `public` directory at all: every static asset
// (logos, product photos, uploaded images) 404s in production even though
// everything works in `next dev`, which serves straight from the source tree.
import { cpSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const standaloneDir = join(root, '.next', 'standalone');

if (!existsSync(standaloneDir)) {
  console.error('[copy-standalone-assets] .next/standalone not found — did `next build` run with output: "standalone"?');
  process.exit(1);
}

cpSync(join(root, 'public'), join(standaloneDir, 'public'), { recursive: true });
cpSync(join(root, '.next', 'static'), join(standaloneDir, '.next', 'static'), { recursive: true });

console.log('[copy-standalone-assets] Copied public/ and .next/static/ into .next/standalone/');
