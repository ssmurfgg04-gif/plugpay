import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://plugpay.co.ke'),
  title: {
    default: 'PlugPay: The trust layer for Kenya\'s WhatsApp commerce',
    template: '%s | PlugPay',
  },
  description:
    'PlugPay verifies every seller from Nairobi\'s commercial buildings, anchors every sale to a real WhatsApp receipt, and turns your chat into a storefront buyers can actually trust. No app, no upfront risk.',
  keywords: [
    'verified sellers Kenya', 'WhatsApp commerce Nairobi', 'Nairobi CBD traders',
    'trust score', 'M-Pesa receipts', 'jua kali marketplace',
  ],
  icons: {
    icon: '/logo.svg',
    apple: '/logo.svg',
  },
  openGraph: {
    title: 'PlugPay: The trust layer for Kenya\'s WhatsApp commerce',
    description: 'Verified traders. Real receipts. Buyers who trust you before they pay.',
    locale: 'en_KE',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-KE">
      <body className="min-h-screen flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
