import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppRoot } from "@/components/shared/AppRoot";

export const metadata: Metadata = {
  title: "PlugPay — The trust layer for Kenya's WhatsApp commerce",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;500;600;700;800&family=DM+Mono:wght@500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* #root is kept: the landing CSS targets "#root > nav.nav" etc. */}
        <div id="root">
          <AppRoot>{children}</AppRoot>
        </div>
      </body>
    </html>
  );
}