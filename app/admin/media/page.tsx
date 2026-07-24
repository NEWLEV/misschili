import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { UPLOADS_DIR } from '@/lib/uploads';
import { ConfirmSubmitButton } from '@/components/admin/ConfirmSubmitButton';
import { deleteUpload } from './actions';

export const dynamic = 'force-dynamic';

interface MediaFile {
  filename: string;
  url: string;
  size: number;
  modifiedAt: Date;
  usedBy: { productId: string; productName: string }[];
}

async function getMediaFiles(): Promise<MediaFile[]> {
  let filenames: string[];
  try {
    filenames = await readdir(UPLOADS_DIR);
  } catch {
    return [];
  }

  const images = await prisma.productImage.findMany({
    where: { url: { startsWith: '/media/' } },
    include: { product: { select: { id: true, name: true } } },
  });
  const usageByFilename = new Map<string, MediaFile['usedBy']>();
  for (const img of images) {
    const filename = img.url.replace('/media/', '');
    const list = usageByFilename.get(filename) ?? [];
    list.push({ productId: img.product.id, productName: img.product.name });
    usageByFilename.set(filename, list);
  }

  const files = await Promise.all(
    filenames.map(async (filename) => {
      const stats = await stat(join(UPLOADS_DIR, filename));
      return {
        filename,
        url: `/media/${filename}`,
        size: stats.size,
        modifiedAt: stats.mtime,
        usedBy: usageByFilename.get(filename) ?? [],
      };
    })
  );

  return files.sort((a, b) => b.modifiedAt.getTime() - a.modifiedAt.getTime());
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default async function MediaLibraryPage() {
  const files = await getMediaFiles();

  return (
    <div>
      <div className="mb-(--space-6)">
        <h1 className="text-(--text-3xl) font-bold" style={{ fontFamily: 'var(--font-display)' }}>Media Library</h1>
        <p className="text-(--color-text-secondary) text-(--text-sm) mt-1">
          Every image uploaded through a product&apos;s &quot;Upload Local Image&quot; form — {files.length} file{files.length === 1 ? '' : 's'}.
        </p>
      </div>

      {files.length === 0 ? (
        <div className="card p-(--space-8) text-center text-(--color-text-muted)">
          No uploads yet. Upload an image from a product&apos;s detail page to see it here.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-(--space-4)">
          {files.map((file) => (
            <div key={file.filename} className="card p-(--space-3) flex flex-col gap-(--space-2)">
              <div className="relative aspect-square bg-(--color-bg-alt) rounded-md flex items-center justify-center overflow-hidden">
                <Image src={file.url} alt={file.filename} width={160} height={160} className="max-h-full w-auto object-contain" />
              </div>
              <p className="text-(--text-xs) font-mono truncate" title={file.filename}>{file.filename}</p>
              <p className="text-(--text-xs) text-(--color-text-muted)">{formatBytes(file.size)}</p>
              {file.usedBy.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {file.usedBy.map((p) => (
                    <Link key={p.productId} href={`/admin/products/${p.productId}`} className="badge badge-primary text-[10px]">
                      {p.productName}
                    </Link>
                  ))}
                </div>
              ) : (
                <span className="badge badge-warning text-[10px] w-fit">Unused</span>
              )}
              <ConfirmSubmitButton
                action={deleteUpload.bind(null, file.filename)}
                confirmMessage={
                  file.usedBy.length > 0
                    ? `This image is used by ${file.usedBy.length} product(s). Remove it everywhere?`
                    : 'Delete this uploaded file permanently?'
                }
                variant="ghost"
                className="text-(--color-danger) text-(--text-xs) h-8!"
              >
                Delete
              </ConfirmSubmitButton>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
