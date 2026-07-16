'use server';

import { prisma } from '@/lib/prisma';
import { productSchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createProduct(formData: FormData) {
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

  const product = await prisma.product.create({
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

  revalidatePath('/admin/products');
  revalidatePath('/');
  revalidatePath('/products');
  redirect(`/admin/products/${product.id}`);
}
