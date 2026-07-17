'use server';

import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { productSchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdminRole, ROLE_GROUPS } from '@/lib/admin-auth';
import { writeAuditLog } from '@/lib/audit-log';

export async function createProduct(formData: FormData) {
  const session = await requireAdminRole(ROLE_GROUPS.CATALOG_WRITE);

  const categoryIds = formData.getAll('categoryIds') as string[];

  const parsed = productSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description'),
    sku: formData.get('sku'),
    basePrice: formData.get('basePrice'),
    salePrice: formData.get('salePrice') || null,
    status: formData.get('status'),
    isFeatured: formData.get('isFeatured') === 'on',
    heatLevel: formData.get('heatLevel') || null,
    volume: formData.get('volume') || null,
    ingredients: formData.get('ingredients') || null,
    categoryIds,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const data = parsed.data;

  let product;
  try {
    product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        sku: data.sku,
        basePrice: data.basePrice,
        salePrice: data.salePrice ?? null,
        status: data.status,
        isFeatured: data.isFeatured,
        heatLevel: data.heatLevel ?? null,
        volume: data.volume ?? null,
        ingredients: data.ingredients ?? null,
        categories: categoryIds.length > 0
          ? { create: categoryIds.map((categoryId) => ({ categoryId })) }
          : undefined,
        inventory: { create: { quantity: 0 } },
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      const field = Array.isArray(err.meta?.target) ? err.meta.target[0] : 'slug or SKU';
      throw new Error(`A product with that ${field} already exists.`);
    }
    throw err;
  }

  await writeAuditLog({
    session,
    action: 'product.created',
    targetType: 'Product',
    targetId: product.id,
    after: { name: product.name, slug: product.slug, sku: product.sku, status: product.status },
  });

  revalidatePath('/admin/products');
  revalidatePath('/');
  revalidatePath('/products');
  redirect(`/admin/products/${product.id}`);
}
