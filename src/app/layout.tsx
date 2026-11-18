import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "sonner";
import { getSeoSettings, getPublishedProfile } from "@/lib/cms";
import { getSiteUrl } from "@/lib/site-url";
import { isPlaceholderLink } from "@/lib/utils";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const FALLBACK_TITLE =
  "Gautam Samdhiya | Data Analyst (SQL, Power BI, Excel, Python)";
const FALLBACK_DESCRIPTION =
  "Data Analyst with 2+ years of professional experience as an Assistant Manager. Transforming messy operational data into reliable Power BI dashboards, automated SQL/Python pipelines, and clear business decisions.";

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
  // A default OG image now ships in public/ — fall back to it when Admin → SEO
  // has none set, so every link preview renders correctly.
  const ogImage = clean(seo?.ogImage) ?? "/og-image.png";
  const siteUrl = getSiteUrl();
  // Optional identifiers: omitted entirely when unset so metadata never
  // emits a placeholder value.
  const twitterHandle = process.env.NEXT_PUBLIC_TWITTER_HANDLE || undefined;
  const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || undefined;

  return {
    metadataBase: new URL(siteUrl),
    alternates: { canonical: "/" },
    title: {
      default: title,
      template: "%s | Gautam Samdhiya",
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
      "Excel",
      "Business Intelligence",
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
      siteName: "Gautam Samdhiya",
      title,
      description,
      ...(ogImage
        ? { images: [{ url: ogImage, width: 1200, height: 630, alt: "Gautam Samdhiya — Data Analyst" }] }
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
    { media: "(prefers-color-scheme: light)", color: "#F7F7F5" },
    { media: "(prefers-color-scheme: dark)", color: "#080808" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const profile = await getPublishedProfile();
  const siteUrl = getSiteUrl();
  const sameAs = [profile.linkedin, profile.github].filter((url) => !isPlaceholderLink(url));
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name.includes("[ADD") ? "Gautam Samdhiya" : profile.name,
    jobTitle: "Data Analyst",
    description: profile.headline,
    url: siteUrl,
    worksFor: {
      "@type": "Organization",
      name: "Dhurina",
    },
    knowsAbout: ["Data Analysis", "SQL", "Python", "Power BI", "Excel", "Business Reporting", "AI Automation", "Next.js"],
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };

  return (
    <html suppressHydrationWarning lang="en" className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        <Providers>
          {children}
          <Toaster richColors position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
