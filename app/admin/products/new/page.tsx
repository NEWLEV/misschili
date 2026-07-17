import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createProduct } from '../actions';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-(--space-4) mb-(--space-6)">
        <Link href="/admin/products" className="text-(--color-text-muted) hover:text-(--color-text)">
          ← Back to Products
        </Link>
      </div>

      <h1 className="text-(--text-3xl) font-bold mb-(--space-6)" style={{ fontFamily: 'var(--font-display)' }}>
        Add Product
      </h1>

      <form action={createProduct} className="card p-(--space-6) space-y-(--space-4)">
        <Input label="Name" name="name" required />
        <Input label="Slug" name="slug" required placeholder="fiery-heat-ghost-pepper" helperText="Lowercase letters, numbers, and hyphens only" />
        <div>
          <label className="block text-(--text-sm) font-medium mb-1">Description</label>
          <textarea name="description" required rows={4} className="w-full p-3 rounded-(--radius-md) bg-(--color-bg) border border-(--color-border)"></textarea>
        </div>
        <Input label="SKU" name="sku" required />

        <div className="grid grid-cols-2 gap-4">
          <Input label="Base Price ($)" name="basePrice" type="number" min="0" step="0.01" required />
          <Input label="Sale Price ($, optional)" name="salePrice" type="number" min="0" step="0.01" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Heat Level (1-10)" name="heatLevel" type="number" min="1" max="10" />
          <Input label="Volume" name="volume" placeholder="5 fl oz (148 ml)" />
        </div>

        <div>
          <label className="block text-(--text-sm) font-medium mb-1">Ingredients</label>
          <textarea name="ingredients" rows={2} className="w-full p-3 rounded-(--radius-md) bg-(--color-bg) border border-(--color-border)"></textarea>
        </div>

        <div>
          <label className="block text-(--text-sm) font-medium mb-1">Status</label>
          <select name="status" defaultValue="DRAFT" className="w-full h-10 px-3 rounded-(--radius-md) bg-(--color-bg) border border-(--color-border)">
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        {categories.length > 0 && (
          <div>
            <label className="block text-(--text-sm) font-medium mb-2">Categories</label>
            <div className="flex flex-wrap gap-4">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center gap-2 text-(--text-sm)">
                  <input type="checkbox" name="categoryIds" value={category.id} />
                  {category.name}
                </label>
              ))}
            </div>
          </div>
        )}

        <label className="flex items-center gap-2 text-(--text-sm)">
          <input type="checkbox" name="isFeatured" />
          Feature on homepage
        </label>

        <Button type="submit" variant="primary" size="lg" className="w-full">Create Product</Button>
      </form>
    </div>
  );
}
