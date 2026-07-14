'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateInventory(productId: string, quantity: number, lowStockThreshold: number) {
  try {
    await prisma.inventory.upsert({
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
    });

    revalidatePath(`/admin/products/${productId}`);
    revalidatePath('/admin/products');
    return { success: true };
  } catch (error) {
    console.error('Error updating inventory:', error);
    return { success: false, error: 'Failed to update inventory' };
  }
}
