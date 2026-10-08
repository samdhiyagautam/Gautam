import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "sonner";
import { getSeoSettings } from "@/lib/cms";

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
  const title = seo?.pageTitle || FALLBACK_TITLE;
  const description = seo?.metaDescription || FALLBACK_DESCRIPTION;
  const ogImage = seo?.ogImage || "/og-image.png";

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
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
      url: "https://[ADD YOUR DOMAIN]",
      siteName: "Gautam Samdhiya Portfolio",
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "Gautam Samdhiya Portfolio",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Gautam Samdhiya | Data Analyst",
      description:
        "Data Analyst with 2+ years of experience as an Assistant Manager. SQL, Python, Power BI, Excel.",
      images: [ogImage],
      creator: "[ADD YOUR TWITTER HANDLE]",
    },
    verification: {
      google: "[ADD GOOGLE VERIFICATION CODE]",
    },
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
