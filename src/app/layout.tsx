import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "sonner";
import { getSeoSettings } from "@/lib/cms";
import { getSiteUrl } from "@/lib/site-url";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const FALLBACK_TITLE =
  "Gautam Samdhiya | Data Analyst (SQL, Python, Power BI, Excel)";
const FALLBACK_DESCRIPTION =
  "Data Analyst with 2+ years of professional experience as an Assistant Manager. SQL, Python, Power BI and Excel for business reporting, dashboards and practical problem-solving.";

// Site metadata comes from published SEO settings when Supabase is
// configured, otherwise from the built-in defaults below.
export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  // Empty values and unfilled "[ADD ...]" scaffold placeholders count as "not set".
  const clean = (value: string | null | undefined): string | undefined => {
    const v = value?.trim();
    return v && !v.includes("[ADD") ? v : undefined;
  };
  const title = clean(seo?.pageTitle) ?? FALLBACK_TITLE;
  const description = clean(seo?.metaDescription) ?? FALLBACK_DESCRIPTION;
  // No image is advertised until one is set in Admin → SEO: a missing file would 404 in every link preview.
  const ogImage = clean(seo?.ogImage);
  const siteUrl = getSiteUrl();
  // Optional identifiers: omitted entirely when unset so metadata never
  // emits a placeholder value.
  const twitterHandle = process.env.NEXT_PUBLIC_TWITTER_HANDLE || undefined;
  const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || undefined;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: "%s | Gautam Samdhiya Portfolio",
    },
    description,
    keywords: [
      "Data Analyst",
      "Assistant Manager",
      "Data Analytics",
      "Business Analyst",
      "Power BI",
      "SQL",
      "Python",
      "AI Automation",
      "Next.js",
      "Web Development",
    ],
    authors: [{ name: "Gautam Samdhiya" }],
    creator: "Gautam Samdhiya",
    publisher: "Gautam Samdhiya",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: siteUrl,
      siteName: "Gautam Samdhiya Portfolio",
      title,
      description,
      ...(ogImage
        ? { images: [{ url: ogImage, width: 1200, height: 630, alt: "Gautam Samdhiya Portfolio" }] }
        : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: "Gautam Samdhiya | Data Analyst",
      description:
        "Data Analyst with 2+ years of experience as an Assistant Manager. SQL, Python, Power BI, Excel.",
      ...(ogImage ? { images: [ogImage] } : {}),
      ...(twitterHandle ? { creator: twitterHandle } : {}),
    },
    ...(googleVerification ? { verification: { google: googleVerification } } : {}),
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          {children}
          <Toaster richColors position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
