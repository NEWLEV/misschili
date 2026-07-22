import { readFile } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';

// Uploaded product images are written to disk at runtime (see
// uploadProductImage in app/admin/products/[id]/actions.ts). They can't be
// served as regular static files from `public/`: the standalone server
// (output: 'standalone') resolves its static-file routes once at boot, so
// anything written to `public/` after the process starts 404s until the
// server restarts. Reading the file fresh on every request here sidesteps
// that entirely.
const UPLOADS_DIR = process.env.UPLOADS_DIR || join(process.cwd(), 'public', 'uploads');

const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  // Reject path traversal / directory separators — filenames are generated
  // by uploadProductImage and never contain these, so any request with them
  // is not a legitimate reference to an uploaded file.
  if (!filename || filename.includes('/') || filename.includes('\\') || filename.includes('..')) {
    return new NextResponse('Not found', { status: 404 });
  }

  const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase();
  const contentType = CONTENT_TYPES[ext];
  if (!contentType) {
    return new NextResponse('Not found', { status: 404 });
  }

  try {
    const buffer = await readFile(join(UPLOADS_DIR, filename));
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
