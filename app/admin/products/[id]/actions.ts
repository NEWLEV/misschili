'use server';

import { prisma } from '@/lib/prisma';
import { productSchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';

function revalidateProductPages(productId: string, slug: string) {
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath('/admin/products');
  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath(`/products/${slug}`);
}

const productDetailsSchema = productSchema.omit({ basePrice: true, salePrice: true, saleStart: true, saleEnd: true });

export async function updateProduct(productId: string, formData: FormData) {
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
    return { success: false, error: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  try {
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

    revalidateProductPages(productId, product.slug);
    return { success: true };
  } catch (error) {
    console.error('Error updating product:', error);
    return { success: false, error: 'Failed to update product' };
  }
}

export async function setProductStatus(productId: string, status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED') {
  try {
    const product = await prisma.product.update({
      where: { id: productId },
      data: { status },
      select: { slug: true },
    });

    revalidateProductPages(productId, product.slug);
    return { success: true };
  } catch (error) {
    console.error('Error updating product status:', error);
    return { success: false, error: 'Failed to update product status' };
  }
}

export async function updateInventory(productId: string, quantity: number, lowStockThreshold: number) {
  try {
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

    revalidateProductPages(productId, product.product.slug);
    return { success: true };
  } catch (error) {
    console.error('Error updating inventory:', error);
    return { success: false, error: 'Failed to update inventory' };
  }
}

export async function updatePrice(productId: string, basePrice: number, salePrice: number | null) {
  try {
    const product = await prisma.product.update({
      where: { id: productId },
      data: { basePrice, salePrice },
      select: { slug: true },
    });

    revalidateProductPages(productId, product.slug);
    return { success: true };
  } catch (error) {
    console.error('Error updating price:', error);
    return { success: false, error: 'Failed to update price' };
  }
}
