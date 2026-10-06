import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { Plus, Edit, Trash2, Code, Database, Cpu, Palette, BarChart2, Zap, Layout, Image, MoreVertical } from "lucide-react";
import { SKILL_CATEGORIES, PROFICIENCY_LEVELS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Skills",
  description: "Manage your skills",
};

const SKILLS_DATA = [
  { id: "1", name: "Python", category: "data-analytics", proficiency: "core", description: "Data analysis, automation, scripting", isActive: true, order: 1 },
  { id: "2", name: "Pandas", category: "data-analytics", proficiency: "core", description: "Data manipulation and analysis", isActive: true, order: 2 },
  { id: "3", name: "SQL", category: "data-analytics", proficiency: "core", description: "Querying, optimization, data modeling", isActive: true, order: 3 },
  { id: "4", name: "Power BI", category: "data-analytics", proficiency: "core", description: "Dashboard development, DAX, data visualization", isActive: true, order: 4 },
  { id: "5", name: "Excel", category: "data-analytics", proficiency: "core", description: "Advanced formulas, Power Query, modeling", isActive: true, order: 5 },
  { id: "6", name: "Next.js", category: "web-development", proficiency: "core", description: "Full-stack React framework, App Router", isActive: true, order: 1 },
  { id: "7", name: "React", category: "web-development", proficiency: "core", description: "Component architecture, hooks, state management", isActive: true, order: 2 },
  { id: "8", name: "TypeScript", category: "web-development", proficiency: "core", description: "Type-safe development", isActive: true, order: 3 },
  { id: "9", name: "Supabase", category: "web-development", proficiency: "applied", description: "Backend-as-a-service, auth, database", isActive: true, order: 4 },
  { id: "10", name: "AI-Assisted Development", category: "ai-automation", proficiency: "core", description: "Code generation, debugging, architecture", isActive: true, order: 1 },
  { id: "11", name: "Prompt Engineering", category: "ai-automation", proficiency: "core", description: "Structured prompting for consistent results", isActive: true, order: 2 },
  { id: "12", name: "Canva", category: "creative-technology", proficiency: "core", description: "Design, presentations, brand assets", isActive: true, order: 1 },
  { id: "13", name: "Figma", category: "creative-technology", proficiency: "applied", description: "UI/UX design, prototyping, design systems", isActive: true, order: 2 },
];

const CATEGORY_ICONS = {
  "data-analytics": Database,
  "web-development": Code,
  "ai-automation": Cpu,
  "creative-technology": Palette,
};

function getCategoryIcon(category: string) {
  const Icon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS];
  return Icon ? <Icon className="h-4 w-4 mr-2" /> : <Code className="h-4 w-4 mr-2" />;
}

export default async function AdminSkills() {
  // Auth is enforced by the admin layout.
  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Skills</h1>
            <p className="text-muted-foreground">Manage your skills and proficiency levels</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin">
                <span>← Dashboard</span>
              </Link>
            </Button>
            <Button variant="premium" asChild>
              <Link href="/admin/skills/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Skill
              </Link>
            </Button>
          </div>
        </div>

        {SKILL_CATEGORIES.map((category) => {
          const categorySkills = SKILLS_DATA.filter(s => s.category === category.value);
          return (
            <Card key={category.value}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(category.value)}
                  <CardTitle>{category.label}</CardTitle>
                  <Badge variant="outline" className="text-xs">{categorySkills.length} skills</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 font-medium text-muted-foreground text-sm">Skill</th>
                        <th className="text-left p-3 font-medium text-muted-foreground text-sm">Proficiency</th>
                        <th className="text-left p-3 font-medium text-muted-foreground text-sm">Description</th>
                        <th className="text-left p-3 font-medium text-muted-foreground text-sm">Status</th>
                        <th className="text-left p-3 font-medium text-muted-foreground text-sm">Order</th>
                        <th className="text-right p-3 font-medium text-muted-foreground text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {categorySkills.map((skill) => (
                        <tr key={skill.id} className="hover:bg-accent/50">
                          <td className="p-3 font-medium">{skill.name}</td>
                          <td className="p-3">
                            <Badge variant="outline" className={
                              skill.proficiency === "core" ? "bg-primary/10 text-primary border-primary/20" :
                              skill.proficiency === "applied" ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800" :
                              skill.proficiency === "working-knowledge" ? "bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800" :
                              "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                            }>
                              {skill.proficiency.charAt(0).toUpperCase() + skill.proficiency.slice(1).replace("-", " ")}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm text-muted-foreground max-w-xs truncate">{skill.description}</td>
                          <td className="p-3">
                            <Badge variant={skill.isActive ? "premium" : "outline"}>
                              {skill.isActive ? "Active" : "Hidden"}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">{skill.order}</td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" asChild>
                                <Link href={`/admin/skills/${skill.id}/edit`}>
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button variant="ghost" size="icon" className="text-destructive">
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
          );
        })}

        <div className="text-center text-sm text-muted-foreground">
          <p>Proficiency levels: Core (deep expertise) → Applied (regular use) → Working Knowledge (familiar) → Familiar (basic awareness)</p>
        </div>
      </div>
  );
}