import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ExperienceForm } from "@/components/admin/experience-form";

export const metadata: Metadata = {
  title: "New Experience",
  description: "Add a work experience entry",
};

export default function NewExperiencePage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Experience</h1>
          <p className="text-muted-foreground">Starts as a draft until you publish it.</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/experience">
            <span>← Back</span>
          </Link>
        </Button>
      </div>
      <ExperienceForm />
    </div>
  );
}
