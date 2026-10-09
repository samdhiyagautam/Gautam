"use client";

import { useActionState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, Eye, Download, Trash2, Loader2, FileText } from "lucide-react";
import { uploadResume, setResumeStatus, deleteResume } from "@/actions/admin";
import { AdminForm, SubmitButton, FieldError } from "./form-ui";
import type { Resume } from "@/types";

function ResumeRowButtons({ resume }: { resume: Resume }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const run = (action: Promise<{ ok: boolean; message: string }>) => {
    startTransition(async () => {
      const result = await action;
      if (result.ok) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" asChild>
        <a href={resume.fileUrl} target="_blank" rel="noopener noreferrer">
          <Eye className="h-4 w-4 mr-2" />
          View
        </a>
      </Button>
      <Button variant="outline" size="sm" asChild>
        <a href={resume.fileUrl} download={resume.fileName}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </a>
      </Button>
      {resume.status === "published" ? (
        <Button variant="outline" size="sm" disabled={pending} onClick={() => run(setResumeStatus(resume.id, "draft"))}>
          Unpublish
        </Button>
      ) : (
        <Button variant="premium" size="sm" disabled={pending} onClick={() => run(setResumeStatus(resume.id, "published"))}>
          Publish
        </Button>
      )}
      <Button
        variant="destructive"
        size="sm"
        disabled={pending}
        onClick={() => {
          if (!window.confirm(`Delete resume ${resume.version}? This cannot be undone.`)) return;
          run(deleteResume(resume.id));
        }}
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
        Remove
      </Button>
    </div>
  );
}

export function ResumeManager({ resumes }: { resumes: Resume[] }) {
  const [state, formAction, isPending] = useActionState(uploadResume, { ok: true, message: "" });

  useEffect(() => {
    if (!state.message) return;
    if (state.ok) toast.success(state.message);
    else toast.error(state.message);
  }, [state]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl">Upload Resume</CardTitle>
              <p className="text-sm text-muted-foreground">PDF only, max 5 MB. Uploads land as drafts.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AdminForm action={formAction} pending={isPending} className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="space-y-2 flex-1 w-full">
              <Label htmlFor="resume">PDF File *</Label>
              <Input id="resume" name="resume" type="file" accept="application/pdf" required />
              <FieldError message={"ok" in state && !state.ok ? state.message : undefined} />
            </div>
            <SubmitButton>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </SubmitButton>
          </AdminForm>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Versions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {resumes.length === 0 && (
            <p className="text-sm text-muted-foreground">No resumes uploaded yet.</p>
          )}
          {resumes.map((resume) => (
            <div key={resume.id} className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 rounded-xl border border-border">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{resume.fileName}</p>
                  <Badge variant={resume.status === "published" ? "premium" : "outline"}>{resume.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {resume.version} · {(resume.fileSize / 1024).toFixed(0)} KB · uploaded{" "}
                  {new Date(resume.uploadedAt).toLocaleDateString()}
                </p>
              </div>
              <ResumeRowButtons resume={resume} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
