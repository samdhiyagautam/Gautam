"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Code } from "lucide-react";
import { saveSkill } from "@/actions/admin";
import { SubmitButton, ChoiceField, FieldError } from "./form-ui";
import { SKILL_CATEGORIES, PROFICIENCY_LEVELS } from "@/lib/constants";
import type { Skill } from "@/types";

export function SkillForm({ initial }: { initial?: Skill | null }) {
  const [state, formAction] = useActionState(saveSkill, { ok: true, message: "" });

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
            <Code className="h-5 w-5 text-primary" />
            <CardTitle>{initial ? "Edit Skill" : "New Skill"}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Skill Name *</Label>
              <Input id="name" name="name" defaultValue={initial?.name ?? ""} required />
              <FieldError message={fields?.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayOrder">Order</Label>
              <Input id="displayOrder" name="displayOrder" type="number" min={0} defaultValue={initial?.order ?? 0} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <ChoiceField
              name="category"
              label="Category"
              defaultValue={initial?.category ?? "data-analytics"}
              options={SKILL_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
            />
            <ChoiceField
              name="proficiency"
              label="Proficiency"
              defaultValue={initial?.proficiency ?? "familiar"}
              options={PROFICIENCY_LEVELS.map((p) => ({ value: p.value, label: p.label }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={3} defaultValue={initial?.description ?? ""} />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="isActive">Active</Label>
              <p className="text-sm text-muted-foreground">Inactive skills are hidden from the site.</p>
            </div>
            <Switch id="isActive" name="isActive" defaultChecked={initial?.isActive ?? true} />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end">
        <SubmitButton>{initial ? "Save Changes" : "Create Skill"}</SubmitButton>
      </div>
    </form>
  );
}
