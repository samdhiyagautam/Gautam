import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ExperienceForm } from "@/components/admin/experience-form";
import { getAdminExperience } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Edit Experience",
  description: "Edit a work experience entry",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditExperiencePage({ params }: PageProps) {
  const { id } = await params;
  const experience = await getAdminExperience(id);

  if (!experience) {
    // Falls back to local content when Supabase is unavailable — only DB rows are editable.
    notFound();
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Experience</h1>
          <p className="text-muted-foreground">{experience.designation} · {experience.company}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/experience">
            <span>← Back</span>
          </Link>
        </Button>
      </div>
      <ExperienceForm initial={experience} />
    </div>
  );
}
