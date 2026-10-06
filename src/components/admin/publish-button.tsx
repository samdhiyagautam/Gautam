"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { setPublishStatus } from "@/actions/admin";

export function PublishButton({
  table,
  id,
  status,
}: {
  table: "experiences" | "projects";
  id: string;
  status: "draft" | "published";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const next = status === "published" ? "draft" : "published";

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={pending}
      aria-label={status === "published" ? "Unpublish (move to draft)" : "Publish"}
      title={status === "published" ? "Unpublish (move to draft)" : "Publish"}
      onClick={() => {
        startTransition(async () => {
          const result = await setPublishStatus(table, id, next);
          if (result.ok) {
            toast.success(result.message);
            router.refresh();
          } else {
            toast.error(result.message);
          }
        });
      }}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : status === "published" ? (
        <EyeOff className="h-4 w-4" />
      ) : (
        <Eye className="h-4 w-4" />
      )}
    </Button>
  );
}
