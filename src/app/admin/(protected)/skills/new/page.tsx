import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SkillForm } from "@/components/admin/skill-form";

export const metadata: Metadata = {
  title: "New Skill",
  description: "Add a skill",
};

export default function NewSkillPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Skill</h1>
          <p className="text-muted-foreground">Active skills appear on the site immediately.</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/skills">
            <span>← Back</span>
          </Link>
        </Button>
      </div>
      <SkillForm />
    </div>
  );
}
