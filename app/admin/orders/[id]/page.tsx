import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { updateOrderStatus, refundOrder } from './actions';
import { Button } from '@/components/ui/Button';
import { ConfirmSubmitButton } from '@/components/admin/ConfirmSubmitButton';
import type { OrderStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      user: true,
      shippingAddress: true,
      payment: true,
    },
  });

  if (!order) return notFound();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-(--space-4) mb-(--space-6)">
        <Link href="/admin/orders" className="text-(--color-text-muted) hover:text-(--color-text)">
          ← Back to Orders
        </Link>
      </div>

      <div className="flex justify-between items-start mb-(--space-8)">
        <div>
          <h1 className="text-(--text-3xl) font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            Order {order.orderNumber}
          </h1>
          <p className="text-(--color-text-secondary) mt-1">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`badge ${order.status === 'DELIVERED' ? 'badge-success' : order.status === 'CANCELLED' ? 'badge-danger' : 'badge-primary'}`}>
            {order.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-(--space-6)">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-(--space-6)">
          {/* Items */}
          <div className="card p-(--space-6)">
            <h2 className="text-(--text-lg) font-semibold mb-(--space-4)">Items</h2>
            <div className="divide-y divide-(--color-border)">
              {order.items.map((item) => (
                <div key={item.id} className="py-(--space-3) flex justify-between">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-(--text-sm) text-(--color-text-muted)">SKU: {item.productSku}</p>
                  </div>
                  <div className="text-right">
                    <p>{formatPrice(Number(item.unitPrice))} × {item.quantity}</p>
                    <p className="font-semibold">{formatPrice(Number(item.totalPrice))}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-(--color-border) mt-(--space-4) pt-(--space-4) space-y-(--space-2) text-(--text-sm)">
              <div className="flex justify-between"><span className="text-(--color-text-muted)">Subtotal</span><span>{formatPrice(Number(order.subtotal))}</span></div>
              <div className="flex justify-between"><span className="text-(--color-text-muted)">Shipping</span><span>{formatPrice(Number(order.shippingCost))}</span></div>
              <div className="flex justify-between"><span className="text-(--color-text-muted)">Tax</span><span>{formatPrice(Number(order.taxAmount))}</span></div>
              <div className="flex justify-between font-bold text-(--text-base) pt-(--space-2) border-t border-(--color-border)">
                <span>Total</span><span>{formatPrice(Number(order.total))}</span>
              </div>
            </div>
          </div>

          {/* Admin Actions */}
          <div className="card p-(--space-6)">
            <h2 className="text-(--text-lg) font-semibold mb-(--space-4)">Manage Order</h2>
            <form action={async (formData) => {
              'use server';
              await updateOrderStatus(
                order.id,
                formData.get('status') as OrderStatus,
                formData.get('adminNotes') as string,
                formData.get('trackingNumber') as string,
                formData.get('trackingUrl') as string
              );
            }} className="space-y-(--space-4)">
              <div>
                <label className="block text-(--text-sm) font-medium mb-1">Status</label>
                <select name="status" defaultValue={order.status} className="w-full h-10 px-3 rounded-md bg-(--color-bg) border border-(--color-border)">
                  {['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                  {order.status === 'REFUNDED' && <option value="REFUNDED">REFUNDED</option>}
                </select>
                <p className="text-(--text-xs) text-(--color-text-muted) mt-1">Refunds are issued separately below — they move real money through Stripe.</p>
              </div>
              <div className="grid grid-cols-2 gap-(--space-4)">
                <div>
                  <label className="block text-(--text-sm) font-medium mb-1">Tracking Number</label>
                  <input name="trackingNumber" defaultValue={order.trackingNumber || ''} className="w-full h-10 px-3 rounded-md bg-(--color-bg) border border-(--color-border)" />
                </div>
                <div>
                  <label className="block text-(--text-sm) font-medium mb-1">Tracking URL</label>
                  <input name="trackingUrl" type="url" defaultValue={order.trackingUrl || ''} placeholder="https://…" className="w-full h-10 px-3 rounded-md bg-(--color-bg) border border-(--color-border)" />
                </div>
              </div>
              <div>
                <label className="block text-(--text-sm) font-medium mb-1">Admin Notes (Internal)</label>
                <textarea name="adminNotes" defaultValue={order.adminNotes || ''} rows={3} className="w-full p-3 rounded-md bg-(--color-bg) border border-(--color-border)"></textarea>
              </div>
              <Button type="submit" variant="primary">Save Changes</Button>
            </form>
          </div>

          {/* Refund */}
          {order.payment && order.payment.status === 'SUCCEEDED' && (
            <div className="card p-(--space-6)">
              <h2 className="text-(--text-lg) font-semibold mb-(--space-2)">Refund</h2>
              <p className="text-(--text-sm) text-(--color-text-secondary) mb-(--space-4)">
                Issues a real refund through Stripe for the full amount ({formatPrice(Number(order.total))}) and marks the order Refunded once confirmed.
              </p>
              <ConfirmSubmitButton
                action={async () => await refundOrder(order.id)}
                confirmMessage={`Refund ${formatPrice(Number(order.total))} to the customer via Stripe? This cannot be undone.`}
                variant="danger"
              >
                Issue Refund
              </ConfirmSubmitButton>
            </div>
          )}
          {order.payment?.status === 'REFUNDED' && (
            <div className="card p-(--space-6)">
              <h2 className="text-(--text-lg) font-semibold mb-(--space-2)">Refund</h2>
              <p className="text-(--text-sm) text-(--color-success)">This order has been refunded.</p>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-(--space-6)">
          {/* Customer */}
          <div className="card p-(--space-5)">
            <h2 className="text-(--text-base) font-semibold mb-(--space-3)">Customer</h2>
            <div className="text-(--text-sm) text-(--color-text-secondary)">
              {order.user ? (
                <>
                  <p className="font-medium text-(--color-text)">{order.user.name}</p>
                  <p>{order.user.email}</p>
                </>
              ) : (
                <>
                  <p className="font-medium text-(--color-text)">Guest</p>
                  <p>{order.guestEmail}</p>
                </>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="card p-(--space-5)">
              <h2 className="text-(--text-base) font-semibold mb-(--space-3)">Shipping Address</h2>
              <div className="text-(--text-sm) text-(--color-text-secondary) space-y-1">
                <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                {order.shippingAddress.company && <p>{order.shippingAddress.company}</p>}
                <p>{order.shippingAddress.address1}</p>
                {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>
          )}

          {/* Payment */}
          <div className="card p-(--space-5)">
            <h2 className="text-(--text-base) font-semibold mb-(--space-3)">Payment</h2>
            {order.payment ? (
              <div className="text-(--text-sm) space-y-2">
                <p><span className="text-(--color-text-muted)">Status:</span> <span className="font-medium text-(--color-success)">{order.payment.status}</span></p>
                {order.payment.stripePaymentIntentId && (
                  <p className="text-[11px] font-mono bg-(--color-surface-hover) p-1 rounded break-all">
                    {order.payment.stripePaymentIntentId}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-(--text-sm) text-(--color-text-muted)">No payment info.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
