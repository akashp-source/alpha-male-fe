
import type { Metadata } from "next";
import { Cinzel, Montserrat } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import ClarityAnalytics from "@/Components/Clarity";
import AttributionCapture from "@/Components/AttributionCapture";
import WhatsAppFloat from "@/Components/WhatsAppFloat";
import GoogleTagManager from "@/Components/GoogleTagManager";
const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cinzel",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.alphamale.co.in"),
  title: {
    default:
      "Buy Condoms & Men's Sexual Wellness Online in India | Alpha Male",
    template: "%s | Alpha Male",
  },
  description:
    "Shop Alpha Male condoms, lubricants and men's wellness products. Plain-pack, discreet delivery across India.",
  openGraph: {
    siteName: "Alpha Male",
    locale: "en_IN",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body">
        <ClarityAnalytics />
        {/* Remembers utm_* tags from landing URLs for order attribution */}
        <Suspense fallback={null}>
          <AttributionCapture />
        </Suspense>
        <GoogleTagManager />
        {children}
        <WhatsAppFloat />
      </body>
    </html>
  );
}
