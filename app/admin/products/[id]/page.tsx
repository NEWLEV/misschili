import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { updateInventory, updatePrice, updateProduct } from './actions';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export default async function AdminProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        inventory: true,
        categories: { select: { categoryId: true } },
      },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: 'asc' } }),
  ]);

  if (!product) return notFound();

  const currentStock = product.inventory?.quantity || 0;
  const lowStockThreshold = product.inventory?.lowStockThreshold || 5;
  const selectedCategoryIds = new Set(product.categories.map((c) => c.categoryId));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-[var(--space-4)] mb-[var(--space-6)]">
        <Link href="/admin/products" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
          ← Back to Products
        </Link>
      </div>

      <div className="flex justify-between items-start mb-[var(--space-8)]">
        <div>
          <h1 className="text-[var(--text-3xl)] font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            {product.name}
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            SKU: {product.sku}
          </p>
        </div>
        <span className={`badge ${product.status === 'ACTIVE' ? 'badge-success' : product.status === 'DRAFT' ? 'badge-warning' : 'badge-danger'}`}>
          {product.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[var(--space-6)]">
        {/* Main Product Info */}
        <div className="lg:col-span-2 space-y-[var(--space-6)]">
          <div className="card p-[var(--space-6)]">
            <h2 className="text-[var(--text-lg)] font-semibold mb-[var(--space-4)]">Product Details</h2>
            <form action={async (formData) => {
              'use server';
              await updateProduct(product.id, formData);
            }} className="space-y-[var(--space-4)]">
              <div>
                <label className="block text-[var(--text-sm)] font-medium mb-1">Name</label>
                <input name="name" defaultValue={product.name} required
                  className="w-full h-10 px-3 rounded-[var(--radius-md)] bg-[var(--color-bg)] border border-[var(--color-border)]" />
              </div>
              <div>
                <label className="block text-[var(--text-sm)] font-medium mb-1">Slug</label>
                <input name="slug" defaultValue={product.slug} required
                  className="w-full h-10 px-3 rounded-[var(--radius-md)] bg-[var(--color-bg)] border border-[var(--color-border)]" />
              </div>
              <div>
                <label className="block text-[var(--text-sm)] font-medium mb-1">SKU</label>
                <input name="sku" defaultValue={product.sku} required
                  className="w-full h-10 px-3 rounded-[var(--radius-md)] bg-[var(--color-bg)] border border-[var(--color-border)]" />
              </div>
              <div>
                <label className="block text-[var(--text-sm)] font-medium mb-1">Description</label>
                <textarea name="description" defaultValue={product.description} required rows={4}
                  className="w-full p-3 rounded-[var(--radius-md)] bg-[var(--color-bg)] border border-[var(--color-border)]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[var(--text-sm)] font-medium mb-1">Heat Level (1-10)</label>
                  <input type="number" name="heatLevel" min="1" max="10" defaultValue={product.heatLevel ?? ''}
                    className="w-full h-10 px-3 rounded-[var(--radius-md)] bg-[var(--color-bg)] border border-[var(--color-border)]" />
                </div>
                <div>
                  <label className="block text-[var(--text-sm)] font-medium mb-1">Volume</label>
                  <input name="volume" defaultValue={product.volume ?? ''} placeholder="5 fl oz (148 ml)"
                    className="w-full h-10 px-3 rounded-[var(--radius-md)] bg-[var(--color-bg)] border border-[var(--color-border)]" />
                </div>
              </div>
              <div>
                <label className="block text-[var(--text-sm)] font-medium mb-1">Ingredients</label>
                <textarea name="ingredients" defaultValue={product.ingredients ?? ''} rows={2}
                  className="w-full p-3 rounded-[var(--radius-md)] bg-[var(--color-bg)] border border-[var(--color-border)]" />
              </div>
              <div>
                <label className="block text-[var(--text-sm)] font-medium mb-1">Status</label>
                <select name="status" defaultValue={product.status}
                  className="w-full h-10 px-3 rounded-[var(--radius-md)] bg-[var(--color-bg)] border border-[var(--color-border)]">
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="ARCHIVED">Archived (disabled)</option>
                </select>
              </div>
              {categories.length > 0 && (
                <div>
                  <label className="block text-[var(--text-sm)] font-medium mb-2">Categories</label>
                  <div className="flex flex-wrap gap-4">
                    {categories.map((category) => (
                      <label key={category.id} className="flex items-center gap-2 text-[var(--text-sm)]">
                        <input type="checkbox" name="categoryIds" value={category.id} defaultChecked={selectedCategoryIds.has(category.id)} />
                        {category.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <label className="flex items-center gap-2 text-[var(--text-sm)]">
                <input type="checkbox" name="isFeatured" defaultChecked={product.isFeatured} />
                Feature on homepage
              </label>
              <Button type="submit" variant="primary" className="w-full">Save Product Details</Button>
            </form>
          </div>

          <div className="card p-[var(--space-6)]">
            <h2 className="text-[var(--text-lg)] font-semibold mb-[var(--space-4)]">Images</h2>
            <div className="flex gap-[var(--space-4)] overflow-x-auto pb-2">
              {product.images.map((img) => (
                <div key={img.id} className="relative w-24 h-24 bg-[var(--color-bg-alt)] rounded-md border border-[var(--color-border)] shrink-0 flex items-center justify-center">
                  <Image src={img.url} alt={img.altText || product.name} width={64} height={64} className="max-h-20 w-auto object-contain" />
                </div>
              ))}
              {product.images.length === 0 && (
                <p className="text-[var(--text-sm)] text-[var(--color-text-muted)]">No images available.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Info & Forms */}
        <div className="space-y-[var(--space-6)]">
          {/* Pricing Form */}
          <div className="card p-[var(--space-5)]">
            <h2 className="text-[var(--text-base)] font-semibold mb-[var(--space-3)]">Pricing</h2>
            <form action={async (formData) => {
              'use server';
              const salePriceInput = formData.get('salePrice') as string;
              await updatePrice(
                product.id,
                Number(formData.get('basePrice')),
                salePriceInput ? Number(salePriceInput) : null
              );
            }} className="space-y-[var(--space-4)]">
              <div>
                <label className="block text-[var(--text-sm)] font-medium mb-1">Base Price ($)</label>
                <input
                  type="number"
                  name="basePrice"
                  defaultValue={Number(product.basePrice)}
                  required
                  min="0"
                  step="0.01"
                  className="w-full h-10 px-3 rounded-[var(--radius-md)] bg-[var(--color-bg)] border border-[var(--color-border)]"
                />
              </div>
              <div>
                <label className="block text-[var(--text-sm)] font-medium mb-1">Sale Price ($, optional)</label>
                <input
                  type="number"
                  name="salePrice"
                  defaultValue={product.salePrice ? Number(product.salePrice) : ''}
                  min="0"
                  step="0.01"
                  className="w-full h-10 px-3 rounded-[var(--radius-md)] bg-[var(--color-bg)] border border-[var(--color-border)]"
                />
              </div>
              <Button type="submit" variant="primary" className="w-full">Update Price</Button>
            </form>
          </div>

          {/* Inventory Form */}
          <div className="card p-[var(--space-5)]">
            <h2 className="text-[var(--text-base)] font-semibold mb-[var(--space-3)]">Inventory Management</h2>
            <form action={async (formData) => {
              'use server';
              await updateInventory(
                product.id,
                Number(formData.get('quantity')),
                Number(formData.get('lowStockThreshold'))
              );
            }} className="space-y-[var(--space-4)]">
              <div>
                <label className="block text-[var(--text-sm)] font-medium mb-1">Available Quantity</label>
                <input 
                  type="number" 
                  name="quantity" 
                  defaultValue={currentStock} 
                  required
                  min="0"
                  className="w-full h-10 px-3 rounded-[var(--radius-md)] bg-[var(--color-bg)] border border-[var(--color-border)]" 
                />
              </div>
              <div>
                <label className="block text-[var(--text-sm)] font-medium mb-1">Low Stock Alert Threshold</label>
                <input 
                  type="number" 
                  name="lowStockThreshold" 
                  defaultValue={lowStockThreshold} 
                  required
                  min="0"
                  className="w-full h-10 px-3 rounded-[var(--radius-md)] bg-[var(--color-bg)] border border-[var(--color-border)]" 
                />
              </div>
              
              <div className="pt-[var(--space-2)] border-t border-[var(--color-border)]">
                 <p className="text-[var(--text-xs)] text-[var(--color-text-muted)] mb-[var(--space-3)]">
                   Reserved by carts: {product.inventory?.reservedQuantity || 0}
                 </p>
                <Button type="submit" variant="primary" className="w-full">Update Stock</Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
