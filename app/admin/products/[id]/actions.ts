'use server';

import { prisma } from '@/lib/prisma';
import { productSchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';
import { requireAdminRole, ROLE_GROUPS } from '@/lib/admin-auth';
import { writeAuditLog } from '@/lib/audit-log';
import { logger } from '@/lib/logger';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

function revalidateProductPages(productId: string, slug: string) {
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath('/admin/products');
  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath(`/products/${slug}`);
}

const productDetailsSchema = productSchema.omit({ basePrice: true, salePrice: true, saleStart: true, saleEnd: true });

export async function updateProduct(productId: string, formData: FormData): Promise<void> {
  const session = await requireAdminRole(ROLE_GROUPS.CATALOG_CONTENT);

  const categoryIds = formData.getAll('categoryIds') as string[];

  const parsed = productDetailsSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description'),
    sku: formData.get('sku'),
    status: formData.get('status'),
    isFeatured: formData.get('isFeatured') === 'on',
    heatLevel: formData.get('heatLevel') || null,
    volume: formData.get('volume') || null,
    ingredients: formData.get('ingredients') || null,
    categoryIds,
  });

  if (!parsed.success) {
    return;
  }

  const data = parsed.data;

  try {
    const before = await prisma.product.findUnique({
      where: { id: productId },
      select: { name: true, slug: true, description: true, sku: true, status: true, isFeatured: true },
    });

    const product = await prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { id: productId },
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          sku: data.sku,
          status: data.status,
          isFeatured: data.isFeatured,
          heatLevel: data.heatLevel ?? null,
          volume: data.volume ?? null,
          ingredients: data.ingredients ?? null,
        },
      });

      await tx.productCategory.deleteMany({ where: { productId } });
      if (categoryIds.length > 0) {
        await tx.productCategory.createMany({
          data: categoryIds.map((categoryId) => ({ productId, categoryId })),
        });
      }

      return updated;
    });

    await writeAuditLog({
      session,
      action: 'product.updated',
      targetType: 'Product',
      targetId: productId,
      before,
      after: { name: product.name, slug: product.slug, description: product.description, sku: product.sku, status: product.status, isFeatured: product.isFeatured },
    });

    revalidateProductPages(productId, product.slug);
  } catch (error) {
    logger.error({ err: error, productId }, 'Error updating product');
  }
}

export async function setProductStatus(productId: string, status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED'): Promise<void> {
  const session = await requireAdminRole(ROLE_GROUPS.CATALOG_CONTENT);

  try {
    const before = await prisma.product.findUnique({ where: { id: productId }, select: { status: true } });

    const product = await prisma.product.update({
      where: { id: productId },
      data: { status },
      select: { slug: true },
    });

    await writeAuditLog({
      session,
      action: 'product.status_changed',
      targetType: 'Product',
      targetId: productId,
      before: { status: before?.status },
      after: { status },
    });

    revalidateProductPages(productId, product.slug);
  } catch (error) {
    logger.error({ err: error, productId }, 'Error updating product status');
  }
}

export async function updateInventory(productId: string, quantity: number, lowStockThreshold: number) {
  const session = await requireAdminRole(ROLE_GROUPS.INVENTORY_WRITE);

  try {
    const before = await prisma.inventory.findUnique({ where: { productId }, select: { quantity: true, lowStockThreshold: true } });

    const product = await prisma.inventory.upsert({
      where: { productId },
      update: {
        quantity,
        lowStockThreshold,
      },
      create: {
        productId,
        quantity,
        lowStockThreshold,
      },
      include: { product: { select: { slug: true } } },
    });

    await writeAuditLog({
      session,
      action: 'inventory.adjusted',
      targetType: 'Product',
      targetId: productId,
      before: before ? { quantity: before.quantity, lowStockThreshold: before.lowStockThreshold } : null,
      after: { quantity, lowStockThreshold },
    });

    revalidateProductPages(productId, product.product.slug);
    return { success: true };
  } catch (error) {
    logger.error({ err: error, productId }, 'Error updating inventory');
    return { success: false, error: 'Failed to update inventory' };
  }
}

export async function updatePrice(productId: string, basePrice: number, salePrice: number | null) {
  const session = await requireAdminRole(ROLE_GROUPS.PRICING_WRITE);

  try {
    const before = await prisma.product.findUnique({ where: { id: productId }, select: { basePrice: true, salePrice: true } });

    const product = await prisma.product.update({
      where: { id: productId },
      data: { basePrice, salePrice },
      select: { slug: true },
    });

    await writeAuditLog({
      session,
      action: 'product.price_changed',
      targetType: 'Product',
      targetId: productId,
      before: before ? { basePrice: Number(before.basePrice), salePrice: before.salePrice ? Number(before.salePrice) : null } : null,
      after: { basePrice, salePrice },
    });

    revalidateProductPages(productId, product.slug);
    return { success: true };
  } catch (error) {
    logger.error({ err: error, productId }, 'Error updating price');
    return { success: false, error: 'Failed to update price' };
  }
}

