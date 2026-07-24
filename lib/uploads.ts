import { join } from 'path';

// Single source of truth for where uploaded product images live on disk —
// shared by the upload action, the /media/[filename] serving route, and the
// admin media library, so they can never drift apart.
export const UPLOADS_DIR = process.env.UPLOADS_DIR || join(process.cwd(), 'public', 'uploads');
