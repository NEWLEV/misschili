'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

function revalidateProductPages(productId: string, slug: string) {
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath('/admin/products');
  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath(`/products/${slug}`);
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
