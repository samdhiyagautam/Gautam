import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Briefcase, Calendar, CheckCircle } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";
import { PublishButton } from "@/components/admin/publish-button";
import { deleteExperience } from "@/actions/admin";
import { getAllExperiences } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Experience",
  description: "Manage your work experience",
};

function formatDateRange(startDate: string, endDate: string | null, isCurrent: boolean): string {
  if (isCurrent) return `${startDate} – Present`;
  return endDate ? `${startDate} – ${endDate}` : startDate;
}

export default async function AdminExperience() {
  const experiences = await getAllExperiences();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Experience</h1>
          <p className="text-muted-foreground">Manage your work experience entries</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin">
              <span>← Dashboard</span>
            </Link>
          </Button>
          <Button variant="premium" asChild>
            <Link href="/admin/experience/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Experience
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 font-medium text-muted-foreground">Role</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Period</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {experiences.map((exp) => (
                  <tr key={exp.id} className="hover:bg-accent/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="font-medium">{exp.designation}</p>
                          <p className="text-sm text-muted-foreground">{exp.company}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDateRange(exp.startDate, exp.endDate, exp.isCurrent)}</span>
                        {exp.isCurrent && <CheckCircle className="h-3 w-3 text-green-500" />}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={exp.status === "published" ? "premium" : "outline"}>{exp.status}</Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" asChild aria-label="Edit experience">
                          <Link href={`/admin/experience/${exp.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <DeleteButton id={exp.id} action={deleteExperience} label="Delete experience" />
                        <PublishButton table="experiences" id={exp.id} status={exp.status} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
