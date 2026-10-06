"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/validators";

export function DeleteButton({
  id,
  action,
  label = "Delete",
}: {
  id: string;
  action: (id: string) => Promise<ActionResult>;
  label?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-destructive hover:text-destructive"
      disabled={pending}
      aria-label={label}
      onClick={() => {
        if (!window.confirm("Delete this entry? This cannot be undone.")) return;
        startTransition(async () => {
          const result = await action(id);
          if (result.ok) {
            toast.success(result.message);
            router.refresh();
          } else {
            toast.error(result.message);
          }
        });
      }}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}
