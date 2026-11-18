import { Navigation } from "@/components/portfolio/navigation";
import { Footer } from "@/components/portfolio/footer";
import { getPublishedProfile } from "@/lib/cms";

// Shared chrome for the standalone editorial pages (/about, /experience, ...).
// The home page keeps its own hero-first chrome, so it lives outside this group.
// pt-16 offsets the fixed-height Navigation header.
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const profile = await getPublishedProfile();
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navigation />
      <main className="flex-1 pt-16" id="main-content">
        {children}
      </main>
      <Footer profile={profile} />
    </div>
  );
}
