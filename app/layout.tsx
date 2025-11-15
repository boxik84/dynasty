import type { Metadata } from "next";
import "./globals.css";

//CONFIG
import { siteConfig } from "@/config/site"

import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

import { NavbarDemo } from "@/components/nav-bar";
import Footer from "@/components/footer";
import CookieBanner from "@/components/cookie-banner";

import { Toaster } from "@/components/ui/sonner"

//vercel
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"

import { fontSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { StickyBanner } from "@/components/ui/sticky-banner";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  metadataBase: new URL(siteConfig.url),
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [
    {
      name: "Retrovax Team",
      url: "https://github.com/retrovax",
    },
  ],
  creator: "Retrovax Development",
  openGraph: {
    type: "website",
    locale: "cs_CZ",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage || "/default-og-image.png",
        width: 800,
        height: 600,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage || "/default-og-image.png"],
    creator: "@retrovax_rp",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/favicon.ico", sizes: "16x16", type: "image/x-icon" }
    ],
    shortcut: "/favicon.ico",
    apple: "/logo.png",
    other: [
      {
        rel: "icon",
        type: "image/png",
        sizes: "192x192",
        url: "/logo.png",
      },
      {
        rel: "icon", 
        type: "image/png",
        sizes: "512x512",
        url: "/logo.png",
      }
    ]
  },
  alternates: {
    canonical: siteConfig.url,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen font-sans antialiased",
          fontSans.variable
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <TooltipProvider>
            <StickyBanner
              ctaHref={siteConfig.links.store}
              ctaLabel="Navštívit obchod"
            >
              🛒 Kup si VIP na našem obchodě a získej exkluzivní výhody pro celý tým.
            </StickyBanner>
            <NavbarDemo />
            <div className="flex-1">{children}</div>
            <Toaster />
            <CookieBanner />
            <Footer />
            <SpeedInsights />
            <Analytics />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}