"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { FolderKanban, Image as ImageIcon } from "lucide-react";
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
  const [selectedShotNames, setSelectedShotNames] = useState<string[]>([]);
  const [selectedThumbName, setSelectedThumbName] = useState<string | null>(null);

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
              <Label htmlFor="thumbnailFile">Thumbnail / Hero Image (JPG/PNG/WebP, max 5 MB)</Label>
              <Input
                id="thumbnailFile"
                name="thumbnailFile"
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setSelectedThumbName(f ? f.name : null);
                }}
              />
              {selectedThumbName ? (
                <p className="text-xs text-primary font-medium">Selected to upload: {selectedThumbName}</p>
              ) : initial?.thumbnail ? (
                <div className="flex items-center gap-3 pt-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={initial.thumbnail} alt="Thumbnail preview" className="h-10 w-16 rounded object-cover border border-border" />
                  <p className="text-xs text-muted-foreground break-all">Current: {initial.thumbnail.split("/").pop()}</p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No thumbnail yet — cards show an analytics icon.</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="screenshotFiles">Dashboard Screenshot Images (JPG/PNG/WebP, max 5 MB each)</Label>
              <Input
                id="screenshotFiles"
                name="screenshotFiles"
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.webp"
                onChange={(e) => {
                  const names = Array.from(e.target.files || []).map((f) => f.name);
                  setSelectedShotNames(names);
                }}
              />
              {selectedShotNames.length > 0 ? (
                <p className="text-xs text-primary font-medium">
                  {selectedShotNames.length} new screenshot{selectedShotNames.length > 1 ? "s" : ""} selected to upload.
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">Select one or more dashboard captures to upload.</p>
              )}
            </div>
          </div>

          {initial && initial.screenshots.length > 0 && (
            <div className="space-y-2 rounded-xl border border-border bg-muted/20 p-4">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary" />
                <span>Uploaded Dashboard Screenshots (check to remove):</span>
              </Label>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                {initial.screenshots.map((url) => (
                  <label key={url} className="relative flex flex-col rounded-lg border border-border bg-card p-2 cursor-pointer hover:border-primary/50 transition-colors">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="Screenshot" className="h-24 w-full rounded object-contain bg-background/50 mb-2" />
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <input type="checkbox" name="removeScreenshots" value={url} className="h-4 w-4 rounded border-border text-destructive focus:ring-destructive" />
                      <span className="truncate flex-1">{url.split("/").pop()}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="datasetUrl">Google Sheets / Dataset URL</Label>
              <Input id="datasetUrl" name="datasetUrl" defaultValue={initial?.datasetUrl ?? ""} placeholder="https://docs.google.com/spreadsheets/..." />
              <FieldError message={fields?.datasetUrl} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="attachmentFiles">Data & Code Files — Excel, CSV, SQL, Python, TXT (max 25 MB each)</Label>
              <Input id="attachmentFiles" name="attachmentFiles" type="file" multiple accept=".xlsx,.xls,.csv,.sql,.py,.txt" />
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

      <div className="flex flex-col items-stretch sm:flex-row sm:items-center sm:justify-end gap-3">
        {!state.ok && state.message && (
          <p className="text-sm text-destructive sm:mr-auto" role="alert">
            {state.message}
          </p>
        )}
        <SubmitButton>{initial ? "Save Changes" : "Create Project"}</SubmitButton>
      </div>
    </AdminForm>
  );
}
