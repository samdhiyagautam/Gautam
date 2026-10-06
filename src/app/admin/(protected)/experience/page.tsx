import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Edit, Trash2, Briefcase, Calendar, CheckCircle, Clock, MoreVertical } from "lucide-react";

export const metadata: Metadata = {
  title: "Experience",
  description: "Manage your work experience",
};

const EXPERIENCE_DATA = [
  {
    id: "1",
    company: "Dhuri Na Venture Private Limited",
    designation: "Assistant Manager",
    startDate: "2022-01",
    endDate: null,
    isCurrent: true,
    responsibilities: [
      "Lead data analytics initiatives for business decision-making",
      "Design and maintain Power BI dashboards for operational reporting",
      "Automate repetitive workflows using Python and AI-assisted tools",
    ],
    projects: [
      "Executive Dashboard - Real-time KPI monitoring",
      "Sales Analytics Pipeline - Automated data processing",
    ],
    technologies: ["Python", "SQL", "Power BI", "Excel", "Next.js", "React", "Supabase"],
    description: "As Assistant Manager, I bridge business requirements with technical solutions.",
    status: "published" as const,
    order: 1,
  },
  {
    id: "2",
    company: "MAS Educative",
    designation: "[ADD EXACT DESIGNATION]",
    startDate: "[ADD START DATE]",
    endDate: "[ADD END DATE]",
    isCurrent: false,
    responsibilities: [
      "[ADD VERIFIED RESPONSIBILITY 1]",
      "[ADD VERIFIED RESPONSIBILITY 2]",
    ],
    projects: ["[ADD PROJECT 1]"],
    technologies: ["[ADD TECHNOLOGY 1]"],
    description: "[ADD ROLE DESCRIPTION]",
    status: "draft" as const,
    order: 2,
  },
];

export default async function AdminExperience() {
  // Auth is enforced by the admin layout.
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
                    <th className="text-left p-4 font-medium text-muted-foreground">Company</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Period</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Order</th>
                    <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {EXPERIENCE_DATA.map((exp) => (
                    <tr key={exp.id} className="hover:bg-accent/50 transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{exp.designation}</p>
                          <p className="text-sm text-muted-foreground">{exp.company}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Briefcase className="h-4 w-4 text-muted-foreground inline-block mr-1" />
                        <span className="text-sm text-muted-foreground">{exp.company}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-1 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>{formatDateRange(exp.startDate, exp.endDate, exp.isCurrent)}</span>
                          {exp.isCurrent && <CheckCircle className="h-3 w-3 text-green-500" />}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={exp.status === "published" ? "premium" : "outline"}>
                          {exp.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{exp.order}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/experience/${exp.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>Click "Add Experience" to create a new entry. Use placeholders for unverified information.</p>
        </div>
      </div>
  );
}

function formatDateRange(startDate: string, endDate: string | null, isCurrent: boolean): string {
  const format = (date: string) => new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short" });
  const start = format(startDate);
  const end = isCurrent ? "Present" : (endDate ? format(endDate) : "");
  return `${start} - ${end}`;
}