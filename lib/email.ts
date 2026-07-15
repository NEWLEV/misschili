import nodemailer from 'nodemailer';
import pino from 'pino';

const logger = pino({ name: 'email' });

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendEmail(payload: EmailPayload): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: `"Miss Chili Hot Sauce" <${process.env.SMTP_USER || 'noreply@misschilipeppers.com'}>`,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });
    return true;
  } catch (error) {
    logger.error({ error, to: payload.to, subject: payload.subject }, 'Failed to send email');
    return false;
  }
}

// ─── Order Confirmation ─────────────────────────────

interface OrderConfirmationData {
  customerName: string;
  orderNumber: string;
  items: Array<{ name: string; quantity: number; price: string }>;
  subtotal: string;
  shipping: string;
  tax: string;
  total: string;
  shippingAddress: string;
}

export async function sendOrderConfirmation(to: string, data: OrderConfirmationData): Promise<boolean> {
  const itemRows = data.items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 12px; border-bottom: 1px solid #333;">${item.name}</td>
          <td style="padding: 12px; border-bottom: 1px solid #333; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #333; text-align: right;">${item.price}</td>
        </tr>`
    )
    .join('');

  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: 'Helvetica Neue', Arial, sans-serif; background: #1a1210; color: #ede8e3; padding: 40px 24px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <img src="${process.env.NEXT_PUBLIC_APP_URL}/images/logos/MissChili_Logos_MissChili.png" alt="Miss Chili" width="80" style="margin-bottom: 16px;" />
        <h1 style="font-size: 28px; color: #e84c3d; margin: 0;">Order Confirmed!</h1>
      </div>
      <p>Hey ${data.customerName},</p>
      <p>Thanks for your order! We're getting your hot sauce ready to ship. 🌶️</p>
      <div style="background: #231c18; border-radius: 8px; padding: 20px; margin: 24px 0;">
        <p style="margin: 0 0 8px; color: #b8a080;"><strong>Order #${data.orderNumber}</strong></p>
        <table style="width: 100%; border-collapse: collapse; color: #ede8e3;">
          <thead>
            <tr style="border-bottom: 2px solid #e84c3d;">
              <th style="padding: 12px; text-align: left;">Item</th>
              <th style="padding: 12px; text-align: center;">Qty</th>
              <th style="padding: 12px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>
        <div style="margin-top: 16px; text-align: right;">
          <p style="margin: 4px 0; color: #b8a080;">Subtotal: ${data.subtotal}</p>
          <p style="margin: 4px 0; color: #b8a080;">Shipping: ${data.shipping}</p>
          <p style="margin: 4px 0; color: #b8a080;">Tax: ${data.tax}</p>
          <p style="margin: 8px 0 0; font-size: 20px; color: #e84c3d;"><strong>Total: ${data.total}</strong></p>
        </div>
      </div>
      <div style="background: #231c18; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <p style="margin: 0 0 8px; color: #b8a080;"><strong>Shipping to:</strong></p>
        <p style="margin: 0; white-space: pre-line;">${data.shippingAddress}</p>
      </div>
      <p style="color: #b8a080; font-size: 14px; text-align: center;">
        Shake Her Well, Pour Her Slow. 🌶️<br/>
        Miss Chili Hot Sauce, LLC — Miami, FL
      </p>
    </div>
  `;

  return sendEmail({
    to,
    subject: `Order Confirmed — #${data.orderNumber} | Miss Chili Hot Sauce`,
    html,
  });
}

// ─── Shipping Notification ──────────────────────────

interface ShippingNotificationData {
  customerName: string;
  orderNumber: string;
  trackingNumber: string;
  trackingUrl?: string;
}

export async function sendShippingNotification(to: string, data: ShippingNotificationData): Promise<boolean> {
  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: 'Helvetica Neue', Arial, sans-serif; background: #1a1210; color: #ede8e3; padding: 40px 24px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <img src="${process.env.NEXT_PUBLIC_APP_URL}/images/logos/MissChili_Logos_MissChili.png" alt="Miss Chili" width="80" />
        <h1 style="font-size: 28px; color: #e84c3d; margin: 16px 0 0;">Your Order Has Shipped!</h1>
      </div>
      <p>Hey ${data.customerName},</p>
      <p>Your order <strong>#${data.orderNumber}</strong> is on its way! 🚚🌶️</p>
      <div style="background: #231c18; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
        <p style="margin: 0 0 8px; color: #b8a080;">Tracking Number</p>
        <p style="font-size: 20px; margin: 0; font-family: monospace;">${data.trackingNumber}</p>
        ${data.trackingUrl ? `<a href="${data.trackingUrl}" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #e84c3d; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">Track Your Package</a>` : ''}
      </div>
      <p style="color: #b8a080; font-size: 14px; text-align: center;">Miss Chili Hot Sauce, LLC — Miami, FL</p>
    </div>
  `;

  return sendEmail({
    to,
    subject: `Your Order Has Shipped — #${data.orderNumber} | Miss Chili Hot Sauce`,
    html,
  });
}