// Images are referenced by URL rather than uploaded — there's no object
// storage (S3/Cloudinary API) wired into this app yet. next.config.ts
// already allowlists res.cloudinary.com and *.misschilipeppers.com as valid
// image sources, so the expected workflow is: upload to Cloudinary (or the
// site's own media host) first, then paste the resulting URL here.
export async function addProductImage(productId: string, url: string, altText: string) {
  const session = await requireAdminRole(ROLE_GROUPS.CATALOG_CONTENT);

  if (!url.trim()) {
    return { success: false, error: 'Image URL is required' };
  }

  try {
    const product = await prisma.product.findUnique({ where: { id: productId }, select: { slug: true } });
    if (!product) return;

    const maxSortOrder = await prisma.productImage.aggregate({
      where: { productId },
      _max: { sortOrder: true },
    });
    const existingCount = await prisma.productImage.count({ where: { productId } });

    const image = await prisma.productImage.create({
      data: {
        productId,
        url: url.trim(),
        altText: altText.trim() || null,
        sortOrder: (maxSortOrder._max.sortOrder ?? -1) + 1,
        isFeatured: existingCount === 0, // first image on a product is featured by default
      },
    });

    await writeAuditLog({ session, action: 'product.image_added', targetType: 'Product', targetId: productId, after: { imageId: image.id, url: image.url } });

    revalidateProductPages(productId, product.slug);
  } catch (error) {
    logger.error({ err: error, productId }, 'Error adding product image');
  }
}

export async function deleteProductImage(imageId: string): Promise<void> {
  const session = await requireAdminRole(ROLE_GROUPS.CATALOG_CONTENT);

  try {
    const image = await prisma.productImage.findUnique({
      where: { id: imageId },
      include: { product: { select: { id: true, slug: true } } },
    });
    if (!image) return;

    await prisma.productImage.delete({ where: { id: imageId } });

    // If the deleted image was featured, promote the next-lowest sortOrder
    // image so the product never silently ends up with no featured image.
    if (image.isFeatured) {
      const next = await prisma.productImage.findFirst({
        where: { productId: image.product.id },
        orderBy: { sortOrder: 'asc' },
      });
      if (next) {
        await prisma.productImage.update({ where: { id: next.id }, data: { isFeatured: true } });
      }
    }

    await writeAuditLog({ session, action: 'product.image_deleted', targetType: 'Product', targetId: image.product.id, before: { imageId, url: image.url } });

    revalidateProductPages(image.product.id, image.product.slug);
  } catch (error) {
    logger.error({ err: error, imageId }, 'Error deleting product image');
  }
}

export async function setFeaturedImage(imageId: string): Promise<void> {
  const session = await requireAdminRole(ROLE_GROUPS.CATALOG_CONTENT);

  try {
    const image = await prisma.productImage.findUnique({
      where: { id: imageId },
      include: { product: { select: { id: true, slug: true } } },
    });
    if (!image) return;

    await prisma.$transaction([
      prisma.productImage.updateMany({ where: { productId: image.product.id }, data: { isFeatured: false } }),
      prisma.productImage.update({ where: { id: imageId }, data: { isFeatured: true } }),
    ]);

    await writeAuditLog({ session, action: 'product.image_featured', targetType: 'Product', targetId: image.product.id, after: { imageId } });

    revalidateProductPages(image.product.id, image.product.slug);
  } catch (error) {
    logger.error({ err: error, imageId }, 'Error setting featured image');
  }
}

export async function reorderProductImage(imageId: string, direction: 'up' | 'down'): Promise<void> {
  const session = await requireAdminRole(ROLE_GROUPS.CATALOG_CONTENT);

  try {
    const image = await prisma.productImage.findUnique({
      where: { id: imageId },
      include: { product: { select: { id: true, slug: true } } },
    });
    if (!image) return;

    const neighbor = await prisma.productImage.findFirst({
      where: {
        productId: image.product.id,
        sortOrder: direction === 'up' ? { lt: image.sortOrder } : { gt: image.sortOrder },
      },
      orderBy: { sortOrder: direction === 'up' ? 'desc' : 'asc' },
    });
    if (!neighbor) return;

    await prisma.$transaction([
      prisma.productImage.update({ where: { id: image.id }, data: { sortOrder: neighbor.sortOrder } }),
      prisma.productImage.update({ where: { id: neighbor.id }, data: { sortOrder: image.sortOrder } }),
    ]);

    await writeAuditLog({ session, action: 'product.image_reordered', targetType: 'Product', targetId: image.product.id, after: { imageId, direction } });

    revalidateProductPages(image.product.id, image.product.slug);
  } catch (error) {
    logger.error({ err: error, imageId }, 'Error reordering product image');
  }
}

export async function uploadProductImage(productId: string, formData: FormData): Promise<void> {
  const session = await requireAdminRole(ROLE_GROUPS.CATALOG_CONTENT);

  const file = formData.get('file') as File;
  if (!file || file.size === 0) {
    return;
  }

  if (!file.type.startsWith('image/')) {
    return;
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}_${cleanFileName}`;
    const filePath = join(uploadsDir, filename);

    await writeFile(filePath, buffer);

    const imageUrl = `/uploads/${filename}`;
    await addProductImage(productId, imageUrl, file.name);
  } catch (error) {
    logger.error({ err: error, productId }, 'Error uploading product image');
  }
}

export async function updateProductPrice(productId: string, formData: FormData): Promise<void> {
  const basePrice = Number(formData.get('basePrice'));
  const salePriceInput = formData.get('salePrice') as string;
  const salePrice = salePriceInput ? Number(salePriceInput) : null;
  await updatePrice(productId, basePrice, salePrice);
}

export async function updateProductInventory(productId: string, formData: FormData): Promise<void> {
  const quantity = Number(formData.get('quantity'));
  const lowStockThreshold = Number(formData.get('lowStockThreshold'));
  await updateInventory(productId, quantity, lowStockThreshold);
}

export async function addProductImageUrl(productId: string, formData: FormData): Promise<void> {
  const url = formData.get('url') as string;
  const altText = (formData.get('altText') as string) || '';
  await addProductImage(productId, url, altText);
}
