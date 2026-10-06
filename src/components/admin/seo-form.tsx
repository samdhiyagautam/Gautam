"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search } from "lucide-react";
import { saveSeo } from "@/actions/admin";
import { SubmitButton, StatusField, ChoiceField, FieldError } from "./form-ui";
import type { SEO } from "@/types";

export function SeoForm({ initial }: { initial?: SEO | null }) {
  const [state, formAction] = useActionState(saveSeo, { ok: true, message: "" });

  useEffect(() => {
    if (!state.message) return;
    if (state.ok) toast.success(state.message);
    else toast.error(state.message);
  }, [state]);

  const fields = "fields" in state ? state.fields : undefined;

  return (
    <form action={formAction} className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-primary" />
            <CardTitle>Search & Social</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pageTitle">Page Title *</Label>
            <Input id="pageTitle" name="pageTitle" defaultValue={initial?.pageTitle ?? ""} required />
            <FieldError message={fields?.pageTitle} />
            <p className="text-xs text-muted-foreground">50–60 characters recommended.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="metaDescription">Meta Description *</Label>
            <Textarea id="metaDescription" name="metaDescription" rows={3} defaultValue={initial?.metaDescription ?? ""} required />
            <FieldError message={fields?.metaDescription} />
            <p className="text-xs text-muted-foreground">150–160 characters recommended.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ogImage">OG Image URL</Label>
              <Input id="ogImage" name="ogImage" defaultValue={initial?.ogImage ?? "/og-image.png"} />
            </div>
            <ChoiceField
              name="twitterCard"
              label="Twitter Card"
              defaultValue={initial?.twitterCard ?? "summary_large_image"}
              options={[
                { value: "summary", label: "Summary" },
                { value: "summary_large_image", label: "Summary with large image" },
              ]}
            />
          </div>
          <StatusField defaultValue="draft" />
        </CardContent>
      </Card>

      <div className="flex items-center justify-end">
        <SubmitButton>Save SEO Settings</SubmitButton>
      </div>
    </form>
  );
}
