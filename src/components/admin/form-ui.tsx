"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="premium" disabled={pending}>
      {pending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
      {children}
    </Button>
  );
}

export function StatusField({ defaultValue }: { defaultValue: "draft" | "published" }) {
  // Radix Select does not submit with native forms — mirror into a hidden input.
  const [value, setValue] = useState<"draft" | "published">(defaultValue);
  return (
    <div className="space-y-2">
      <Label htmlFor="status-trigger">Status</Label>
      <input type="hidden" name="status" value={value} />
      <Select value={value} onValueChange={(v) => setValue(v as "draft" | "published")}>
        <SelectTrigger id="status-trigger">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="draft">Draft — preview only, not public</SelectItem>
          <SelectItem value="published">Published — visible on the site</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-sm text-destructive" role="alert">
      {message}
    </p>
  );
}

export function ChoiceField({
  name,
  label,
  defaultValue,
  options,
}: {
  name: string;
  label: string;
  defaultValue: string;
  options: { value: string; label: string }[];
}) {
  // Radix Select does not submit with native forms — mirror into a hidden input.
  const [value, setValue] = useState(defaultValue);
  return (
    <div className="space-y-2">
      <Label htmlFor={`${name}-trigger`}>{label}</Label>
      <input type="hidden" name={name} value={value} />
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger id={`${name}-trigger`}>
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
