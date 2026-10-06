"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Building2 } from "lucide-react";
import { saveExperience } from "@/actions/admin";
import { SubmitButton, StatusField, FieldError } from "./form-ui";
import type { Experience } from "@/types";

function joinLines(list: string[]): string {
  return list.join("\n");
}

export function ExperienceForm({ initial }: { initial?: Experience | null }) {
  const [state, formAction] = useActionState(saveExperience, { ok: true, message: "" });

  useEffect(() => {
    if (!state.message) return;
    if (state.ok) toast.success(state.message);
    else toast.error(state.message);
  }, [state]);

  const fields = "fields" in state ? state.fields : undefined;

  return (
    <form action={formAction} className="space-y-6">
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle>{initial ? "Edit Experience" : "New Experience"}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Input id="company" name="company" defaultValue={initial?.company ?? ""} required />
              <FieldError message={fields?.company} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="designation">Designation *</Label>
              <Input id="designation" name="designation" defaultValue={initial?.designation ?? ""} required />
              <FieldError message={fields?.designation} />
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input id="startDate" name="startDate" defaultValue={initial?.startDate ?? ""} placeholder="2022-01" required />
              <FieldError message={fields?.startDate} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" name="endDate" defaultValue={initial?.endDate ?? ""} placeholder="Leave empty if current" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayOrder">Order</Label>
              <Input id="displayOrder" name="displayOrder" type="number" min={0} defaultValue={initial?.order ?? 0} />
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="isCurrent">Current Role</Label>
              <p className="text-sm text-muted-foreground">Shows as “Current” with a live badge.</p>
            </div>
            <Switch id="isCurrent" name="isCurrent" defaultChecked={initial?.isCurrent ?? false} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={3} defaultValue={initial?.description ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="responsibilitiesText">Responsibilities (one per line)</Label>
            <Textarea id="responsibilitiesText" name="responsibilitiesText" rows={5} defaultValue={initial ? joinLines(initial.responsibilities) : ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="projectsText">Key Projects (one per line)</Label>
            <Textarea id="projectsText" name="projectsText" rows={4} defaultValue={initial ? joinLines(initial.projects) : ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="technologiesText">Technologies (comma or line separated)</Label>
            <Input id="technologiesText" name="technologiesText" defaultValue={initial ? initial.technologies.join(", ") : ""} />
          </div>
          <StatusField defaultValue={initial?.status ?? "draft"} />
        </CardContent>
      </Card>

      <div className="flex items-center justify-end">
        <SubmitButton>{initial ? "Save Changes" : "Create Experience"}</SubmitButton>
      </div>
    </form>
  );
}
