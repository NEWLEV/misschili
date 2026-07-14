import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { updateInventory } from './actions';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export default async function AdminProductDetailPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      images: true,
      inventory: true,
    },
  });

  if (!product) return notFound();

  const currentStock = product.inventory?.quantity || 0;
  const lowStockThreshold = product.inventory?.lowStockThreshold || 5;

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
            <div className="space-y-[var(--space-4)]">
              <div>
                <p className="text-[var(--text-sm)] font-medium text-[var(--color-text-muted)]">Description</p>
                <p className="text-[var(--text-sm)] mt-1">{product.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[var(--text-sm)] font-medium text-[var(--color-text-muted)]">Base Price</p>
                  <p className="text-[var(--text-base)] font-semibold tabular-nums">${Number(product.basePrice).toFixed(2)}</p>
                </div>
                {product.salePrice && (
                  <div>
                    <p className="text-[var(--text-sm)] font-medium text-[var(--color-text-muted)]">Sale Price</p>
                    <p className="text-[var(--text-base)] font-semibold tabular-nums text-[var(--color-danger)]">${Number(product.salePrice).toFixed(2)}</p>
                  </div>
                )}
                <div>
                  <p className="text-[var(--text-sm)] font-medium text-[var(--color-text-muted)]">Heat Level</p>
                  <p className="text-[var(--text-base)]">{product.heatLevel ? `${product.heatLevel} / 10` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[var(--text-sm)] font-medium text-[var(--color-text-muted)]">Volume</p>
                  <p className="text-[var(--text-base)]">{product.volume || 'N/A'}</p>
                </div>
              </div>
            </div>
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
