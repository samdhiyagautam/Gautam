import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ResumeManager } from "@/components/admin/resume-manager";
import { getAllResumes } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Resume",
  description: "Manage your resume",
};

export default async function AdminResume() {
  const resumes = await getAllResumes();

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resume</h1>
          <p className="text-muted-foreground">Upload versions, publish one to go live.</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin">
            <span>← Dashboard</span>
          </Link>
        </Button>
      </div>

      <ResumeManager resumes={resumes} />
    </div>
  );
}
