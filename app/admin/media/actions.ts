'use server';

import { unlink } from 'fs/promises';
import { join } from 'path';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAdminRole, ROLE_GROUPS } from '@/lib/admin-auth';
import { writeAuditLog } from '@/lib/audit-log';
import { UPLOADS_DIR } from '@/lib/uploads';
import { logger } from '@/lib/logger';

// Deletes an uploaded file outright: any ProductImage rows referencing it
// (across every product, not just one) plus the file on disk. Distinct from
// deleteProductImage in products/[id]/actions.ts, which only unlinks a
// single product's reference — this is "remove this file from the library."
export async function deleteUpload(filename: string): Promise<{ success: boolean; error?: string }> {
  const session = await requireAdminRole(ROLE_GROUPS.CATALOG_CONTENT);

  if (!filename || filename.includes('/') || filename.includes('\\') || filename.includes('..')) {
    return { success: false, error: 'Invalid filename' };
  }

  try {
    const url = `/media/${filename}`;
    const references = await prisma.productImage.findMany({
      where: { url },
      include: { product: { select: { id: true, slug: true } } },
    });

    for (const image of references) {
      await prisma.productImage.delete({ where: { id: image.id } });

      if (image.isFeatured) {
        const next = await prisma.productImage.findFirst({
          where: { productId: image.product.id },
          orderBy: { sortOrder: 'asc' },
        });
        if (next) {
          await prisma.productImage.update({ where: { id: next.id }, data: { isFeatured: true } });
        }
      }

      revalidatePath(`/admin/products/${image.product.id}`);
      revalidatePath(`/products/${image.product.slug}`);
    }

    try {
      await unlink(join(UPLOADS_DIR, filename));
    } catch {
      // Already gone from disk — the DB references above are still worth
      // clearing, so this isn't a failure condition.
    }

    await writeAuditLog({
      session,
      action: 'media.deleted',
      targetType: 'Media',
      targetId: filename,
      before: { filename, removedFromProductIds: references.map((r) => r.product.id) },
    });

    revalidatePath('/admin/media');
    revalidatePath('/admin/products');
    revalidatePath('/');
    revalidatePath('/products');
    return { success: true };
  } catch (error) {
    logger.error({ err: error, filename }, 'Error deleting uploaded file');
    return { success: false, error: 'Failed to delete file' };
  }
}
