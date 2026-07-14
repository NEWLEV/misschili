'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import type { OrderStatus } from '@prisma/client';

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus, adminNotes?: string) {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        ...(adminNotes !== undefined && { adminNotes }),
      },
    });

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath('/admin/orders');
    return { success: true };
  } catch (error) {
    console.error('Error updating order:', error);
    return { success: false, error: 'Failed to update order' };
  }
}
