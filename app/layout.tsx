import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/storefront/ThemeProvider';
import { CartProvider } from '@/components/storefront/CartProvider';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { CartDrawer } from '@/components/storefront/CartDrawer';
import { PopupManager } from '@/components/storefront/PopupManager';

export const metadata: Metadata = {
  title: {
    default: 'Miss Chili Hot Sauce — Ghost Pepper Heat, Miami Soul',
    template: '%s | Miss Chili Hot Sauce',
  },
  description:
    'Handcrafted hot sauces born in Miami. Ghost pepper heat meets bold Caribbean flavor. Fiery Heat & Spicy Hot varieties. Shake her well, pour her slow.',
  keywords: ['hot sauce', 'ghost pepper', 'habanero', 'jalapeño', 'Miami', 'Florida', 'spicy', 'Miss Chili'],
  authors: [{ name: 'Miss Chili Hot Sauce, LLC' }],
  creator: 'Miss Chili Hot Sauce, LLC',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://www.misschilipeppers.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Miss Chili Hot Sauce',
    title: 'Miss Chili Hot Sauce — Ghost Pepper Heat, Miami Soul',
    description:
      'Handcrafted hot sauces born in a backyard ghost pepper garden in Miami. Two bold varieties that bring the heat.',
    images: [
      {
        url: '/images/logos/MissChili_Logos_MissChili.png',
        width: 512,
        height: 700,
        alt: 'Miss Chili Hot Sauce Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Miss Chili Hot Sauce',
    description: 'Ghost Pepper Heat, Miami Soul. Handcrafted hot sauces from Miami, FL.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/images/logos/MissChili_Logos_MissChili2.png',
    apple: '/images/logos/MissChili_Logos_MissChili2.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 'light';
                document.documentElement.setAttribute('data-theme', theme);
              } catch {}
            `,
          }}
        />
        <link
          rel="preconnect"
          href="https://api.fontshare.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://cdn.fontshare.com"
          crossOrigin="anonymous"
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <CartProvider>
            <Header />
            <CartDrawer />
            <PopupManager />
            <main id="main-content">{children}</main>
            <Footer />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
