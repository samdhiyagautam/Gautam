import { Card, CardContent } from "@/components/ui/card";

export default function ProjectsLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading projects">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-md bg-muted animate-pulse" />
          <div className="h-4 w-64 rounded-md bg-muted animate-pulse" />
        </div>
        <div className="h-9 w-32 rounded-md bg-muted animate-pulse" />
      </div>
      <Card>
        <CardContent className="p-4 space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
