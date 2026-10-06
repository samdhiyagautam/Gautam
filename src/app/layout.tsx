import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster";
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
  "[ADD YOUR NAME] | Assistant Manager | Data Analytics | AI-Enabled Business Solutions";
const FALLBACK_DESCRIPTION =
  "Assistant Manager with 2+ years of professional experience, combining business understanding, data analytics, AI-assisted workflows, and modern technology to solve practical problems.";

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
      template: "%s | [ADD YOUR NAME] Portfolio",
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
    authors: [{ name: "[ADD YOUR NAME]" }],
    creator: "[ADD YOUR NAME]",
    publisher: "[ADD YOUR NAME]",
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
      siteName: "[ADD YOUR NAME] Portfolio",
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "[ADD YOUR NAME] Portfolio",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "[ADD YOUR NAME] | Assistant Manager | Data Analytics",
      description:
        "Assistant Manager with 2+ years of experience in data analytics, AI-enabled workflows, and web development.",
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