// ─── Welcome Email ──────────────────────────────────

export async function sendWelcomeEmail(to: string, name: string): Promise<boolean> {
  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: 'Helvetica Neue', Arial, sans-serif; background: #1a1210; color: #ede8e3; padding: 40px 24px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <img src="${process.env.NEXT_PUBLIC_APP_URL}/images/logos/MissChili_Logos_MissChili.png" alt="Miss Chili" width="80" />
        <h1 style="font-size: 28px; color: #e84c3d; margin: 16px 0 0;">Welcome to the Heat! 🔥</h1>
      </div>
      <p>Hey ${name},</p>
      <p>Welcome to Miss Chili Hot Sauce! You've just joined a community of heat seekers who know that great flavor comes with a kick.</p>
      <p>Born in a backyard ghost pepper garden in Miami and popularized by our sailing club crew, Miss Chili is more than hot sauce — it's a lifestyle.</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/products" style="display: inline-block; padding: 14px 32px; background: #e84c3d; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Shop Our Sauces</a>
      </div>
      <p style="color: #b8a080; font-size: 14px; text-align: center;">Shake Her Well, Pour Her Slow. 🌶️</p>
    </div>
  `;

  return sendEmail({
    to,
    subject: 'Welcome to Miss Chili Hot Sauce! 🌶️',
    html,
  });
}

// ─── Password Reset ──────────────────────────────────

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<boolean> {
  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: 'Helvetica Neue', Arial, sans-serif; background: #1a1210; color: #ede8e3; padding: 40px 24px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <img src="${process.env.NEXT_PUBLIC_APP_URL}/images/logos/MissChili_Logos_MissChili.png" alt="Miss Chili" width="80" />
        <h1 style="font-size: 28px; color: #e84c3d; margin: 16px 0 0;">Reset Your Password</h1>
      </div>
      <p>We received a request to reset your password. Click below to choose a new one — this link expires in 1 hour.</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background: #e84c3d; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Reset Password</a>
      </div>
      <p style="color: #b8a080; font-size: 14px;">If you didn't request this, you can safely ignore this email — your password won't be changed.</p>
      <p style="color: #b8a080; font-size: 14px; text-align: center;">Miss Chili Hot Sauce, LLC — Miami, FL</p>
    </div>
  `;

  return sendEmail({
    to,
    subject: 'Reset Your Password | Miss Chili Hot Sauce',
    html,
  });
}

// ─── Admin: New Order Alert ─────────────────────────

interface AdminOrderAlertData {
  orderNumber: string;
  customerEmail: string;
  total: string;
  itemCount: number;
}

export async function sendAdminOrderAlert(data: AdminOrderAlertData): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL || 'misschilihotsauce@gmail.com';
  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: 'Helvetica Neue', Arial, sans-serif; padding: 24px;">
      <h1 style="color: #e84c3d;">🌶️ New Order Received!</h1>
      <p><strong>Order:</strong> #${data.orderNumber}</p>
      <p><strong>Customer:</strong> ${data.customerEmail}</p>
      <p><strong>Items:</strong> ${data.itemCount}</p>
      <p><strong>Total:</strong> ${data.total}</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/orders" style="display: inline-block; padding: 12px 24px; background: #e84c3d; color: white; text-decoration: none; border-radius: 6px;">View in Dashboard</a>
    </div>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `New Order #${data.orderNumber} — ${data.total}`,
    html,
  });
}

// ─── Admin: Low Stock Alert ─────────────────────────

interface LowStockAlertData {
  productName: string;
  sku: string;
  currentStock: number;
  threshold: number;
}

export async function sendLowStockAlert(data: LowStockAlertData): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL || 'misschilihotsauce@gmail.com';
  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: 'Helvetica Neue', Arial, sans-serif; padding: 24px;">
      <h1 style="color: #e84c3d;">⚠️ Low Stock Alert</h1>
      <p><strong>${data.productName}</strong> (SKU: ${data.sku}) is running low.</p>
      <p><strong>Current Stock:</strong> ${data.currentStock} units</p>
      <p><strong>Threshold:</strong> ${data.threshold} units</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/products" style="display: inline-block; padding: 12px 24px; background: #e84c3d; color: white; text-decoration: none; border-radius: 6px;">Manage Inventory</a>
    </div>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `Low Stock: ${data.productName} (${data.currentStock} remaining)`,
    html,
  });
}
