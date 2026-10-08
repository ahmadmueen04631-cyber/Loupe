import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SITE } from "@/lib/seo/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Free image tools that run in your browser`,
    template: `%s | ${SITE.name}`,
  },
  description:
    "Compress, resize, convert and crop images instantly. Free, no signup, and processed in your browser.",
  openGraph: {
    type: "website",
    siteName: SITE.name,
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  themeColor: [
    {
      media: "(prefers-color-scheme: light)",
      color: "#f1f2f5",
    },
    {
      media: "(prefers-color-scheme: dark)",
      color: "#0c0e13",
    },
  ],
};

const themeScript = `try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="google-site-verification"
          content="7tdj4hXcJ83KkP84yjg-Pw8QSnt2Ax0j671WYAt7_-o"
        />
        <script
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
      </head>

      <body className="min-h-screen">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-ink"
        >
          Skip to content
        </a>

        <Header />

        <main id="main">{children}</main>

        <Footer />

        {SITE.gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${SITE.gaId}`}
              strategy="afterInteractive"
            />

            <Script id="ga" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${SITE.gaId}',{anonymize_ip:true});`}
            </Script>
          </>
        )}

        <Analytics />
      </body>
    </html>
  );
}
