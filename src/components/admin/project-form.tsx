"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { FolderKanban } from "lucide-react";
import { saveProject } from "@/actions/admin";
import { AdminForm, SubmitButton, StatusField, ChoiceField, FieldError } from "./form-ui";
import { PROJECT_CATEGORIES } from "@/lib/constants";
import type { Project } from "@/types";

function joinLines(list: string[]): string {
  return list.join("\n");
}

export function ProjectForm({ initial }: { initial?: Project | null }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(saveProject, { ok: true, message: "" });

  useEffect(() => {
    if (!state.message) return;
    if (state.ok) toast.success(state.message);
    else toast.error(state.message);
    // A created entry has no id yet — leave the form so a second Save cannot insert a duplicate.
    if (state.ok && !initial) router.push("/admin/projects");
  }, [state, initial, router]);

  const fields = "fields" in state ? state.fields : undefined;

  return (
    <AdminForm action={formAction} pending={isPending} className="space-y-6">
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <FolderKanban className="h-5 w-5 text-primary" />
            <CardTitle>{initial ? "Edit Project" : "New Project"}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input id="name" name="name" defaultValue={initial?.name ?? ""} required />
              <FieldError message={fields?.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">My Role</Label>
              <Input id="role" name="role" defaultValue={initial?.role ?? ""} />
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <ChoiceField
              name="category"
              label="Category"
              defaultValue={initial?.category ?? "data-analytics"}
              options={PROJECT_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
            />
            <div className="space-y-2">
              <Label htmlFor="displayOrder">Order</Label>
              <Input id="displayOrder" name="displayOrder" type="number" min={0} defaultValue={initial?.order ?? 0} />
            </div>
            <StatusField defaultValue={initial?.status ?? "draft"} />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="isFeatured">Featured</Label>
              <p className="text-sm text-muted-foreground">Featured projects appear in “Core Projects”.</p>
            </div>
            <Switch id="isFeatured" name="isFeatured" defaultChecked={initial?.isFeatured ?? false} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="problem">Problem *</Label>
            <Textarea id="problem" name="problem" rows={3} defaultValue={initial?.problem ?? ""} required />
            <FieldError message={fields?.problem} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="approach">Approach</Label>
            <Textarea id="approach" name="approach" rows={3} defaultValue={initial?.approach ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="solution">Solution</Label>
            <Textarea id="solution" name="solution" rows={3} defaultValue={initial?.solution ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="outcome">Outcome (qualitative only — never invent metrics)</Label>
            <Textarea id="outcome" name="outcome" rows={3} defaultValue={initial?.outcome ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="keyFeaturesText">Key Features (one per line)</Label>
            <Textarea id="keyFeaturesText" name="keyFeaturesText" rows={5} defaultValue={initial ? joinLines(initial.keyFeatures) : ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="technologiesText">Technologies (comma or line separated)</Label>
            <Input id="technologiesText" name="technologiesText" defaultValue={initial ? initial.technologies.join(", ") : ""} />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="githubUrl">GitHub URL</Label>
              <Input id="githubUrl" name="githubUrl" defaultValue={initial?.githubUrl ?? ""} placeholder="https://github.com/..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="liveDemoUrl">Live Demo URL</Label>
              <Input id="liveDemoUrl" name="liveDemoUrl" defaultValue={initial?.liveDemoUrl ?? ""} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caseStudyUrl">Case Study URL</Label>
              <Input id="caseStudyUrl" name="caseStudyUrl" defaultValue={initial?.caseStudyUrl ?? ""} placeholder="https://..." />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="thumbnail">Thumbnail URL</Label>
              <Input id="thumbnail" name="thumbnail" defaultValue={initial?.thumbnail ?? ""} placeholder="https://... or /uploads/..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="screenshotsText">Screenshots (one URL per line)</Label>
              <Textarea id="screenshotsText" name="screenshotsText" rows={2} defaultValue={initial ? joinLines(initial.screenshots) : ""} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="datasetUrl">Google Sheets / Dataset URL</Label>
              <Input id="datasetUrl" name="datasetUrl" defaultValue={initial?.datasetUrl ?? ""} placeholder="https://docs.google.com/spreadsheets/..." />
              <FieldError message={fields?.datasetUrl} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="attachmentFiles">Excel / CSV Files (max 5 MB each)</Label>
              <Input id="attachmentFiles" name="attachmentFiles" type="file" multiple accept=".xlsx,.xls,.csv" />
            </div>
          </div>
          {initial && initial.attachments.length > 0 && (
            <div className="space-y-2">
              <Label>Attached files (check to remove)</Label>
              <div className="space-y-1">
                {initial.attachments.map((url) => (
                  <label key={url} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="removeAttachments" value={url} className="h-4 w-4" />
                    <span className="truncate text-muted-foreground">{url.split("/").pop()}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="videoUrl">YouTube / Video URL</Label>
              <Input id="videoUrl" name="videoUrl" defaultValue={initial?.videoUrl ?? ""} placeholder="https://www.youtube.com/watch?v=..." />
              <FieldError message={fields?.videoUrl} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="videoFiles">Video Files MP4/WebM (max 50 MB each)</Label>
              <Input id="videoFiles" name="videoFiles" type="file" multiple accept=".mp4,.webm" />
            </div>
          </div>
          {initial && initial.videos.length > 0 && (
            <div className="space-y-2">
              <Label>Uploaded videos (check to remove)</Label>
              <div className="space-y-1">
                {initial.videos.map((url) => (
                  <label key={url} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="removeVideos" value={url} className="h-4 w-4" />
                    <span className="truncate text-muted-foreground">{url.split("/").pop()}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-end">
        <SubmitButton>{initial ? "Save Changes" : "Create Project"}</SubmitButton>
      </div>
    </AdminForm>
  );
}
