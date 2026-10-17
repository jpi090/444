import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Sans, Pixelify_Sans, VT323 } from "next/font/google";
import { CartProvider } from "@/components/CartProvider";
import { TVShell } from "@/components/TVShell";
import "./globals.css";

const display = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-display", display: "swap" });
const body = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body", display: "swap" });
const osd = VT323({ subsets: ["latin"], weight: "400", variable: "--font-osd", display: "swap" });
// The phone LCD face, used on small screens
const lcd = Pixelify_Sans({ subsets: ["latin"], variable: "--font-lcd", display: "swap" });

export const metadata: Metadata = {
  title: { default: "444", template: "%s · 444" },
  description: "A museum of broadcast art, open all night. Walk the gallery on channel 2 and take a print home from channel 3.",
};

export const viewport: Viewport = {
  themeColor: "#0b0d10",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-fx="on" className={`${display.variable} ${body.variable} ${osd.variable} ${lcd.variable}`}>
      <body>
        <CartProvider>
          <TVShell>{children}</TVShell>
        </CartProvider>
      </body>
    </html>
  );
}
