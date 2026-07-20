import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  updateProduct,
  deleteProductImage,
  setFeaturedImage,
  reorderProductImage,
  uploadProductImage,
  updateProductPrice,
  updateProductInventory,
  addProductImageUrl,
} from './actions';
import { Button } from '@/components/ui/Button';
import { ConfirmSubmitButton } from '@/components/admin/ConfirmSubmitButton';

export const dynamic = 'force-dynamic';

export default async function AdminProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
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
      <div className="flex items-center gap-(--space-4) mb-(--space-6)">
        <Link href="/admin/products" className="text-(--color-text-muted) hover:text-(--color-text)">
          ← Back to Products
        </Link>
      </div>

      <div className="flex justify-between items-start mb-(--space-8)">
        <div>
          <h1 className="text-(--text-3xl) font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            {product.name}
          </h1>
          <p className="text-(--color-text-secondary) mt-1">
            SKU: {product.sku}
          </p>
        </div>
        <span className={`badge ${product.status === 'ACTIVE' ? 'badge-success' : product.status === 'DRAFT' ? 'badge-warning' : 'badge-danger'}`}>
          {product.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-(--space-6)">
        {/* Main Product Info */}
        <div className="lg:col-span-2 space-y-(--space-6)">
          <div className="card p-(--space-6)">
            <h2 className="text-(--text-lg) font-semibold mb-(--space-4)">Product Details</h2>
            <form action={updateProduct.bind(null, product.id)} className="space-y-(--space-4)">
              <div>
                <label className="block text-(--text-sm) font-medium mb-1">Name</label>
                <input name="name" defaultValue={product.name} required
                  className="w-full h-10 px-3 rounded-md bg-(--color-bg) border border-(--color-border)" />
              </div>
              <div>
                <label className="block text-(--text-sm) font-medium mb-1">Slug</label>
                <input name="slug" defaultValue={product.slug} required
                  className="w-full h-10 px-3 rounded-md bg-(--color-bg) border border-(--color-border)" />
              </div>
              <div>
                <label className="block text-(--text-sm) font-medium mb-1">SKU</label>
                <input name="sku" defaultValue={product.sku} required
                  className="w-full h-10 px-3 rounded-md bg-(--color-bg) border border-(--color-border)" />
              </div>
              <div>
                <label className="block text-(--text-sm) font-medium mb-1">Description</label>
                <textarea name="description" defaultValue={product.description} required rows={4}
                  className="w-full p-3 rounded-md bg-(--color-bg) border border-(--color-border)" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-(--text-sm) font-medium mb-1">Heat Level (1-10)</label>
                  <input type="number" name="heatLevel" min="1" max="10" defaultValue={product.heatLevel ?? ''}
                    className="w-full h-10 px-3 rounded-md bg-(--color-bg) border border-(--color-border)" />
                </div>
                <div>
                  <label className="block text-(--text-sm) font-medium mb-1">Volume</label>
                  <input name="volume" defaultValue={product.volume ?? ''} placeholder="5 fl oz (148 ml)"
                    className="w-full h-10 px-3 rounded-md bg-(--color-bg) border border-(--color-border)" />
                </div>
              </div>
              <div>
                <label className="block text-(--text-sm) font-medium mb-1">Ingredients</label>
                <textarea name="ingredients" defaultValue={product.ingredients ?? ''} rows={2}
                  className="w-full p-3 rounded-md bg-(--color-bg) border border-(--color-border)" />
              </div>
              <div>
                <label className="block text-(--text-sm) font-medium mb-1">Status</label>
                <select name="status" defaultValue={product.status}
                  className="w-full h-10 px-3 rounded-md bg-(--color-bg) border border-(--color-border)">
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="ARCHIVED">Archived (disabled)</option>
                </select>
              </div>
              {categories.length > 0 && (
                <div>
                  <label className="block text-(--text-sm) font-medium mb-2">Categories</label>
                  <div className="flex flex-wrap gap-4">
                    {categories.map((category) => (
                      <label key={category.id} className="flex items-center gap-2 text-(--text-sm)">
                        <input type="checkbox" name="categoryIds" value={category.id} defaultChecked={selectedCategoryIds.has(category.id)} />
                        {category.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <label className="flex items-center gap-2 text-(--text-sm)">
                <input type="checkbox" name="isFeatured" defaultChecked={product.isFeatured} />
                Feature on homepage
              </label>
              <Button type="submit" variant="primary" className="w-full">Save Product Details</Button>
            </form>
          </div>

          <div className="card p-(--space-6)">
            <h2 className="text-(--text-lg) font-semibold mb-(--space-1)">Images</h2>
            <p className="text-(--text-xs) text-(--color-text-muted) mb-(--space-4)">
              Upload to Cloudinary (or the site&apos;s media host) first, then paste the resulting URL below.
            </p>
            <div className="flex flex-col gap-(--space-3) mb-(--space-5)">
              {product.images.map((img, i) => (
                <div key={img.id} className="flex items-center gap-(--space-3) p-(--space-2) rounded-md border border-(--color-border)">
                  <div className="relative w-16 h-16 bg-(--color-bg-alt) rounded-md shrink-0 flex items-center justify-center">
                    <Image src={img.url} alt={img.altText || product.name} width={48} height={48} className="max-h-14 w-auto object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-(--text-xs) font-mono truncate">{img.url}</p>
                    {img.isFeatured && <span className="badge badge-primary text-[10px] mt-1 inline-block">Featured</span>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <form action={reorderProductImage.bind(null, img.id, 'up')}>
                      <button type="submit" disabled={i === 0} aria-label="Move image up" className="w-8 h-8 rounded-md hover:bg-(--color-surface-hover) disabled:opacity-30 disabled:cursor-not-allowed">↑</button>
                    </form>
                    <form action={reorderProductImage.bind(null, img.id, 'down')}>
                      <button type="submit" disabled={i === product.images.length - 1} aria-label="Move image down" className="w-8 h-8 rounded-md hover:bg-(--color-surface-hover) disabled:opacity-30 disabled:cursor-not-allowed">↓</button>
                    </form>
                    {!img.isFeatured && (
                      <form action={setFeaturedImage.bind(null, img.id)}>
                        <button type="submit" className="text-(--text-xs) px-2 h-8 rounded-md hover:bg-(--color-surface-hover)">Set featured</button>
                      </form>
                    )}
                    <ConfirmSubmitButton
                      action={deleteProductImage.bind(null, img.id)}
                      confirmMessage="Remove this image from the product?"
                      variant="ghost"
                      className="h-8! px-2! text-(--color-danger)"
                    >
                      Remove
                    </ConfirmSubmitButton>
                  </div>
                </div>
              ))}
              {product.images.length === 0 && (
                <p className="text-(--text-sm) text-(--color-text-muted)">No images yet.</p>
              )}
            </div>

            <form
              action={uploadProductImage.bind(null, product.id)}
              className="flex gap-(--space-2) items-end border-t border-(--color-border) pt-(--space-4) mb-(--space-4)"
            >
              <div className="flex-1">
                <label className="block text-(--text-xs) font-medium mb-1">Upload Local Image</label>
                <input
                  name="file"
                  type="file"
                  accept="image/*"
                  required
                  className="w-full h-9 px-2 py-1 rounded-md bg-(--color-bg) border border-(--color-border) text-(--text-sm) file:mr-2 file:py-0.5 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-(--color-surface-hover) file:text-(--color-text)"
                />
              </div>
              <Button type="submit" variant="outline" size="sm">Upload</Button>
            </form>

            <form
              action={addProductImageUrl.bind(null, product.id)}
              className="flex gap-(--space-2) items-end border-t border-(--color-border) pt-(--space-4)"
            >
              <div className="flex-1">
                <label className="block text-(--text-xs) font-medium mb-1">Or Paste Image URL</label>
                <input name="url" type="url" required placeholder="https://res.cloudinary.com/…"
                  className="w-full h-9 px-3 rounded-md bg-(--color-bg) border border-(--color-border) text-(--text-sm)" />
              </div>
              <div className="flex-1">
                <label className="block text-(--text-xs) font-medium mb-1">Alt Text</label>
                <input name="altText" placeholder={product.name}
                  className="w-full h-9 px-3 rounded-md bg-(--color-bg) border border-(--color-border) text-(--text-sm)" />
              </div>
              <Button type="submit" variant="outline" size="sm">Add URL</Button>
            </form>
          </div>
        </div>

        {/* Sidebar Info & Forms */}
        <div className="space-y-(--space-6)">
          {/* Pricing Form */}
          <div className="card p-(--space-5)">
            <h2 className="text-(--text-base) font-semibold mb-(--space-3)">Pricing</h2>
            <form action={updateProductPrice.bind(null, product.id)} className="space-y-(--space-4)">
              <div>
                <label className="block text-(--text-sm) font-medium mb-1">Base Price ($)</label>
                <input
                  type="number"
                  name="basePrice"
                  defaultValue={Number(product.basePrice)}
                  required
                  min="0"
                  step="0.01"
                  className="w-full h-10 px-3 rounded-md bg-(--color-bg) border border-(--color-border)"
                />
              </div>
              <div>
                <label className="block text-(--text-sm) font-medium mb-1">Sale Price ($, optional)</label>
                <input
                  type="number"
                  name="salePrice"
                  defaultValue={product.salePrice ? Number(product.salePrice) : ''}
                  min="0"
                  step="0.01"
                  className="w-full h-10 px-3 rounded-md bg-(--color-bg) border border-(--color-border)"
                />
              </div>
              <Button type="submit" variant="primary" className="w-full">Update Price</Button>
            </form>
          </div>

          {/* Inventory Form */}
          <div className="card p-(--space-5)">
            <h2 className="text-(--text-base) font-semibold mb-(--space-3)">Inventory Management</h2>
            <form action={updateProductInventory.bind(null, product.id)} className="space-y-(--space-4)">
              <div>
                <label className="block text-(--text-sm) font-medium mb-1">Available Quantity</label>
                <input 
                  type="number" 
                  name="quantity" 
                  defaultValue={currentStock} 
                  required
                  min="0"
                  className="w-full h-10 px-3 rounded-md bg-(--color-bg) border border-(--color-border)" 
                />
              </div>
              <div>
                <label className="block text-(--text-sm) font-medium mb-1">Low Stock Alert Threshold</label>
                <input 
                  type="number" 
                  name="lowStockThreshold" 
                  defaultValue={lowStockThreshold} 
                  required
                  min="0"
                  className="w-full h-10 px-3 rounded-md bg-(--color-bg) border border-(--color-border)" 
                />
              </div>
              
              <div className="pt-(--space-2) border-t border-(--color-border)">
                 <p className="text-(--text-xs) text-(--color-text-muted) mb-(--space-3)">
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
