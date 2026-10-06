import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SkillForm } from "@/components/admin/skill-form";
import { getAdminSkill } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Edit Skill",
  description: "Edit a skill",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSkillPage({ params }: PageProps) {
  const { id } = await params;
  const skill = await getAdminSkill(id);

  if (!skill) {
    notFound();
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Skill</h1>
          <p className="text-muted-foreground">{skill.name}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/skills">
            <span>← Back</span>
          </Link>
        </Button>
      </div>
      <SkillForm initial={skill} />
    </div>
  );
}
