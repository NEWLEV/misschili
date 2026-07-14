import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      images: { where: { isFeatured: true }, take: 1 },
      inventory: true,
      categories: { include: { category: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-[var(--space-6)]">
        <h1 className="text-[var(--text-3xl)] font-bold" style={{ fontFamily: 'var(--font-display)' }}>Products</h1>
        <Link href="/admin/products/new">
          <Button variant="primary">Add Product</Button>
        </Link>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-surface-hover)] border-b border-[var(--color-border)]">
                <th className="p-[var(--space-4)] text-[var(--text-sm)] font-semibold text-[var(--color-text-secondary)]">Product</th>
                <th className="p-[var(--space-4)] text-[var(--text-sm)] font-semibold text-[var(--color-text-secondary)]">Status</th>
                <th className="p-[var(--space-4)] text-[var(--text-sm)] font-semibold text-[var(--color-text-secondary)]">Inventory</th>
                <th className="p-[var(--space-4)] text-[var(--text-sm)] font-semibold text-[var(--color-text-secondary)]">Price</th>
                <th className="p-[var(--space-4)] text-[var(--text-sm)] font-semibold text-[var(--color-text-secondary)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {products.map((product) => {
                const stock = product.inventory ? product.inventory.quantity - product.inventory.reservedQuantity : 0;
                const lowStock = product.inventory ? stock <= product.inventory.lowStockThreshold : false;

                return (
                  <tr key={product.id} className="hover:bg-[var(--color-surface-hover)] transition-colors">
                    <td className="p-[var(--space-4)]">
                      <div className="flex items-center gap-[var(--space-3)]">
                        <div className="w-12 h-12 rounded bg-[var(--color-bg-alt)] flex items-center justify-center shrink-0">
                          {product.images[0]?.url ? (
                            <Image src={product.images[0].url} alt={product.name} width={32} height={44} className="h-10 w-auto object-contain" />
                          ) : (
                            <span className="text-[var(--text-xs)] text-[var(--color-text-muted)]">No img</span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--text-sm)]">{product.name}</p>
                          <p className="text-[var(--text-xs)] text-[var(--color-text-muted)]">SKU: {product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-[var(--space-4)]">
                      <span className={`badge ${product.status === 'ACTIVE' ? 'badge-success' : product.status === 'DRAFT' ? 'badge-warning' : 'badge-danger'}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="p-[var(--space-4)]">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${lowStock ? 'bg-[var(--color-danger)]' : 'bg-[var(--color-success)]'}`} />
                        <span className="text-[var(--text-sm)]">{stock} in stock</span>
                      </div>
                    </td>
                    <td className="p-[var(--space-4)] text-[var(--text-sm)] tabular-nums">
                      {formatPrice(Number(product.basePrice))}
                    </td>
                    <td className="p-[var(--space-4)] text-right">
                      <Link href={`/admin/products/${product.id}`}>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-[var(--space-8)] text-center text-[var(--color-text-muted)]">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
