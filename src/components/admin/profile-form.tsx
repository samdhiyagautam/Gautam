"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { User, Mail, Briefcase } from "lucide-react";
import { saveProfile } from "@/actions/admin";
import { SubmitButton, StatusField, FieldError } from "./form-ui";
import type { Profile } from "@/types";

export function ProfileForm({ initial }: { initial: Profile }) {
  const [state, formAction] = useActionState(saveProfile, { ok: true, message: "" });

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
            <User className="h-5 w-5 text-primary" />
            <CardTitle>Basic Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" name="name" defaultValue={initial.name} required />
              <FieldError message={fields?.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="headline">Professional Headline *</Label>
              <Input id="headline" name="headline" defaultValue={initial.headline} required />
              <FieldError message={fields?.headline} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="heroDescription">Hero Description *</Label>
            <Textarea id="heroDescription" name="heroDescription" rows={3} defaultValue={initial.heroDescription} required />
            <FieldError message={fields?.heroDescription} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="about">About Me *</Label>
            <Textarea id="about" name="about" rows={6} defaultValue={initial.about} required />
            <FieldError message={fields?.about} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-primary" />
            <CardTitle>Contact Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" name="email" type="email" defaultValue={initial.email} required />
              <FieldError message={fields?.email} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={initial.phone} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" defaultValue={initial.location} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn URL</Label>
              <Input id="linkedin" name="linkedin" defaultValue={initial.linkedin} placeholder="https://linkedin.com/in/..." />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="github">GitHub URL</Label>
            <Input id="github" name="github" defaultValue={initial.github} placeholder="https://github.com/..." />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <CardTitle>Settings</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="openToWork">Open to Work</Label>
              <p className="text-sm text-muted-foreground">Show the opportunities badge on the portfolio.</p>
            </div>
            <Switch id="openToWork" name="openToWork" defaultChecked={initial.openToWork} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ctaText">CTA Text</Label>
            <Input id="ctaText" name="ctaText" defaultValue={initial.ctaText} />
          </div>
          <StatusField defaultValue="published" />
        </CardContent>
      </Card>

      <div className="flex items-center justify-end">
        <SubmitButton>Save Profile</SubmitButton>
      </div>
    </form>
  );
}
